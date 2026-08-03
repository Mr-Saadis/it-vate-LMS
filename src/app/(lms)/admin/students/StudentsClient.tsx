'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Users,
  Search,
  GraduationCap,
  BookOpen,
  User,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react'

interface Enrollment {
  course: string
  track: string
  status: string
  enrollment_date: string
}

interface Student {
  id: string
  name: string
  email: string
  enrollments: Enrollment[]
}

interface StudentsClientProps {
  students: Student[]
}

export function StudentsClient({ students }: StudentsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    setExpandedStudents((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.enrollments.some((e) =>
          e.course.toLowerCase().includes(searchQuery.toLowerCase())
        )

      if (statusFilter === 'all') return matchesSearch
      if (statusFilter === 'active')
        return matchesSearch && s.enrollments.some((e) => e.status === 'Active')
      return matchesSearch && s.enrollments.every((e) => e.status !== 'Active')
    })
  }, [students, searchQuery, statusFilter])

  const totalEnrollments = students.reduce((sum, s) => sum + s.enrollments.length, 0)
  const activeCount = students.filter((s) =>
    s.enrollments.some((e) => e.status === 'Active')
  ).length

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-6 md:py-10 space-y-8 md:space-y-10">
      {/* ── Header ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 overflow-hidden">
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#0F172A] px-2.5 py-0.5 text-xs font-bold text-white">
              ADMIN
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Students Management
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
            Enrolled Students
          </h1>
          <p className="text-xs text-slate-600">
            Overview of all students currently enrolled across courses.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-2 md:flex md:items-center md:gap-3 shrink-0">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-2 md:px-4 py-3 text-center min-w-0 md:min-w-[90px] overflow-hidden">
            <Users className="h-4 w-4 text-[#F18231] mx-auto mb-1" />
            <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-tight md:tracking-wider">
              Students
            </p>
            <p className="text-lg md:text-xl font-extrabold text-[#0F172A]">
              {students.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-2 md:px-4 py-3 text-center min-w-0 md:min-w-[90px] overflow-hidden">
            <BookOpen className="h-4 w-4 text-[#F18231] mx-auto mb-1" />
            <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-tight md:tracking-wider">
              Enrollments
            </p>
            <p className="text-lg md:text-xl font-extrabold text-[#0F172A]">
              {totalEnrollments}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-2 md:px-4 py-3 text-center min-w-0 md:min-w-[90px] overflow-hidden">
            <GraduationCap className="h-4 w-4 text-green-600 mx-auto mb-1" />
            <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-tight md:tracking-wider">
              Active
            </p>
            <p className="text-lg md:text-xl font-extrabold text-green-700">
              {activeCount}
            </p>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or course…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F18231]/40 focus:border-[#F18231] transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'active', 'inactive'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`rounded-lg px-4 py-2.5 text-xs font-semibold capitalize transition-all ${
                statusFilter === filter
                  ? 'bg-[#0F172A] text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* ── Students List ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 border-dashed bg-white py-16 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
            <Users className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Students Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? 'Try adjusting your search or filter criteria.'
              : 'No students are enrolled yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((student) => {
            const isExpanded = expandedStudents.has(student.id)
            const hasMultiple = student.enrollments.length > 1
            const visibleEnrollments = isExpanded
              ? student.enrollments
              : student.enrollments.slice(0, 1)

            return (
              <div
                key={student.id}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-slate-300 transition-colors"
              >
                {/* Student Row */}
                <div className="flex flex-col gap-3 px-4 py-4 sm:px-5 overflow-hidden">
                  {/* Top: Avatar + Info + Count/Expand (always in a row) */}
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#F18231]/10 shrink-0">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-[#F18231]" />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <Link
                        href={`/admin/students/${student.id}`}
                        className="text-xs sm:text-sm font-bold text-[#0F172A] truncate block hover:text-[#F18231] transition-colors"
                      >
                        {student.name}
                      </Link>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                        {student.email}
                      </p>
                    </div>
                    {/* Count + Expand + View — always far right */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="rounded-md bg-[#0F172A] px-2 sm:px-2.5 py-1 text-center whitespace-nowrap">
                        <span className="text-[9px] sm:text-[10px] font-bold text-white">
                          {student.enrollments.length}{' '}
                          {student.enrollments.length === 1 ? 'Course' : 'Courses'}
                        </span>
                      </div>
                      {hasMultiple && (
                        <button
                          onClick={() => toggleExpand(student.id)}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 sm:px-2.5 py-1.5 text-[10px] sm:text-[11px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-[#0F172A] transition-colors whitespace-nowrap"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              All
                            </>
                          )}
                        </button>
                      )}
                      <Link
                        href={`/admin/students/${student.id}`}
                        className="flex items-center gap-1 rounded-lg bg-[#F18231] px-2 sm:px-2.5 py-1.5 text-[10px] sm:text-[11px] font-semibold text-white hover:bg-[#e0741f] transition-colors whitespace-nowrap"
                      >
                        <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span className="hidden sm:inline">Detail</span>
                      </Link>
                    </div>
                  </div>

                  {/* Course Pills — below on mobile, inline on desktop; hidden when expanded */}
                  {!isExpanded && (
                    <div className="flex flex-wrap items-center gap-2 sm:pl-[52px] overflow-hidden">
                      {visibleEnrollments.map((enrollment, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2 sm:px-3 py-1.5 sm:py-2 max-w-full overflow-hidden"
                        >
                          <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#F18231] shrink-0" />
                          <span className="text-[10px] sm:text-xs font-semibold text-[#0F172A] truncate">
                            {enrollment.course}
                          </span>
                          <span className="rounded bg-orange-50 px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold text-[#F18231] shrink-0">
                            {enrollment.track}
                          </span>
                          <span
                            className={`rounded px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold uppercase shrink-0 ${
                              enrollment.status === 'Active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {enrollment.status}
                          </span>
                        </div>
                      ))}
                      {hasMultiple && (
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                          +{student.enrollments.length - 1} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Expanded Enrollment Details */}
                {isExpanded && hasMultiple && (
                  <div className="border-t border-slate-100 bg-slate-50/50 px-4 sm:px-5 py-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      All Enrollments
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {student.enrollments.map((enrollment, idx) => (
                        <div
                          key={idx}
                          className="flex items-start sm:items-center justify-between gap-2 sm:gap-3 rounded-lg border border-slate-200 bg-white p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[#0F172A] truncate">
                              {enrollment.course}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[9px] font-bold text-[#F18231]">
                                {enrollment.track} Track
                              </span>
                              <span className="text-[9px] text-slate-400">
                                {new Date(enrollment.enrollment_date).toLocaleDateString(
                                  'en-PK',
                                  { day: '2-digit', month: 'short', year: 'numeric' }
                                )}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase shrink-0 ${
                              enrollment.status === 'Active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {enrollment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
