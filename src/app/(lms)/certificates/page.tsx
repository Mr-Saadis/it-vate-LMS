import { createClient } from '@/lib/supabase/server'
import { getActiveCourses } from '@/lib/api/courses'
import { CertificatesClient } from './CertificatesClient'

export const metadata = {
  title: 'Certificates — IT-vate LMS',
}

export default async function CertificatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch ALL Active and Completed enrollments for the user
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      enroll_id,
      enroll_no,
      track_type,
      status,
      approved_at,
      levels (
        level_id,
        level_title,
        no,
        course_id,
        courses ( course_id, name, slug )
      )
    `)
    .eq('user_id', user?.id ?? '')
    .in('status', ['Active', 'Completed'])
    .order('approved_at', { ascending: false })

  const activeCourses = await getActiveCourses()

  // Also fetch user profile for the certificate name
  const { data: userProfile } = await supabase
    .from('users')
    .select('name')
    .eq('user_id', user?.id ?? '')
    .single()

  const userName = userProfile?.name || user?.email?.split('@')[0] || 'Student'

  return (
    <CertificatesClient 
      enrollments={enrollments || []} 
      allCourses={activeCourses}
      userName={userName}
    />
  )
}
