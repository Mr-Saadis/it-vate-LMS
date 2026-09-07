import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminCoursesClient } from './AdminCoursesClient'
import { getAllCoursesWithLevelsAdmin } from '@/lib/api/courses'

export const metadata = {
  title: 'Admin — Courses Management | PDAT Academy',
}

export default async function AdminCoursesPage() {
  // Verify admin role
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const initialCourses = await getAllCoursesWithLevelsAdmin()

  return <AdminCoursesClient initialCourses={initialCourses} />
}
