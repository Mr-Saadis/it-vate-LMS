import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MOCK_CONTENT_ITEMS } from '@/lib/mockData'
import { getUserEnrollments, getAllUserEnrollmentsStatus } from '@/lib/api/courses'
import { DashboardClient } from './DashboardClient'

export const metadata = {
  title: 'Dashboard — IT-vate LMS',
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

  // 1. Fetch all enrollment statuses to understand the user's state
  const allEnrollments = await getAllUserEnrollmentsStatus()

  if (!allEnrollments || allEnrollments.length === 0) {
    // No enrollment yet — redirect to courses page so they can enroll
    redirect('/')
  }

  // 2. Fetch real active enrollments from Supabase
  const activeEnrollments = await getUserEnrollments()

  // 3. If they have NO active enrollments, but they have pending/rejected ones
  if (activeEnrollments.length === 0) {
    // Waiting area for pending/rejected enrollments
    redirect('/enrollment-status')
  }

  const userName = user?.email?.split('@')[0] ?? 'Student'

  return (
    <DashboardClient
      enrollments={activeEnrollments}
      userName={userName}
      contentItems={MOCK_CONTENT_ITEMS}
      showApprovedBanner={approved_banner === 'true'}
    />
  )
}
