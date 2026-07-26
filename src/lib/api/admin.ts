import { MOCK_PENDING_PAYMENTS } from '@/lib/mockData'

export async function fetchPendingPayments() {
  try {
    const res = await fetch('/api/admin/verify', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (data.payments) return data.payments
    }
  } catch (err) {
    console.warn('API /api/admin/verify fetch fallback:', err)
  }

  if (typeof window !== 'undefined') {
    const local = JSON.parse(localStorage.getItem('itvate_pending_payments') || '[]')
    return [...local, ...MOCK_PENDING_PAYMENTS]
  }

  return MOCK_PENDING_PAYMENTS
}

export async function approvePaymentAndGenerateCPDP(paymentId: string, seqIndex: number) {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const seqNo = String(seqIndex + 1).padStart(3, '0')
  const cpdpId = `CPDP${year}${month}${seqNo}`

  try {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_id: paymentId, enroll_no: cpdpId }),
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    console.warn('API approve error fallback:', err)
  }

  return { success: true, payment_id: paymentId, enroll_no: cpdpId }
}
