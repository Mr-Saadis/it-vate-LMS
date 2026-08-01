'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MOCK_COURSES } from '@/lib/mockData'

// VULN-05 fix: strict file validation constants
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_TRACK_TYPES = ['Expert', 'Progressive', 'Fast', 'Premium'] as const

export async function submitPayment(formData: FormData) {
  const supabase = await createClient()

  // Auth check — server-side, cannot be bypassed
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  const levelId = formData.get('level_id') as string
  const trackTypeRaw = formData.get('track_type') as string
  const transactionRef = (formData.get('transaction_reference') as string)?.trim()
  const proofFile = formData.get('payment_proof') as File

  // ── Input Validation ───────────────────────────────────────────────────────

  if (!levelId || !transactionRef) {
    return { error: 'Level and transaction reference are required.' }
  }

  // VULN-04 partial fix: validate track type is one of the allowed values
  if (!ALLOWED_TRACK_TYPES.includes(trackTypeRaw as (typeof ALLOWED_TRACK_TYPES)[number])) {
    return { error: 'Invalid track type.' }
  }
  const trackType = trackTypeRaw as (typeof ALLOWED_TRACK_TYPES)[number]

  // VULN-05 fix: validate file type, size, and presence
  if (!proofFile || proofFile.size === 0) {
    return { error: 'Payment proof file is required.' }
  }
  if (!ALLOWED_MIME_TYPES.includes(proofFile.type)) {
    return { error: 'Only JPG, PNG, or WebP images are accepted as payment proof.' }
  }
  if (proofFile.size > MAX_FILE_SIZE_BYTES) {
    return { error: 'Payment proof must be under 5MB.' }
  }

  // VULN-04 fix: look up the REAL price from DB — do NOT trust client-supplied amount
  let levelPrice: number
  let courseId: string

  const { data: level, error: levelError } = await supabase
    .from('levels')
    .select('price, course_id')
    .eq('level_id', levelId)
    .single()

  if (levelError || !level) {
    // Fallback to mock data when DB levels not found (e.g. mock IDs like 'l1')
    const mockLevel = MOCK_COURSES
      .flatMap((c) => (c.levels || []).map((l) => ({ ...l, course_id: c.course_id })))
      .find((l) => l.level_id === levelId)

    if (!mockLevel) {
      return { error: 'Invalid level. Cannot calculate price.' }
    }
    levelPrice = mockLevel.price
    courseId = mockLevel.course_id
  } else {
    levelPrice = level.price
    courseId = level.course_id
  }

  // Calculate canonical price server-side based on track
  let canonicalAmount = levelPrice
  let discount = 0

  if (trackType === 'Expert') {
    // Expert track: sum all levels at 85% discount
    const allLevelIds = (formData.get('levels') as string || '').split(',').filter(Boolean)
    const allLevels = MOCK_COURSES
      .flatMap((c) => (c.levels || []).map((l) => ({ ...l })))
    const selectedLevels = allLevelIds.length > 0
      ? allLevels.filter((l) => allLevelIds.includes(l.level_id))
      : [{ price: levelPrice }]
    const totalPrice = selectedLevels.reduce((sum, l) => sum + l.price, 0)
    discount = Math.round(totalPrice * 0.15)
    canonicalAmount = totalPrice - discount
  } else if (trackType === 'Premium') {
    canonicalAmount = levelPrice + 150
  } else if (trackType === 'Fast') {
    // Fast track: sum selected levels
    const allLevelIds = (formData.get('levels') as string || '').split(',').filter(Boolean)
    const allLevels = MOCK_COURSES
      .flatMap((c) => (c.levels || []).map((l) => ({ ...l })))
    const selectedLevels = allLevelIds.length > 0
      ? allLevels.filter((l) => allLevelIds.includes(l.level_id))
      : [{ price: levelPrice }]
    canonicalAmount = selectedLevels.reduce((sum, l) => sum + l.price, 0)
  }
  // Progressive: just the first level price (default)

  const totalAmount = Math.max(0, canonicalAmount)

  // 1. Upload payment proof to Supabase Storage
  const ext = proofFile.name.split('.').pop()?.toLowerCase() || 'jpg'
  // Use user ID + timestamp to prevent filename guessing
  const fileName = `${user.id}/${Date.now()}.${ext}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('payment-proofs')
    .upload(fileName, proofFile, {
      contentType: proofFile.type,
      upsert: false,
    })

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` }
  }

  // Use signed URL instead of public URL (bucket should be private)
  const { data: signedUrlData } = await supabase.storage
    .from('payment-proofs')
    .createSignedUrl(uploadData.path, 60 * 60 * 24 * 30) // 30-day URL for admin review

  const proofUrl = signedUrlData?.signedUrl ?? uploadData.path

  // ── Ensure User Exists in public.users ─────────────────────────────────────
  // Fix for foreign key constraint violation if public.users row is missing
  const { data: profile } = await supabase.from('users').select('user_id').eq('user_id', user.id).single()
  if (!profile) {
    const { error: insertUserError } = await supabase.from('users').insert({
      user_id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Student',
      role: 'student'
    })
    if (insertUserError) {
      console.error('Failed to create missing public.users record:', insertUserError)
      return { error: 'Failed to synchronize user profile. Please contact support.' }
    }
  }

  // 2. Insert Enrollment record (status: Pending)
  const { data: enrollment, error: enrollError } = await supabase
    .from('enrollments')
    .insert({
      user_id: user.id,
      level_id: levelId,
      status: 'Pending',
      track_type: trackType
    })
    .select()
    .single()

  if (enrollError || !enrollment) {
    return { error: `Enrollment failed: ${enrollError?.message}` }
  }

  // 3. Insert Payment record with server-calculated amounts
  const { data: payment, error: paymentError } = await supabase.from('payments').insert({
    enroll_id: enrollment.enroll_id,
    amount: levelPrice,        // original price
    discount,                    // server-calculated discount
    total_amount: totalAmount,   // final price (server-calculated, not client-supplied)
    payment_method: 'Bank Transfer',
    transaction_reference: transactionRef,
    status: 'Pending',
    payment_proof: proofUrl,
  })
  .select('payment_id')
  .single()

  if (paymentError || !payment) {
    return { error: `Payment record failed: ${paymentError?.message}` }
  }

  // 4. Insert into junction tables (Many-to-Many mapping)
  const { error: enrollCourseErr } = await supabase.from('enrolled_courses').insert({
    enroll_id: enrollment.enroll_id,
    course_id: courseId,
    user_id: user.id
  })
  if (enrollCourseErr) console.error('Failed to link enrolled_courses', enrollCourseErr)

  const { error: paymentCourseErr } = await supabase.from('payment_courses').insert({
    payment_id: payment.payment_id,
    course_id: courseId,
    user_id: user.id
  })
  if (paymentCourseErr) console.error('Failed to link payment_courses', paymentCourseErr)

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/', 'layout')
  
  redirect('/checkout/pending')
}
