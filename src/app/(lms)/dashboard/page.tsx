import { createClient } from '@/lib/supabase/server'
import { MOCK_COURSES, MOCK_CONTENT_ITEMS } from '@/lib/mockData'
import { getUserEnrollments } from '@/lib/api/courses'
import { DashboardClient } from './DashboardClient'

export const metadata = {
  title: 'Dashboard — IT-vate LMS',
}

export default async function StudentDashboardPage() {
  // Fetch real enrollments from Supabase
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Try real data; fall back to mock demo data
  let enrollments = await getUserEnrollments()

  // Build mock enrollment for demo purposes if DB is empty
  const demoEnrollments =
    enrollments.length === 0
      ? [
          {
            enroll_id: 'demo-1',
            enroll_no: 'CPDP202607001',
            track_type: 'Expert',
            status: 'Active',
            levels: {
              level_id: 'l1',
              level_title: MOCK_COURSES[0].levels?.[0]?.level_title,
              courses: {
                course_id: 'c1',
                name: MOCK_COURSES[0].name,
                slug: MOCK_COURSES[0].slug,
                description: MOCK_COURSES[0].description,
                category: MOCK_COURSES[0].category,
              },
            },
            _course: MOCK_COURSES[0],
          },
        ]
      : enrollments

  const userName = user?.email?.split('@')[0] ?? 'Student'

  return (
    <DashboardClient
      enrollments={demoEnrollments}
      userName={userName}
      contentItems={MOCK_CONTENT_ITEMS}
    />
  )
}
