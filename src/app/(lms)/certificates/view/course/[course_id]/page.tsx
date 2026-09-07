import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CertificateClient } from '../../CertificateClient'

export const metadata = {
  title: 'Course Certificate — PDAT Academy',
}

interface PageProps {
  params: Promise<{ course_id: string }>
}

export default async function CourseCertificatePage({ params }: PageProps) {
  const { course_id } = await params

  if (!course_id) {
    redirect('/certificates')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // First fetch the course to ensure it exists and to get total levels
  const { data: course } = await supabase
    .from('courses')
    .select(`
      name,
      slug,
      levels ( level_id )
    `)
    .eq('course_id', course_id)
    .single()

  if (!course) {
    redirect('/certificates')
  }

  const totalLevels = course.levels?.length || 0

  // Fetch all completed enrollments for this course for this user
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      enroll_no,
      status,
      approved_at,
      levels!inner ( course_id )
    `)
    .eq('user_id', user?.id ?? '')
    .eq('status', 'Completed')
    .eq('levels.course_id', course_id)

  const completedCount = enrollments?.length || 0

  // Verify the user has completed ALL levels
  if (totalLevels === 0 || completedCount !== totalLevels) {
    redirect('/certificates')
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('name')
    .eq('user_id', user?.id ?? '')
    .single()

  const userName = userProfile?.name || user?.email?.split('@')[0] || 'Student'
  
  // Use the most recent approval date for the certificate date
  const sortedEnrollments = [...(enrollments || [])].sort(
    (a, b) => new Date(b.approved_at || 0).getTime() - new Date(a.approved_at || 0).getTime()
  )
  const issueDate = sortedEnrollments[0]?.approved_at || new Date().toISOString()
  const certificateId = sortedEnrollments[0]?.enroll_no || course_id.substring(0, 8)

  return (
    <CertificateClient 
      type="course"
      studentName={userName}
      courseName={course.name}
      issueDate={issueDate}
      certificateId={`CRS-${certificateId}`}
    />
  )
}
