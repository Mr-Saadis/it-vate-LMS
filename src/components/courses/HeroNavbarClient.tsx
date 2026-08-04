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

interface HeroNavbarClientProps {
  user: any
  userRole?: string
  enrollments: Enrollment[]
}

export function HeroNavbarClient({ user, userRole = 'student', enrollments }: HeroNavbarClientProps) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
      <div className="flex items-center gap-6 absolute -top-8 right-0 z-50 justify-end font-sans">
        {user ? (
          <div className="flex items-center gap-5">
            {enrollments.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative flex items-center justify-center text-white hover:text-[#F18231] transition-colors"
                  aria-label="View enrollment requests"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#F18231] text-[9px] font-bold text-white shadow-sm ring-2 ring-[#0b1120]">
                    {enrollments.length}
                  </span>
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-80 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-slate-800 mb-2">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
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
                            className="w-full flex items-start gap-3 rounded-lg p-2.5 text-left hover:bg-slate-800 transition-colors group"
                          >
                            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                              isActive ? 'bg-green-900/50 text-green-400' :
                              isPending ? 'bg-amber-900/50 text-[#F18231]' :
                              'bg-red-900/50 text-red-400'
                            }`}>
                              {isActive && <CheckCircle2 className="h-4 w-4" />}
                              {isPending && <Clock className="h-4 w-4" />}
                              {isRejected && <XCircle className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-xs font-bold text-slate-200">
                                {courseName}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {req.track_type} Track
                              </p>
                              <span className={`inline-block mt-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                isActive ? 'bg-green-900 text-green-300' :
                                isPending ? 'bg-amber-900 text-amber-300' :
                                'bg-red-900 text-red-300'
                              }`}>
                                {isActive ? 'Approved' : req.status}
                              </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-500 mt-2 group-hover:text-[#F18231] transition-colors" />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {(userRole === 'admin' || enrollments.length > 0) && (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-medium text-white hover:text-[#F18231] transition-colors"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            )}

            <button
              onClick={handleSignOut}
              className="hidden sm:flex items-center gap-1.5 text-[13px] font-medium text-white hover:text-[#F18231] transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-5">
            <Link
              href="/login"
              className="text-[13px] font-medium text-white hover:text-[#F18231] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[#F18231] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#d96f21] transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        )}

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex sm:hidden h-10 w-10 items-center justify-center rounded-lg text-white hover:text-[#F18231] transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="sm:hidden absolute top-16 right-4 left-4 z-50 rounded-xl border border-slate-700 bg-slate-900 shadow-xl px-4 py-4 space-y-1">
          {user ? (
            <>
              {(userRole === 'admin' || enrollments.length > 0) && (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-[#F18231] transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <div className="h-px bg-slate-800 my-1" />
                </>
              )}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-[#F18231] transition-colors"
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
                className="flex items-center rounded-lg px-3 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-[#F18231] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="flex items-center rounded-lg px-3 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-[#F18231] transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </>
  )
}
