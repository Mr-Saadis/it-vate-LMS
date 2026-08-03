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
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6 py-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#0F172A] dark:bg-slate-800">
            <span className="text-xs font-black text-[#F18231]">IT</span>
          </div>
          <div className="leading-none">
            <span className="block text-sm font-black text-[#0F172A] dark:text-slate-100 tracking-tight group-hover:text-[#F18231] transition-colors">
              IT-vate
            </span>
            <span className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Solutions
            </span>
          </div>
        </Link>

        {/* Right Actions & Notifications */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <NavbarClient user={user} enrollments={enrollments as any} />
      </div>
    </header>
  )
}
