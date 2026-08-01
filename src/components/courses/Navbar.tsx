import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAllUserEnrollmentsStatus } from '@/lib/api/courses'
import { NavbarClient } from './NavbarClient'

export async function CoursesNavbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch enrollments only if user is logged in
  const enrollments = user ? await getAllUserEnrollmentsStatus() : []

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#0F172A]">
            <span className="text-xs font-black text-[#F18231]">IT</span>
          </div>
          <div className="leading-none">
            <span className="block text-sm font-black text-[#0F172A] tracking-tight group-hover:text-[#F18231] transition-colors">
              IT-vate
            </span>
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              Solutions
            </span>
          </div>
        </Link>

        {/* Right Actions & Notifications */}
        <NavbarClient user={user} enrollments={enrollments} />
      </div>
    </header>
  )
}
