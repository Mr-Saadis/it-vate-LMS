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
  
  // Fetch all levels for the course from DB to calculate prices correctly
  const { data: courseLevels } = await supabase
    .from('levels')
    .select('level_id, price')
    .eq('course_id', courseId)

  const dbLevels = courseLevels || []
  let levelIdsToEnroll = [levelId]

  const passedLevels = (formData.get('levels') as string || '').split(',').filter(Boolean)
  if (trackType === 'Expert') {
    // Expert track: sum all levels at 85% discount (15% off)
    const totalPrice = dbLevels.reduce((sum, l) => sum + Number(l.price), 0)
    
    if (totalPrice > 0) {
      discount = Math.round(totalPrice * 0.15)
      canonicalAmount = totalPrice - discount
      levelIdsToEnroll = dbLevels.map(l => l.level_id)
    } else {
      // Fallback
      canonicalAmount = levelPrice * 5 * 0.85 
    }
  } else if (trackType === 'Premium') {
    canonicalAmount = Number(levelPrice) + 150
  } else if (trackType === 'Fast') {
    // Fast track: sum selected levels
    if (passedLevels.length > 0) {
      const selectedLevels = dbLevels.filter(l => passedLevels.includes(l.level_id))
      canonicalAmount = selectedLevels.reduce((sum, l) => sum + Number(l.price), 0)
      levelIdsToEnroll = passedLevels
    }
  }
  // Progressive: just the first level price (default)

  let baseAmountForCoupon = canonicalAmount
  let couponDiscount = 0
  const couponId = formData.get('coupon_id') as string | null

  if (couponId) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('discount_percentage, used_count')
      .eq('coupon_id', couponId)
      .single()
      
    if (coupon) {
      couponDiscount = Math.round(baseAmountForCoupon * (Number(coupon.discount_percentage) / 100))
      
      // Increment usage count
      await supabase
        .from('coupons')
        .update({ used_count: coupon.used_count + 1 })
        .eq('coupon_id', couponId)
    }
  }

  const totalDiscount = discount + couponDiscount
  const totalAmount = Math.max(0, canonicalAmount - couponDiscount)

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

  // 3. Create all Enrollments (status: Pending)
  const enrollmentsData = levelIdsToEnroll.map(id => ({
    user_id: user.id,
    level_id: id,
    status: 'Pending',
    track_type: trackType
  }))

  const { data: createdEnrollments, error: enrollError } = await supabase
    .from('enrollments')
    .insert(enrollmentsData)
    .select('enroll_id')

  if (enrollError || !createdEnrollments || createdEnrollments.length === 0) {
    return { error: `Enrollment failed: ${enrollError?.message}` }
  }

  // 4. Insert Payment record (no enroll_id, includes user_id)
  const { data: payment, error: paymentError } = await supabase.from('payments').insert({
    user_id: user.id,
    coupon_id: couponId || null,
    amount: canonicalAmount + discount,        // original price
    discount: totalDiscount,                   // server-calculated discount
    total_amount: totalAmount,                 // final price
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

  // 5. Link Payment to all created Enrollments
  const paymentEnrollmentsData = createdEnrollments.map(enroll => ({
    payment_id: payment.payment_id,
    enroll_id: enroll.enroll_id
  }))

  const { error: linkErr } = await supabase
    .from('payment_enrollments')
    .insert(paymentEnrollmentsData)

  if (linkErr) {
    console.error('Failed to link payment to enrollments', linkErr)
    return { error: `Payment linking failed: ${linkErr.message}` }
  }

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/', 'layout')
  
  redirect('/checkout/pending')
}
