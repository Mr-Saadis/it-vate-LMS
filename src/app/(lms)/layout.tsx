import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LMSSidebar } from '@/components/lms/Sidebar'

export const metadata = {
  title: 'IT-vate LMS — Student Dashboard',
  description: 'Access your enrolled courses, learning materials, and certificates.',
}

export default async function LMSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side auth protection
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile for sidebar
  const { data: profile } = await supabase
    .from('users')
    .select('name, role')
    .eq('user_id', user.id)
    .single()

  const userName = profile?.name ?? user.email ?? 'Student'
  const userRole = profile?.role ?? 'student'

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-[#0F172A]">
      <LMSSidebar userName={userName} userRole={userRole} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
