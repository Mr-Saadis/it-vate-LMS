import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCourseByIdAdmin } from '@/lib/api/courses'
import { CourseDetailClient } from './CourseDetailClient'

export const metadata = {
  title: 'Admin — Course Details | IT-vate LMS',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminCourseDetailPage({ params }: PageProps) {
  const { id } = await params

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

  const course = await getCourseByIdAdmin(id)
  
  if (!course) {
    redirect('/admin/courses')
  }

  return <CourseDetailClient course={course} />
}
