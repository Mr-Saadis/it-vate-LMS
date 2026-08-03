'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Clock, CheckCircle2, XCircle, ChevronRight, Menu, X, LogOut, LayoutDashboard } from 'lucide-react'

interface Enrollment {
  enroll_id: string
  status: string
  track_type: string
  levels?: {
    courses?: { name: string }
  }
}

interface NavbarClientProps {
  user: any
  userRole?: string
  enrollments: Enrollment[]
}

export function NavbarClient({ user, userRole = 'student', enrollments }: NavbarClientProps) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [router])

  const handleRequestClick = (enrollment: Enrollment) => {
    setNotifOpen(false)
    setMobileOpen(false)
    if (enrollment.status === 'Active') {
      router.push('/dashboard?approved_banner=true')
    } else {
      router.push(`/enrollment-status?id=${enrollment.enroll_id}`)
    }
  }

  // ── Auto-Redirection & Polling Logic ──
  const prevEnrollmentsRef = useRef<Enrollment[]>(enrollments)

  useEffect(() => {
    const prevEnrollments = prevEnrollmentsRef.current
    if (prevEnrollments) {
      const newActive = enrollments.find(
        (e) =>
          e.status === 'Active' &&
          !prevEnrollments.find((pe) => pe.enroll_id === e.enroll_id && pe.status === 'Active')
      )
      if (newActive) {
        router.push('/dashboard?approved_banner=true')
      }
    }
    prevEnrollmentsRef.current = enrollments
  }, [enrollments, router])

  useEffect(() => {
    const hasPending = enrollments.some((req) => req.status === 'Pending')
    if (hasPending) {
      const interval = setInterval(() => {
        router.refresh()
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [enrollments, router])

  const handleSignOut = async () => {
    setMobileOpen(false)
    const { signOut } = await import('@/lib/actions/auth')
    await signOut()
  }

  return (
    <>
      {/* ── Desktop Right Actions ── */}
      <div className="flex items-center gap-3">

        {user ? (
          <div className="flex items-center gap-3">

            {/* Notifications Bell */}
            {enrollments.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  aria-label="View enrollment requests"
                >
                  <Bell className="h-4 w-4 text-slate-600" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F18231] text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                    {enrollments.length}
                  </span>
                </button>

                {/* Notification Dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-slate-100 mb-2">
                      <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                        Your Enrollment Requests
                      </h3>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto space-y-1">
                      {enrollments.map((req) => {
                        const courseName = req.levels?.courses?.name || 'Unknown Course'
                        const isPending = req.status === 'Pending'
                        const isActive = req.status === 'Active'
                        const isRejected = req.status === 'Rejected'

                        return (
                          <button
                            key={req.enroll_id}
                            onClick={() => handleRequestClick(req)}
                            className="w-full flex items-start gap-3 rounded-lg p-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                          >
                            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                              isActive ? 'bg-green-100 text-green-600' :
                              isPending ? 'bg-amber-100 text-[#F18231]' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {isActive && <CheckCircle2 className="h-4 w-4" />}
                              {isPending && <Clock className="h-4 w-4" />}
                              {isRejected && <XCircle className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-xs font-bold text-[#0F172A] dark:text-slate-200">
                                {courseName}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {req.track_type} Track
                              </p>
                              <span className={`inline-block mt-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                isActive ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                                isPending ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' :
                                'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                              }`}>
                                {isActive ? 'Approved' : req.status}
                              </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 mt-2 group-hover:text-[#F18231] transition-colors" />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dashboard link — desktop only */}
            {(userRole === 'admin' || enrollments.length > 0) && (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#F18231] transition-colors"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            )}

            {/* Sign Out — desktop only */}
            <button
              onClick={handleSignOut}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-[#0F172A] dark:text-slate-200 hover:text-[#F18231] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[#F18231] px-4 py-2 text-xs font-bold text-white hover:bg-[#d96f21] transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}

        {/* Hamburger — mobile only */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex sm:hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Mobile Dropdown ── */}
      {mobileOpen && (
        <div className="sm:hidden absolute top-14 inset-x-0 z-50 border-b border-slate-200 bg-white/98 backdrop-blur-sm shadow-lg px-4 py-4 space-y-1">
          {user ? (
            <>
              {(userRole === 'admin' || enrollments.length > 0) && (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#F18231] transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <div className="h-px bg-slate-100" />
                </>
              )}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#F18231] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center rounded-lg bg-[#F18231] px-3 py-2.5 text-sm font-bold text-white hover:bg-[#d96f21] transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </>
  )
}
