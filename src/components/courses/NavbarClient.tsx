'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Clock, CheckCircle2, XCircle, ChevronRight } from 'lucide-react'

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
  enrollments: Enrollment[]
}

export function NavbarClient({ user, enrollments }: NavbarClientProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleRequestClick = (enrollment: Enrollment) => {
    setIsOpen(false)
    if (enrollment.status === 'Active') {
      router.push('/dashboard?approved_banner=true')
    } else {
      router.push(`/enrollment-status?id=${enrollment.enroll_id}`)
    }
  }

  // ── Auto-Redirection & Polling Logic ──
  const prevEnrollmentsRef = useRef<Enrollment[]>(enrollments)

  useEffect(() => {
    // Check if any enrollment just became Active
    const prevEnrollments = prevEnrollmentsRef.current
    if (prevEnrollments) {
      const newActive = enrollments.find(
        (e) =>
          e.status === 'Active' &&
          !prevEnrollments.find((pe) => pe.enroll_id === e.enroll_id && pe.status === 'Active')
      )
      if (newActive) {
        // Redirect immediately if a request was approved
        router.push('/dashboard?approved_banner=true')
      }
    }
    prevEnrollmentsRef.current = enrollments
  }, [enrollments, router])

  useEffect(() => {
    // If there are pending requests, poll every 10 seconds to check for admin approval
    const hasPending = enrollments.some((req) => req.status === 'Pending')
    if (hasPending) {
      const interval = setInterval(() => {
        router.refresh()
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [enrollments, router])

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <div className="flex items-center gap-4">
          {/* Notifications Dropdown */}
          {enrollments.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                aria-label="View enrollment requests"
              >
                <Bell className="h-4 w-4 text-slate-600" />
                {/* Notification Badge */}
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F18231] text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                  {enrollments.length}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2">
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
                          className="w-full flex items-start gap-3 rounded-lg p-2.5 text-left hover:bg-slate-50 transition-colors group"
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
                            <p className="truncate text-xs font-bold text-[#0F172A]">
                              {courseName}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {req.track_type} Track
                            </p>
                            <span className={`inline-block mt-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              isActive ? 'bg-green-100 text-green-700' :
                              isPending ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
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

          <button
            onClick={async () => {
              const { signOut } = await import('@/lib/actions/auth')
              await signOut()
            }}
            className="text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <>
          <Link
            href="/login"
            className="text-xs font-semibold text-[#0F172A] hover:text-[#F18231] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-[#F18231] px-4 py-2 text-xs font-bold text-white hover:bg-[#d96f21] transition-colors"
          >
            Get Started
          </Link>
        </>
      )}
    </div>
  )
}
