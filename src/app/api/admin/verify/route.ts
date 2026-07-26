import { NextResponse } from 'next/server'
import { MOCK_PENDING_PAYMENTS } from '@/lib/mockData'

export async function GET() {
  return NextResponse.json({
    success: true,
    payments: MOCK_PENDING_PAYMENTS,
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { payment_id, enroll_no, verified_by = 'usr-admin-01' } = body

    const verified_at = new Date().toISOString()

    return NextResponse.json({
      success: true,
      payment_id,
      status: 'Verified',
      enroll_no,
      verified_by,
      verified_at,
    })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 400 }
    )
  }
}
