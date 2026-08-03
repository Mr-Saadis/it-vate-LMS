'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useActiveStudent } from '@/components/lms/SidebarContext'
import {
  ArrowLeft,
  User,
  Mail,
  GraduationCap,
  BookOpen,
  Calendar,
  CreditCard,
  Shield,
  Briefcase,
  Hash,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
} from 'lucide-react'

interface PaymentDetail {
  payment_id: string
  status: string
  total_amount: number
  payment_method: string
  created_at: string
}

interface LevelDetail {
  level_id: string
  no: number
  title: string
  price: number
  enrollment: {
    enroll_id: string
    status: string
    track: string
    enrollment_date: string
    approved_at: string
    enroll_no: string
    rejected_reason: string
    payment: PaymentDetail | null
  } | null
}

interface CourseDetail {
  course_id: string
  name: string
  slug: string
  track: string
  levels: LevelDetail[]
}

interface ExperienceDetail {
  experience_id: string
  experience: string
  experience_dates: string
}

interface StudentDetail {
  user_id: string
  name: string
  email: string
  role: string
  education?: string
  created_at?: string
  experiences: ExperienceDetail[]
  courses: CourseDetail[]
}

interface StudentDetailClientProps {
  student: StudentDetail
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    Active: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    Pending: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      icon: <Clock className="h-3 w-3" />,
    },
    Completed: {
      bg: 'bg-orange-100',
      text: 'text-[#F18231]',
      icon: <Award className="h-3 w-3" />,
    },
    Rejected: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: <XCircle className="h-3 w-3" />,
    },
  }
  const c = config[status] || { bg: 'bg-slate-100', text: 'text-slate-500', icon: null }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${c.bg} ${c.text}`}
    >
      {c.icon}
      {status}
    </span>
  )
}

export function StudentDetailClient({ student }: StudentDetailClientProps) {
  const { setActiveStudentName } = useActiveStudent()

  // Set the student name in sidebar context
  useEffect(() => {
    setActiveStudentName(student.name)
    return () => setActiveStudentName(null)
  }, [student.name, setActiveStudentName])

  const [expandedEnrollId, setExpandedEnrollId] = useState<string | null>(null)

  const activeEnrollments = student.courses.reduce((sum, course) => {
    return sum + course.levels.filter(l => l.enrollment?.status === 'Active').length
  }, 0)

  const totalPaid = student.courses.reduce((sum, course) => {
    return sum + course.levels.reduce((levelSum, level) => {
      return levelSum + (level.enrollment?.payment?.total_amount || 0)
    }, 0)
  }, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-6 md:py-10 space-y-6 md:space-y-8">
      {/* ── Back + Header ── */}
      <div className="space-y-4">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#0F172A] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Students
        </Link>

        {/* ── Profile Details Header ── */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-5 sm:p-6 md:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left: Avatar & Basic Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F18231]/10 shrink-0">
                  <User className="h-8 w-8 text-[#F18231]" />
                </div>
                <div className="flex-1 min-w-0 space-y-1 mt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-md bg-[#0F172A] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase shrink-0">
                      Student
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 flex items-center gap-1 shrink-0">
                      <Calendar className="h-3 w-3" />
                      Joined {formatDate(student.created_at || '')}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] truncate">
                    {student.name}
                  </h1>
                  <p className="text-sm text-slate-500 truncate flex items-center gap-1.5">
                    <Mail className="h-4 w-4 shrink-0" />
                    {student.email}
                  </p>
                  {student.education && (
                    <p className="text-sm text-slate-600 flex items-center gap-1.5 mt-2 truncate">
                      <GraduationCap className="h-4 w-4 shrink-0" />
                      {student.education}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Middle: Experience */}
            {student.experiences.length > 0 && (
              <div className="flex-1 border-t lg:border-t-0 lg:border-l border-slate-200 pt-5 lg:pt-0 lg:pl-8">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Briefcase className="h-3.5 w-3.5" />
                  Experience
                </h2>
                <div className="space-y-3">
                  {student.experiences.map((exp) => (
                    <div key={exp.experience_id} className="min-w-0">
                      <p className="text-sm font-semibold text-[#0F172A] truncate">
                        {exp.experience}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{exp.experience_dates}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Right: Quick Stats */}
            <div className="shrink-0 flex flex-wrap gap-3 border-t lg:border-t-0 lg:border-l border-slate-200 pt-5 lg:pt-0 lg:pl-8">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center min-w-[80px] flex-1 sm:flex-none">
                <BookOpen className="h-4 w-4 text-[#F18231] mx-auto mb-1" />
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                  Courses
                </p>
                <p className="text-lg font-extrabold text-[#0F172A]">
                  {student.courses.length}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center min-w-[80px] flex-1 sm:flex-none">
                <GraduationCap className="h-4 w-4 text-green-600 mx-auto mb-1" />
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                  Active
                </p>
                <p className="text-lg font-extrabold text-green-700">{activeEnrollments}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center min-w-[80px] flex-1 sm:flex-none">
                <CreditCard className="h-4 w-4 text-[#F18231] mx-auto mb-1" />
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                  Total Paid
                </p>
                <p className="text-lg font-extrabold text-[#0F172A]">
                  Rs. {totalPaid.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Enrollments Full-Width View ── */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#F18231]" />
          Enrollment Timeline
        </h2>

        {student.courses.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No enrollments yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {student.courses.map((course) => (
              <div
                key={course.course_id}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
              >
                {/* Course Header */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[#0F172A]">{course.name}</h3>
                  <span className="inline-block rounded bg-orange-50 px-2 py-0.5 text-xs font-bold text-[#F18231] mt-2">
                    {course.track} Track
                  </span>
                </div>

                {/* Timeline */}
                <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar">
                  {course.levels.map((level, index) => {
                    const isEnrolled = !!level.enrollment
                    const status = level.enrollment?.status
                    
                    let bgClass = 'bg-slate-100 border-slate-200'
                    let textClass = 'text-slate-500'
                    let icon = <Hash className="h-4 w-4" />

                    if (isEnrolled) {
                      if (status === 'Completed') {
                        bgClass = 'bg-orange-50 border-[#F18231] hover:border-[#F18231]'
                        textClass = 'text-[#F18231]'
                        icon = <CheckCircle2 className="h-4 w-4" />
                      } else if (status === 'Active') {
                        bgClass = 'bg-orange-50 border-orange-300 hover:border-[#F18231]'
                        textClass = 'text-[#F18231]'
                        icon = <Clock className="h-4 w-4" />
                      } else if (status === 'Pending') {
                        bgClass = 'bg-amber-50 border-amber-200 hover:border-amber-400'
                        textClass = 'text-amber-700'
                        icon = <Clock className="h-4 w-4" />
                      } else if (status === 'Rejected') {
                        bgClass = 'bg-red-50 border-red-200 hover:border-red-400'
                        textClass = 'text-red-700'
                        icon = <XCircle className="h-4 w-4" />
                      }
                    }

                    const isExpanded = isEnrolled && expandedEnrollId === level.enrollment?.enroll_id

                    return (
                      <div key={level.level_id} className="flex items-center gap-3 shrink-0">
                        {/* Level Box */}
                        <div
                          onClick={() => {
                            if (isEnrolled && level.enrollment) {
                              setExpandedEnrollId(isExpanded ? null : level.enrollment.enroll_id)
                            }
                          }}
                          className={`flex flex-col justify-center w-40 h-24 rounded-xl border-2 p-3 transition-all ${
                            isEnrolled ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'
                          } ${bgClass} ${isExpanded ? 'ring-2 ring-offset-2 ring-[#0F172A]' : ''}`}
                        >
                          <div className={`flex items-center justify-between mb-2 ${textClass}`}>
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              Level {level.no}
                            </span>
                            {icon}
                          </div>
                          <p className={`text-xs font-semibold leading-tight line-clamp-2 ${isEnrolled ? 'text-[#0F172A]' : 'text-slate-500'}`}>
                            {level.title}
                          </p>
                        </div>

                        {/* Certificate Button */}
                        <div className="flex flex-col items-center justify-center w-12 gap-1">
                          <div className={`h-0.5 w-full ${status === 'Completed' ? 'bg-[#F18231]' : 'bg-slate-200'}`} />
                          <button
                            title={`Certificate for Level ${level.no}`}
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all shrink-0 ${
                              status === 'Completed'
                                ? 'border-[#F18231] bg-orange-50 text-[#F18231] shadow-sm hover:scale-110'
                                : 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
                            }`}
                          >
                            <Award className="h-4 w-4" />
                          </button>
                          <div className={`h-0.5 w-full ${status === 'Completed' ? 'bg-[#F18231]' : 'bg-slate-200'}`} />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Expanded Details */}
                {expandedEnrollId && course.levels.find(l => l.enrollment?.enroll_id === expandedEnrollId) && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6 animate-in fade-in slide-in-from-top-4 duration-200">
                    {(() => {
                      const level = course.levels.find(l => l.enrollment?.enroll_id === expandedEnrollId)!
                      const enr = level.enrollment!
                      return (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-[#0F172A]">
                              Level {level.no} Details
                            </h4>
                            <StatusBadge status={enr.status} />
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                Enrolled
                              </p>
                              <p className="text-xs font-semibold text-[#0F172A] mt-0.5">
                                {formatDate(enr.enrollment_date)}
                              </p>
                            </div>
                            {enr.enroll_no && (
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                  Enrollment #
                                </p>
                                <p className="text-xs font-semibold text-[#0F172A] mt-0.5 flex items-center gap-1">
                                  <Hash className="h-3 w-3 text-slate-400" />
                                  {enr.enroll_no}
                                </p>
                              </div>
                            )}
                            {enr.approved_at && (
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                  Approved
                                </p>
                                <p className="text-xs font-semibold text-green-700 mt-0.5">
                                  {formatDate(enr.approved_at)}
                                </p>
                              </div>
                            )}
                          </div>

                          {enr.payment && (
                            <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-200 flex-wrap">
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-slate-400" />
                                <span className="text-xs font-semibold text-[#0F172A]">
                                  Rs. {enr.payment.total_amount.toLocaleString()}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  via {enr.payment.payment_method}
                                </span>
                              </div>
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  enr.payment.status === 'Verified'
                                    ? 'bg-green-100 text-green-700'
                                    : enr.payment.status === 'Pending'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {enr.payment.status}
                              </span>
                            </div>
                          )}

                          {enr.status === 'Rejected' && enr.rejected_reason && (
                            <div className="mt-4 border-t border-red-200/50 rounded-lg bg-red-50 p-3">
                              <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">
                                Rejection Reason
                              </p>
                              <p className="text-xs text-red-700">{enr.rejected_reason}</p>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
