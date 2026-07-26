import { NextResponse } from 'next/server'
import { MOCK_COURSES } from '@/lib/mockData'

export async function GET() {
  return NextResponse.json({
    success: true,
    courses: MOCK_COURSES,
  })
}
