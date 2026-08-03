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

  // 2. Get latest content item created_at
  const { data: latestItem } = await supabase
    .from('content_items')
    .select('content_items_id, created_at')
    .eq('level_id', levelId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const dateToUse = latestItem?.created_at ? new Date(latestItem.created_at) : new Date()
  const year = dateToUse.getFullYear().toString()
  const month = String(dateToUse.getMonth() + 1).padStart(2, '0')

  const batchId = `${slug}${year}${month}L${levelNo}`
  return { batchId, contentItemId: latestItem?.content_items_id || null }
}

export async function getBatchPreviewAction(enrollId: string) {
  const supabase = await createClient()

  const { data: enrollData } = await supabase
    .from('enrollments')
    .select('level_id')
    .eq('enroll_id', enrollId)
    .single()

  if (!enrollData?.level_id) return 'UNKNOWN'

  const { batchId } = await computeBatchId(supabase, enrollData.level_id)
  return batchId || 'UNKNOWN'
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
  const enrollId = formData.get('enroll_id') as string

  if (!paymentId || !enrollId) {
    return { error: 'Missing payment_id or enroll_id.' }
  }

  // 1. Get the level_id for this enrollment
  const { data: currentEnroll } = await supabase
    .from('enrollments')
    .select('level_id')
    .eq('enroll_id', enrollId)
    .single()

  if (!currentEnroll) {
    return { error: 'Enrollment not found.' }
  }

  // 2. Compute Batch ID dynamically
  const { batchId, contentItemId } = await computeBatchId(supabase, currentEnroll.level_id)

  if (!batchId) {
    return { error: 'Failed to generate batch ID.' }
  }

  // Update payment status → Verified
  const { error: payErr } = await supabase
    .from('payments')
    .update({ status: 'Verified', verified_by: user.id, verified_at: new Date().toISOString() })
    .eq('payment_id', paymentId)

  if (payErr) return { error: payErr.message }

  // Update enrollment status → Active + assign enroll_no and content_items_id
  const { error: enrollErr } = await supabase
    .from('enrollments')
    .update({ 
      status: 'Active', 
      enroll_no: batchId, 
      content_items_id: contentItemId,
      approved_at: new Date().toISOString() 
    })
    .eq('enroll_id', enrollId)

  if (enrollErr) {
    return { error: enrollErr.message }
  }

  revalidatePath('/admin')
  return { success: true, enrollNo: batchId }
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
  const enrollId = formData.get('enroll_id') as string
  const reason = (formData.get('reason') as string) || 'Payment could not be verified.'

  if (!paymentId || !enrollId) {
    return { error: 'Missing payment_id or enroll_id.' }
  }

  await supabase
    .from('payments')
    .update({ status: 'Rejected', verified_by: user.id, verified_at: new Date().toISOString() })
    .eq('payment_id', paymentId)

  await supabase
    .from('enrollments')
    .update({ status: 'Rejected', rejected_reason: reason })
    .eq('enroll_id', enrollId)

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
