import { NextResponse } from 'next/server'
import { Enrollment, Payment, EnrolledCourse, PaymentCourse } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      user_id = 'usr-' + Date.now(),
      course_id = 'c1',
      level_id = 'l1',
      amount = 600,
      discount = 60,
      total_amount = 540,
      payment_method = 'Bank Transfer',
      transaction_reference = 'TRX-' + Date.now(),
      payment_proof = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
    } = body

    const enroll_id = 'enr-' + Date.now()
    const payment_id = 'pay-' + Date.now()

    const newEnrollment: Enrollment = {
      enroll_id,
      user_id,
      level_id,
      status: 'Pending',
      enrolled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const newPayment: Payment = {
      payment_id,
      created_at: new Date().toISOString(),
      user_id,
      amount,
      discount,
      total_amount,
      payment_method,
      transaction_reference,
      status: 'Pending',
      payment_proof,
    }

    const enrolledCourseRecord: EnrolledCourse = {
      enroll_id,
      course_id,
      user_id,
    }

    const paymentCourseRecord: PaymentCourse = {
      course_id,
      payment_id,
      user_id,
    }

    return NextResponse.json({
      success: true,
      enrollment: newEnrollment,
      payment: newPayment,
      enrolled_course: enrolledCourseRecord,
      payment_course: paymentCourseRecord,
    })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Checkout submission failed' },
      { status: 400 }
    )
  }
}
