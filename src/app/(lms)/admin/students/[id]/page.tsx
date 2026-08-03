import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getStudentById } from '@/lib/api/admin'
import { StudentDetailClient } from './StudentDetailClient'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const student = await getStudentById(id)
  return {
    title: student
      ? `${student.name} — Student Detail | IT-vate LMS`
      : 'Student Not Found | IT-vate LMS',
  }
}

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Verify admin role
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const student = await getStudentById(id)
  if (!student) notFound()

  return <StudentDetailClient student={student} />
}
