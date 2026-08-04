'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'
import { useActiveStudent, useActiveCourse } from '@/components/lms/SidebarContext'
import {
  LayoutDashboard,
  Award,
  Compass,
  LogOut,
  User,
  Users,
  Menu,
  X,
  ChevronRight,
  BookOpen,
  Bell,
} from 'lucide-react'

interface LMSSidebarProps {
  userName?: string
  userRole?: string
}

const navItems = [
  {
    href: '/dashboard',
    label: 'Analytics',
    icon: LayoutDashboard,
  },
  {
    href: '/certificates',
    label: 'Certificates',
    icon: Award,
  },
  {
    href: '/dashboard/notifications',
    label: 'Notifications',
    icon: Bell,
  },
]

export function LMSSidebar({ userName = 'Student', userRole = 'student' }: LMSSidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { activeStudentName } = useActiveStudent()
  const { activeCourseName } = useActiveCourse()

  // Detect if on a student detail page (e.g. /admin/students/some-uuid)
  const isOnStudentDetail = /^\/admin\/students\/[^/]+$/.test(pathname)
  // Detect if on a course detail page (e.g. /admin/courses/some-uuid)
  const isOnCourseDetail = /^\/admin\/courses\/[^/]+$/.test(pathname)

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex w-full items-center justify-between bg-[#0F172A] px-5 py-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <Image src="/logo2.png" alt="IT-vate LMS" width={28} height={28} className="rounded object-contain bg-white p-0.5" />
          <div className="leading-none">
            <span className="block text-xs font-black text-white tracking-tight">
              IT-vate LMS
            </span>
            <span className="block text-[9px] font-medium text-slate-500 uppercase tracking-widest">
              {userRole === 'admin' ? 'Admin Portal' : 'Student Portal'}
            </span>
          </div>
        </div>
        <button onClick={() => setIsOpen(true)} className="text-white p-1 hover:text-[#F18231] transition-colors">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex h-screen w-56 shrink-0 flex-col bg-[#0F172A] transform transition-transform duration-300 md:sticky md:top-0 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo Area */}
        <div className="border-b border-white/10 px-5 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo2.png" alt="IT-vate LMS" width={28} height={28} className="rounded object-contain bg-white p-0.5" />
            <div className="leading-none">
              <span className="block text-xs font-black text-white tracking-tight">
                IT-vate LMS
              </span>
              <span className="block text-[9px] font-medium text-slate-500 uppercase tracking-widest">
                {userRole === 'admin' ? 'Admin Portal' : 'Student Portal'}
              </span>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white p-1 transition-colors">
            <X className="h-5 w-5" />
          </button>
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
              let isActive = false
              if (href === '/dashboard') {
                isActive = pathname === '/dashboard' || pathname.startsWith('/dashboard/level/')
              } else {
                isActive = pathname === href || pathname.startsWith(href + '/')
              }
              
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
                pathname === '/admin'
                  ? 'bg-[#F18231] text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              Payment Verifications
            </Link>
            <Link
              href="/admin/students"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${
                pathname.startsWith('/admin/students')
                  ? 'bg-[#F18231] text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4 shrink-0" />
              Students
            </Link>
            {/* Nested student name when on detail page */}
            {isOnStudentDetail && activeStudentName && (
              <div className="flex flex-col gap-1 pl-4 mt-1">
                <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold bg-white/5 text-white border-l-2 border-[#F18231]">
                  <ChevronRight className="h-3 w-3 text-[#F18231] shrink-0" />
                  <span className="truncate">{activeStudentName}</span>
                </div>
              </div>
            )}
            <Link
              href="/admin/courses"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${
                pathname.startsWith('/admin/courses')
                  ? 'bg-[#F18231] text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              Courses
            </Link>
            {/* Nested course name when on detail page */}
            {isOnCourseDetail && activeCourseName && (
              <div className="flex flex-col gap-1 pl-4 mt-1">
                <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold bg-white/5 text-white border-l-2 border-[#F18231]">
                  <ChevronRight className="h-3 w-3 text-[#F18231] shrink-0" />
                  <span className="truncate">{activeCourseName}</span>
                </div>
              </div>
            )}
            <Link
              href="/admin/coupons"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${
                pathname.startsWith('/admin/coupons')
                  ? 'bg-[#F18231] text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Award className="h-4 w-4 shrink-0" />
              Coupons
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
    </>
  )
}
