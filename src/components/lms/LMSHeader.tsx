'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Clock, CheckCircle2, XCircle, ChevronRight, Menu } from 'lucide-react'

interface LMSHeaderProps {
  enrollments: any[]
}

export function LMSHeader({ enrollments }: LMSHeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false)
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

  const handleRequestClick = (enrollment: any) => {
    setNotifOpen(false)
    router.push(`/dashboard/notifications?id=${enrollment.enroll_id}`)
  }

  const groupedEnrollments = Object.values(
    enrollments.reduce((acc: any, req: any) => {
      const pId = req.payment_enrollments?.[0]?.payment_id || (Array.isArray(req.payment_enrollments?.[0]?.payments) ? req.payment_enrollments?.[0]?.payments[0]?.payment_id : req.payment_enrollments?.[0]?.payments?.payment_id)
      const key = pId || req.enroll_no || req.enroll_id
      if (!acc[key]) {
        acc[key] = { ...req, all_levels: [req.levels] }
      } else {
        acc[key].all_levels.push(req.levels)
      }
      return acc
    }, {})
  )

  const badgeCount = groupedEnrollments.length

  return (
    <header className="flex h-16 items-center justify-between px-4 md:px-8 bg-slate-50 border-b border-slate-200/60 sticky top-0 z-40">
      <div className="flex-1" />

      {/* Right Side Actions */}
      <div className="flex items-center gap-3 ml-auto">
        {badgeCount > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-100 transition-colors shadow-sm"
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4 text-slate-600" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F18231] text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                {badgeCount}
              </span>
            </button>

            {/* Notification Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-[320px] sm:w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100 mb-2">
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    Your Enrollment Requests
                  </h3>
                </div>
                <div className="max-h-[60vh] overflow-y-auto space-y-1">
                  {groupedEnrollments.map((req: any) => {
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
      </div>
    </header>
  )
}
