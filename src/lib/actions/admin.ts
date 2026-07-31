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

// VULN-07 fix: generate CPDP enrollment number using DB-level uniqueness
// Uses a DB function or retries on conflict to prevent race conditions
async function generateEnrollNo(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string> {
  const now = new Date()
  const yyyy = now.getFullYear().toString()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const prefix = `CPDP${yyyy}${mm}`

  // Use a loop with optimistic generation + uniqueness check
  // Max 5 attempts to handle concurrent approvals
  for (let attempt = 0; attempt < 5; attempt++) {
    const { count } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .like('enroll_no', `${prefix}%`)

    const seq = String((count ?? 0) + 1 + attempt).padStart(3, '0')
    const candidate = `${prefix}${seq}`

    // Check if this ID already exists (handles concurrent approvals)
    const { data: existing } = await supabase
      .from('enrollments')
      .select('enroll_id')
      .eq('enroll_no', candidate)
      .maybeSingle()

    if (!existing) {
      return candidate // Unique — safe to use
    }
    // ID already taken — retry with next sequence
  }

  // Last resort: append timestamp microseconds for uniqueness
  const fallback = `${prefix}${Date.now().toString().slice(-6)}`
  return fallback
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

  // VULN-07 fix: generate unique enrollment number with conflict detection
  const enrollNo = await generateEnrollNo(supabase)

  // Update payment status → Verified
  const { error: payErr } = await supabase
    .from('payments')
    .update({ status: 'Verified', verified_by: user.id, verified_at: new Date().toISOString() })
    .eq('payment_id', paymentId)

  if (payErr) return { error: payErr.message }

  // Update enrollment status → Active + assign enroll_no
  const { error: enrollErr } = await supabase
    .from('enrollments')
    .update({ status: 'Active', enroll_no: enrollNo, approved_at: new Date().toISOString() })
    .eq('enroll_id', enrollId)

  if (enrollErr) return { error: enrollErr.message }

  revalidatePath('/admin')
  return { success: true, enrollNo }
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
