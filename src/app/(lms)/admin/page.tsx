import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getPendingPayments } from '@/lib/api/courses'
import { MOCK_PENDING_PAYMENTS } from '@/lib/mockData'
import { AdminClient } from './AdminClient'

export const metadata = {
  title: 'Admin — Payment Verification | IT-vate LMS',
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

  // Fetch real pending payments; fall back to mock for demo
  const realPayments = await getPendingPayments()

  // Normalise shape for AdminClient
  const payments =
    realPayments.length > 0
      ? realPayments.map((p: any) => ({
          payment_id: p.payment_id,
          enroll_id: p.enrollments?.enroll_id ?? p.enroll_id,
          user_name: p.enrollments?.users?.name ?? 'Unknown',
          user_email: p.enrollments?.users?.email ?? '',
          course_name: p.enrollments?.levels?.courses?.name ?? 'Unknown Course',
          track_type: p.enrollments?.track_type ?? 'Expert',
          amount: p.amount,
          discount: p.discount,
          total_amount: p.total_amount,
          transaction_reference: p.transaction_reference,
          status: p.status,
          payment_proof: p.payment_proof,
          created_at: p.created_at,
        }))
      : MOCK_PENDING_PAYMENTS.map((p) => ({
          payment_id: p.payment_id,
          enroll_id: p.enroll_id,
          user_name: p.user_name,
          user_email: p.user_email,
          course_name: p.course_name,
          track_type: p.track_type,
          amount: p.amount,
          discount: p.discount,
          total_amount: p.total_amount,
          transaction_reference: p.transaction_reference,
          status: p.status,
          payment_proof: p.payment_proof,
          created_at: p.created_at ?? '',
        }))

  return <AdminClient payments={payments} />
}
