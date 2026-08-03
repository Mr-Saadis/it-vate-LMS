'use client'

import { Course } from '@/lib/types'
import { Award, BookOpen, Clock, Download, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface CertificatesClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enrollments: any[]
  allCourses: Course[]
  userName: string
}

export function CertificatesClient({ enrollments, allCourses, userName }: CertificatesClientProps) {
  // Process and group by Course
  const courseGroups: Record<string, {
    course: Course,
    trackType: string,
    enrolledLevels: any[]
  }> = {}

  enrollments.forEach(enroll => {
    const level = enroll.levels
    if (!level || !level.courses) return
    const courseId = level.courses.course_id

    if (!courseGroups[courseId]) {
      const fullCourse = allCourses.find(c => c.course_id === courseId)
      if (!fullCourse) return

      courseGroups[courseId] = {
        course: fullCourse,
        trackType: enroll.track_type,
        enrolledLevels: []
      }
    }

    courseGroups[courseId].enrolledLevels.push({
      ...level,
      enroll_id: enroll.enroll_id,
      enroll_no: enroll.enroll_no,
      status: enroll.status,
      approved_at: enroll.approved_at,
    })
  })

  const uniqueCourseIds = Object.keys(courseGroups)

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-8 space-y-8 pb-20">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/80 p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden items-center justify-between">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-orange-100/50 blur-3xl pointer-events-none z-0"></div>
        <div className="relative z-10 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#F18231]">
            Completion Records
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">
            Your Certificates
          </h1>
          <p className="text-sm text-slate-500 max-w-lg mt-1">
            Track your progress and download your official certificates. Certificates are issued by the admin upon successful completion of your courses.
          </p>
        </div>
        <div className="relative z-10 shrink-0 h-16 w-16 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center">
          <Award className="h-8 w-8 text-[#F18231]" />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {uniqueCourseIds.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
            <Award className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-base font-bold text-[#0F172A]">No Enrollments Found</p>
            <p className="text-sm text-slate-500 mt-2">
              You haven't enrolled in any courses yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {uniqueCourseIds.map(courseId => {
              const { course, trackType, enrolledLevels } = courseGroups[courseId]
              const totalLevelsInCourse = course.levels?.length || 0
              const completedLevelsCount = enrolledLevels.filter(l => l.status === 'Completed').length
              
              const isOverallCompleted = totalLevelsInCourse > 0 && completedLevelsCount === totalLevelsInCourse
              const sortedLevels = [...enrolledLevels].sort((a, b) => a.no - b.no)

              return (
                <div key={courseId} className="rounded-[20px] border border-slate-200 bg-white shadow-sm overflow-hidden">
                  {/* Course Header */}
                  <div className="border-b border-slate-100 bg-slate-50/50 p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex rounded bg-orange-50 px-2 py-0.5 text-[9px] font-black text-[#F18231] tracking-widest uppercase">
                          {trackType} Track
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {completedLevelsCount} / {totalLevelsInCourse} Levels Completed
                        </span>
                      </div>
                      <h2 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-slate-400" />
                        {course.name}
                      </h2>
                    </div>

                    {/* Overall Certificate Button */}
                    {isOverallCompleted && (
                      <Link
                        href={`/certificates/view/course/${courseId}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#F18231] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#d96f21] transition-colors shadow-sm"
                      >
                        <Award className="h-4 w-4" />
                        Overall Course Certificate
                      </Link>
                    )}
                  </div>

                  {/* Levels List */}
                  <div className="p-5 md:p-6 grid gap-4">
                    {sortedLevels.map(lvl => {
                      const isCompleted = lvl.status === 'Completed'

                      return (
                        <div 
                          key={lvl.enroll_id} 
                          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 transition-colors ${
                            isCompleted ? 'border-green-100 bg-green-50/30' : 'border-slate-100 bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                              isCompleted ? 'bg-green-100 border-green-200' : 'bg-slate-200 border-slate-200'
                            }`}>
                              {isCompleted ? (
                                <Award className="h-5 w-5 text-green-600" />
                              ) : (
                                <Clock className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                                Level {lvl.no}
                              </p>
                              <h3 className={`text-sm font-bold ${isCompleted ? 'text-green-900' : 'text-[#0F172A]'}`}>
                                {lvl.level_title}
                              </h3>
                              <p className="text-xs text-slate-500 mt-1">
                                {isCompleted ? 'Certificate Issued' : 'In Progress'}
                              </p>
                            </div>
                          </div>

                          <div className="sm:text-right">
                            {isCompleted ? (
                              <Link
                                href={`/certificates/view/level/${lvl.enroll_id}`}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
                              >
                                View & Download
                                <Download className="h-3.5 w-3.5 text-[#F18231]" />
                              </Link>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-500">
                                <Clock className="h-3 w-3" />
                                Pending Admin Approval
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
