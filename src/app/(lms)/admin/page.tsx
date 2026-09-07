import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAllAdminPayments } from '@/lib/api/courses'
import { AdminClient } from './AdminClient'

export const metadata = {
  title: 'Admin — Payment Verification | PDAT Academy',
}

export default async function AdminVerificationPage() {
  // Verify admin role
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch real payments
  const realPayments = await getAllAdminPayments()

  // Normalise shape for AdminClient
  const payments = realPayments.map((p: any) => {
    const firstEnrollment = p.payment_enrollments?.[0]?.enrollments;
    return {
      payment_id: p.payment_id,
      enroll_id: firstEnrollment?.enroll_id ?? null,
      user_name: p.users?.name ?? 'Unknown',
      user_email: p.users?.email ?? '',
      course_name: firstEnrollment?.levels?.courses?.name ?? 'Unknown Course',
      track_type: firstEnrollment?.track_type ?? 'Expert',
      batch_title: firstEnrollment?.content_items?.title ?? null,
      batch_id: firstEnrollment?.content_items_id ?? null,
      amount: p.amount,
      discount: p.discount,
      total_amount: p.total_amount,
      transaction_reference: p.transaction_reference,
      status: p.status,
      payment_proof: p.payment_proof,
      created_at: p.created_at,
      rejected_reason: firstEnrollment?.rejected_reason ?? null,
    };
  })

  return <AdminClient payments={payments} />
}
