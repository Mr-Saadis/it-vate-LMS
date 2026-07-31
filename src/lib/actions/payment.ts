'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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
  const { data: level, error: levelError } = await supabase
    .from('levels')
    .select('price, course_id')
    .eq('level_id', levelId)
    .single()

  if (levelError || !level) {
    return { error: 'Invalid level. Cannot calculate price.' }
  }

  // Calculate canonical price server-side based on track
  // For simplicity: Expert=all levels at 85%, Progressive=level price, Fast=level price, Premium=+150
  // In production this would fetch all selected level IDs and sum them
  let canonicalAmount = level.price
  let discount = 0

  if (trackType === 'Expert') {
    discount = Math.round(level.price * 0.15)
    canonicalAmount = level.price - discount
  } else if (trackType === 'Premium') {
    canonicalAmount = level.price + 150
  }

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

  // 2. Insert Enrollment record (status: Pending)
  const { data: enrollment, error: enrollError } = await supabase
    .from('enrollments')
    .insert({
      user_id: user.id,
      level_id: levelId,
      track_type: trackType,
      status: 'Pending',
    })
    .select('enroll_id')
    .single()

  if (enrollError || !enrollment) {
    return { error: `Enrollment failed: ${enrollError?.message}` }
  }

  // 3. Insert Payment record with server-calculated amounts
  const { data: payment, error: paymentError } = await supabase.from('payments').insert({
    enroll_id: enrollment.enroll_id,
    amount: level.price,        // original price
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
    course_id: level.course_id,
    user_id: user.id
  })
  if (enrollCourseErr) console.error('Failed to link enrolled_courses', enrollCourseErr)

  const { error: paymentCourseErr } = await supabase.from('payment_courses').insert({
    payment_id: payment.payment_id,
    course_id: level.course_id,
    user_id: user.id
  })
  if (paymentCourseErr) console.error('Failed to link payment_courses', paymentCourseErr)

  redirect('/checkout/pending')
}
