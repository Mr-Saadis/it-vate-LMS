'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'
import {
  LayoutDashboard,
  Award,
  Compass,
  LogOut,
  User,
} from 'lucide-react'

interface LMSSidebarProps {
  userName?: string
  userRole?: string
}

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/certificates',
    label: 'Certificates',
    icon: Award,
  },
]

export function LMSSidebar({ userName = 'Student', userRole = 'student' }: LMSSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col bg-[#0F172A] sticky top-0">
      {/* Logo */}
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#F18231]">
            <span className="text-[10px] font-black text-white">IT</span>
          </div>
          <div className="leading-none">
            <span className="block text-xs font-black text-white tracking-tight">
              IT-vate LMS
            </span>
            <span className="block text-[9px] font-medium text-slate-500 uppercase tracking-widest">
              Student Portal
            </span>
          </div>
        </div>
      </div>

      {/* User Badge */}
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F18231]/20 shrink-0">
            <User className="h-4 w-4 text-[#F18231]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-white">{userName}</p>
            <span className="rounded bg-[#F18231]/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#F18231] tracking-wider">
              {userRole}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        
        {/* Student Links (hidden for admins) */}
        {userRole !== 'admin' && (
          <>
            <p className="px-2 pb-2 text-[9px] font-bold uppercase tracking-widest text-slate-500">
              Navigation
            </p>
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#F18231] text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              )
            })}

            {/* Discover Courses — external link to courses subdomain */}
            <a
              href={
                process.env.NEXT_PUBLIC_COURSES_URL ||
                'http://localhost:3000/?domain=courses'
              }
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <Compass className="h-4 w-4 shrink-0" />
              Discover Courses
            </a>
          </>
        )}

        {/* Admin panel (only for admin role) */}
        {userRole === 'admin' && (
          <>
            <p className="px-2 pb-2 pt-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">
              Admin
            </p>
            <Link
              href="/admin"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${
                pathname.startsWith('/admin')
                  ? 'bg-[#F18231] text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              Admin Panel
            </Link>
          </>
        )}
      </nav>

      {/* Sign Out */}
      <div className="border-t border-white/10 p-3">
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-all"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
