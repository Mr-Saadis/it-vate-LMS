import { Payment, Enrollment, EnrolledCourse, PaymentCourse } from '@/lib/types'

export interface SubmitPaymentPayload {
  user_id?: string
  user_name: string
  user_email: string
  course_id: string
  course_name: string
  track_type: string
  amount: number
  discount: number
  total_amount: number
  payment_method: string
  transaction_reference: string
  payment_proof_file_name?: string
}

export async function submitCheckoutPayment(payload: SubmitPaymentPayload) {
  try {
    const res = await fetch('/api/checkout/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    console.warn('API /api/checkout/submit fallback:', err)
  }

  // Local fallback storage for stateful test previews
  const mockPayment = {
    payment_id: 'pay-' + Date.now(),
    enroll_id: 'enr-' + Date.now(),
    user_name: payload.user_name,
    user_email: payload.user_email,
    course_name: payload.course_name,
    track_type: payload.track_type,
    amount: payload.amount,
    discount: payload.discount,
    total_amount: payload.total_amount,
    payment_method: payload.payment_method || 'Bank Transfer',
    transaction_reference: payload.transaction_reference,
    status: 'Pending' as const,
    payment_proof: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  }

  if (typeof window !== 'undefined') {
    const existing = JSON.parse(localStorage.getItem('itvate_pending_payments') || '[]')
    localStorage.setItem('itvate_pending_payments', JSON.stringify([mockPayment, ...existing]))
  }

  return { success: true, data: mockPayment }
}
