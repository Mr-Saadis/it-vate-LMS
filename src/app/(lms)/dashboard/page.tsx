import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserEnrollments, getAllUserEnrollmentsStatus, getActiveCourses } from '@/lib/api/courses'
import { getUserFullProfile } from '@/lib/api/users'
import { DashboardClient } from './DashboardClient'

export const metadata = {
  title: 'My Trainings — PDAT Academy',
}

interface PageProps {
  searchParams: Promise<{ approved_banner?: string }>
}

export default async function StudentDashboardPage({ searchParams }: PageProps) {
  const { approved_banner } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all enrollment statuses to understand the user's state
  const allEnrollments = await getAllUserEnrollmentsStatus()

  if (!allEnrollments || allEnrollments.length === 0) {
    // No enrollment yet — redirect to courses page so they can enroll
    redirect('/')
  }

  // Fetch real active enrollments from Supabase
  const activeEnrollments = await getUserEnrollments()

  // If they have NO active enrollments, but they have pending/rejected ones
  if (activeEnrollments.length === 0) {
    // Waiting area for pending/rejected enrollments
    redirect('/enrollment-status')
  }

  // Fetch all active courses to build the full timeline
  const activeCourses = await getActiveCourses()

  // Fetch full user profile
  const userProfile = await getUserFullProfile()
  const userName = userProfile?.name || user?.email?.split('@')[0] || 'Student'

  return (
    <DashboardClient
      enrollments={activeEnrollments}
      allCourses={activeCourses}
      userProfile={userProfile}
      userName={userName}
      userEmail={userProfile?.email || user.email || ''}
      userJoinedAt={userProfile?.created_at || user.created_at}
      showApprovedBanner={approved_banner === 'true'}
    />
  )
}
