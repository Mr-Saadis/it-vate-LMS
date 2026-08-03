import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getAllUserEnrollmentsStatus } from '@/lib/api/courses'
import { NavbarClient } from './NavbarClient'

export async function CoursesNavbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch enrollments only if user is logged in
  const enrollments = user ? await getAllUserEnrollmentsStatus() : []

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <Image src="/logo_h_c.png" alt="IT-vate Solutions" width={130} height={40} className="object-contain" />
        </Link>


        {/* Right Actions & Notifications */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <NavbarClient user={user} enrollments={enrollments as any} />
      </div>
    </header>
  )
}
