import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudentsClient } from './StudentsClient'
import { getAllStudents } from '@/lib/api/admin'

export const metadata = {
  title: 'Admin — Enrolled Students | PDAT Academy',
}

export default async function AdminStudentsPage() {
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

  // Fetch actual student data
  const students = await getAllStudents()

  return <StudentsClient students={students} />
}
