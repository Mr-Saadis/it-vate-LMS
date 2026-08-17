'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Helper: verify caller is an authenticated admin
// Returns user if valid admin, or returns an error object
async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, error: 'Unauthenticated' as const }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { user: null, error: 'Unauthorized: admin access required.' as const }
  }

  return { user, error: null }
}

// Helper: compute batch ID
async function computeBatchId(supabase: Awaited<ReturnType<typeof createClient>>, levelId: string) {
  // 1. Get course slug and level no
  const { data: levelData } = await supabase
    .from('levels')
    .select('no, courses(slug)')
    .eq('level_id', levelId)
    .single()

  if (!levelData) return { batchId: null, contentItemId: null }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const slug = (levelData.courses as any)?.slug?.toUpperCase() || 'CRS'
  const levelNo = levelData.no

  // 2. Get latest batch (item with start/end dates)
  const { data: latestItem } = await supabase
    .from('content_items')
    .select('content_items_id, title')
    .eq('level_id', levelId)
    .not('start_date', 'is', null)
    .not('end_date', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestItem?.title) {
    return { batchId: latestItem.title, contentItemId: latestItem.content_items_id }
  }

  // Fallback if no batch link exists
  const dateToUse = new Date()
  const year = dateToUse.getFullYear().toString()
  const month = String(dateToUse.getMonth() + 1).padStart(2, '0')

  const batchId = `${slug}${year}${month}L${levelNo}`
  return { batchId, contentItemId: null }
}

// Helper: generate student roll number like PDAT-202608-001
async function generateStudentRollNo(supabase: Awaited<ReturnType<typeof createClient>>) {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const prefix = `PDAT-${year}${month}-`

  // Find highest roll number for this month
  const { data } = await supabase
    .from('enrollments')
    .select('enroll_no')
    .like('enroll_no', `${prefix}%`)
    .order('enroll_no', { ascending: false })
    .limit(1)
    .maybeSingle()

  let nextSeq = 1
  if (data && data.enroll_no) {
    const lastSeqStr = data.enroll_no.replace(prefix, '')
    const lastSeq = parseInt(lastSeqStr, 10)
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1
    }
  }

  return `${prefix}${String(nextSeq).padStart(3, '0')}`
}

export async function getAvailableBatchesAction(enrollId: string) {
  const supabase = await createClient()

  const { data: enrollData } = await supabase
    .from('enrollments')
    .select('level_id')
    .eq('enroll_id', enrollId)
    .single()

  if (!enrollData?.level_id) return []

  const { data: batches } = await supabase
    .from('content_items')
    .select('content_items_id, title')
    .eq('level_id', enrollData.level_id)
    .not('start_date', 'is', null)
    .not('end_date', 'is', null)
    .order('created_at', { ascending: false })

  return batches || []
}

// ─── Approve Payment ──────────────────────────────────────────────────────────
export async function approvePayment(formData: FormData) {
  const supabase = await createClient()

  // VULN-03 fix: consistent admin guard (same pattern in approve AND reject)
  const { user, error: authError } = await requireAdmin(supabase)
  if (authError || !user) {
    if (authError === 'Unauthenticated') redirect('/login')
    return { error: authError }
  }

  const paymentId = formData.get('payment_id') as string
  const newBatchId = formData.get('new_batch_id') as string | null
  const changeReason = formData.get('batch_change_reason') as string | null

  if (!paymentId) {
    return { error: 'Missing payment_id.' }
  }

  // 1. Get all enrollments linked to this payment
  const { data: paymentLinks, error: linksError } = await supabase
    .from('payment_enrollments')
    .select('enroll_id')
    .eq('payment_id', paymentId)

  if (linksError || !paymentLinks || paymentLinks.length === 0) {
    return { error: 'No enrollments found for this payment.' }
  }

  const enrollIds = paymentLinks.map(p => p.enroll_id)

  // Update payment status → Verified
  const { error: payErr } = await supabase
    .from('payments')
    .update({ 
      status: 'Verified', 
      verified_by: user.id, 
      verified_at: new Date().toISOString(),
      ...(changeReason && changeReason.trim().length > 0 ? { notes: changeReason.trim() } : {})
    })
    .eq('payment_id', paymentId)

  if (payErr) return { error: payErr.message }

  const approvedBatchIds: string[] = []

  // Update all associated enrollments
  for (const eId of enrollIds) {
    const { data: currentEnroll } = await supabase
      .from('enrollments')
      .select('level_id, user_id, content_items_id, track_type')
      .eq('enroll_id', eId)
      .single()

    if (currentEnroll) {
      // 1. Fetch existing Roll Number for this student, or generate a new one
      let studentRollNo = null;
      const { data: existingRoll } = await supabase
        .from('enrollments')
        .select('enroll_no')
        .eq('user_id', currentEnroll.user_id)
        .not('enroll_no', 'is', null)
        .limit(1)
        .maybeSingle()

      if (existingRoll && existingRoll.enroll_no) {
        studentRollNo = existingRoll.enroll_no
      } else {
        // Generate a new Roll Number (e.g. PDAT-202608-001)
        studentRollNo = await generateStudentRollNo(supabase)
      }

      // 2. Compute the Batch ID mapping
      let finalContentItemId = currentEnroll.content_items_id
      let finalBatchTitle = 'Unknown Batch'

      // Check if the explicitly provided newBatchId belongs to THIS enrollment's level
      if (newBatchId) {
        const { data: bData } = await supabase
          .from('content_items')
          .select('level_id, title')
          .eq('content_items_id', newBatchId)
          .single()

        if (bData && bData.level_id === currentEnroll.level_id) {
          finalContentItemId = newBatchId
          finalBatchTitle = bData.title
        }
      }

      // If we STILL don't have a batch, but this is Level 1, we try to compute it as a fallback
      if (!finalContentItemId) {
         if (currentEnroll.track_type === 'Premium') {
           finalContentItemId = null
           finalBatchTitle = 'Premium Access (No Batch)'
         } else {
           const { data: levelData } = await supabase.from('levels').select('no').eq('level_id', currentEnroll.level_id).single()
           if (levelData?.no === 1) {
             const { batchId, contentItemId } = await computeBatchId(supabase, currentEnroll.level_id)
             finalContentItemId = contentItemId
             finalBatchTitle = batchId || 'Unknown Batch'
           } else {
             finalContentItemId = null
             finalBatchTitle = 'Pending Selection'
           }
         }
      } else if (finalContentItemId && finalContentItemId !== newBatchId) {
         // If we used the original content_items_id, fetch its title
         const { data: bData } = await supabase.from('content_items').select('title').eq('content_items_id', finalContentItemId).single()
         if (bData?.title) finalBatchTitle = bData.title
      }
      
      await supabase
        .from('enrollments')
        .update({ 
          status: 'Active', 
          enroll_no: studentRollNo, // Set the Roll Number
          content_items_id: finalContentItemId, // Set the explicitly selected Batch ID
          approved_at: new Date().toISOString(),
          ...(finalContentItemId !== currentEnroll.content_items_id && changeReason ? { rejected_reason: changeReason.trim() } : {})
        })
        .eq('enroll_id', eId)
        
      approvedBatchIds.push(finalBatchTitle)
    }
  }

  revalidatePath('/admin')
  const uniqueBatchIds = Array.from(new Set(approvedBatchIds))
  return { success: true, enrollNo: uniqueBatchIds.join(', ') }
}

// ─── Reject Payment ──────────────────────────────────────────────────────────
export async function rejectPayment(formData: FormData) {
  const supabase = await createClient()

  // VULN-03 fix: requireAdmin guard was missing here before
  const { user, error: authError } = await requireAdmin(supabase)
  if (authError || !user) {
    if (authError === 'Unauthenticated') redirect('/login')
    return { error: authError }
  }

  const paymentId = formData.get('payment_id') as string
  const reason = (formData.get('reason') as string) || 'Payment could not be verified.'

  if (!paymentId) {
    return { error: 'Missing payment_id.' }
  }

  const { data: paymentLinks } = await supabase
    .from('payment_enrollments')
    .select('enroll_id')
    .eq('payment_id', paymentId)

  const enrollIds = paymentLinks ? paymentLinks.map(p => p.enroll_id) : []

  await supabase
    .from('payments')
    .update({ status: 'Rejected', verified_by: user.id, verified_at: new Date().toISOString() })
    .eq('payment_id', paymentId)

  if (enrollIds.length > 0) {
    await supabase
      .from('enrollments')
      .update({ status: 'Rejected', rejected_reason: reason })
      .in('enroll_id', enrollIds)
  }

  revalidatePath('/admin')
  return { success: true }
}
// ─── Completion Toggles ────────────────────────────────────────────────────────

export async function toggleContentItemCompletionAction(itemId: string, isCompleted: boolean) {
  const supabase = await createClient()
  const { user, error: authError } = await requireAdmin(supabase)
  
  if (authError || !user) {
    return { error: authError || 'Unauthenticated' }
  }

  const { error } = await supabase
    .from('content_items')
    .update({ is_completed: isCompleted })
    .eq('content_items_id', itemId)

  if (error) return { error: error.message }
  
  revalidatePath('/admin')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function toggleEnrollmentCompletionAction(enrollId: string, isCompleted: boolean) {
  const supabase = await createClient()
  const { user, error: authError } = await requireAdmin(supabase)
  
  if (authError || !user) {
    return { error: authError || 'Unauthenticated' }
  }

  const { error } = await supabase
    .from('enrollments')
    .update({ is_completed: isCompleted })
    .eq('enroll_id', enrollId)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/students')
  revalidatePath('/dashboard')
  return { success: true }
}
