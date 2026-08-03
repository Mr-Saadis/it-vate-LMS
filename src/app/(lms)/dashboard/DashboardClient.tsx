'use client'

import { useState, useEffect } from 'react'
import { Course } from '@/lib/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ExternalLink,
  CheckCircle2,
  Lock,
  User,
  BookOpen,
  Clock,
  ArrowRight,
  Mail,
  Award,
  Hash,
  Phone,
  GraduationCap,
  Briefcase,
  CalendarDays
} from 'lucide-react'

interface DashboardClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enrollments: any[]
  allCourses: Course[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userProfile: any
  userName: string
  userEmail: string
  userJoinedAt: string
  showApprovedBanner?: boolean
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return 'TBD'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return 'TBD'
  return `${d.getDate().toString().padStart(2, '0')}-${d.toLocaleString('default', { month: 'short' })}-${d.getFullYear()}`
}

export function DashboardClient({
  enrollments,
  allCourses,
  userProfile,
  userName,
  userEmail,
  userJoinedAt,
  showApprovedBanner,
}: DashboardClientProps) {
  const router = useRouter()
  const [activeCourseLevels, setActiveCourseLevels] = useState<Record<string, string>>({})
  const [showBanner, setShowBanner] = useState(showApprovedBanner)

  useEffect(() => {
    if (showApprovedBanner) {
      const timer = setTimeout(() => setShowBanner(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showApprovedBanner])

  // Process enrollments
  const courseGroups: Record<string, {
    course: Course,
    trackType: string,
    ownedLevels: string[],
    enrollNo: string | null
  }> = {}

  // To quickly look up enrolled level data (dates, content items)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enrolledLevelsData: Record<string, any> = {}

  enrollments.forEach(enroll => {
    const level = enroll.levels
    if (!level || !level.courses) return
    const courseId = level.courses.course_id
    
    enrolledLevelsData[level.level_id] = {
      started_at: level.started_at,
      ended_at: level.ended_at,
      content_items: level.content_items || [],
      status: enroll.status,
      is_completed: enroll.is_completed
    }

    if (!courseGroups[courseId]) {
      // Find full course from allCourses
      const fullCourse = allCourses.find(c => c.course_id === courseId)
      if (!fullCourse) return

      courseGroups[courseId] = {
        course: fullCourse,
        trackType: enroll.track_type,
        ownedLevels: [],
        enrollNo: enroll.enroll_no
      }
    }

    if (!courseGroups[courseId].ownedLevels.includes(level.level_id)) {
      courseGroups[courseId].ownedLevels.push(level.level_id)
    }
  })

  const uniqueCourseIds = Object.keys(courseGroups)
  const totalCourses = uniqueCourseIds.length

  // Initialize active level per course to the first owned level
  useEffect(() => {
    const initialActive: Record<string, string> = {}
    uniqueCourseIds.forEach(cId => {
      if (!activeCourseLevels[cId]) {
        const owned = courseGroups[cId].ownedLevels
        if (owned.length > 0) {
          // Find lowest owned level number
          const course = courseGroups[cId].course
          const levels = course.levels || []
          let lowest = owned[0]
          let minNo = 999
          owned.forEach(id => {
            const l = levels.find(x => x.level_id === id)
            if (l && l.no < minNo) {
              minNo = l.no
              lowest = id
            }
          })
          initialActive[cId] = lowest
        }
      }
    })
    if (Object.keys(initialActive).length > 0) {
      setActiveCourseLevels(prev => ({ ...prev, ...initialActive }))
    }
  }, [enrollments, allCourses])

  const handleLevelClick = (courseId: string, levelId: string, isOwned: boolean) => {
    if (isOwned) {
      router.push(`/dashboard/level/${levelId}`)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 space-y-8 pb-20">
      {/* Auto-fading Approved Banner */}
      {showBanner && (
        <div className="absolute top-0 left-0 right-0 z-50 mx-8 mt-2 flex animate-in fade-in slide-in-from-top-4 duration-500 items-center justify-center rounded-lg bg-green-50 px-4 py-3 border border-green-200 shadow-sm transition-opacity">
          <div className="flex items-center gap-3 text-green-800 text-sm font-semibold">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Your request was approved by the admin! Welcome to your dashboard.
          </div>
        </div>
      )}

      {/* Top Banner Profile & Stats */}
      <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/80 p-5 md:p-6 shadow-sm flex flex-col xl:flex-row gap-6 md:gap-8 relative overflow-hidden items-center">
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-orange-100/50 blur-3xl pointer-events-none"></div>

        {/* Left: User Info */}
        <div className="flex gap-4 w-full xl:w-5/12 z-10 items-center">
          <div className="h-16 w-16 shrink-0 rounded-[18px] bg-gradient-to-br from-orange-50 to-orange-100/50 flex items-center justify-center border border-orange-100 shadow-sm">
            <User className="h-7 w-7 text-[#F18231]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest gap-2">
              <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> Joined {formatDate(userJoinedAt)}</span>
            </div>
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight leading-none">
              {userName}
            </h1>
            <div className="flex flex-col mt-1">
              <p className="text-[13px] text-slate-500 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400" /> {userEmail}
              </p>
              {userProfile?.phone_number && (
                <p className="text-[13px] text-slate-500 flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> {userProfile.phone_number}
                </p>
              )}
              {userProfile?.education && (
                <p className="text-[13px] text-slate-500 flex items-center gap-2">
                  <GraduationCap className="h-3.5 w-3.5 text-slate-400" /> {userProfile.education}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Divider for desktop */}
        <div className="hidden xl:block w-px bg-slate-200/60 my-2 z-10"></div>
        {/* Divider for mobile */}
        <div className="block xl:hidden h-px w-full bg-slate-200/60 z-10"></div>

        {/* Middle/Right: Experiences & Stats */}
        <div className="flex flex-col md:flex-row gap-6 w-full xl:w-7/12 z-10 justify-between items-center">
          <div className="flex-1 space-y-2 w-full">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Past Experience</h3>
            {userProfile?.experiences && userProfile.experiences.length > 0 ? (
              <div className="space-y-2">
                {userProfile.experiences.slice(0, 1).map((exp: any) => (
                  <div key={exp.experience_id} className="flex gap-3 items-start">
                    <div>
                      <p className="text-xs font-bold text-slate-700 leading-snug">{exp.experience}</p>
                      {exp.experience_dates && (
                        <p className="text-[10px] font-medium text-slate-400">{exp.experience_dates}</p>
                      )}
                    </div>
                  </div>
                ))}
                {userProfile.experiences.length > 1 && (
                  <p className="text-[10px] font-semibold text-[#F18231]">+{userProfile.experiences.length - 1} more</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No experience added yet.</p>
            )}
          </div>

          {/* Stats Block */}
          <div className="flex flex-col gap-2 shrink-0">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Overview</h3>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-sm min-w-[90px] py-2 px-3 shadow-sm hover:bg-white transition-colors">
                <span className="text-2xl font-black text-[#0F172A] leading-none mb-1">{totalCourses}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">Active<br/>Courses</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Timeline Section */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-2 px-1">
          <BookOpen className="h-5 w-5 text-[#F18231]" />
          <h2 className="text-[17px] font-extrabold text-[#0F172A] tracking-tight">
            Enrollment Timeline
          </h2>
        </div>

        {totalCourses === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[20px] border border-slate-200 border-dashed bg-white py-16 px-6 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4">
              <BookOpen className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Active Enrollments</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              You haven't enrolled in any courses yet. Browse our engineering tracks to start your learning journey.
            </p>
            <a
              href={process.env.NEXT_PUBLIC_COURSES_URL || "http://localhost:3000/?domain=courses"}
              className="inline-flex items-center justify-center rounded-lg bg-[#F18231] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d96f21] transition-colors"
            >
              Discover Courses
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            {uniqueCourseIds.map(courseId => {
              const { course, trackType, ownedLevels, enrollNo } = courseGroups[courseId]
              const activeLevelId = activeCourseLevels[courseId] || ownedLevels[0]
              
              // Find the classroom link from REAL content_items for the active level
              const activeLevelData = enrolledLevelsData[activeLevelId]
              const activeItems = activeLevelData?.content_items || []
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const classroomItem = activeItems.find((i: any) => i.content_type === 'drive' || i.title.toLowerCase().includes('classroom'))
              const classroomUrl = classroomItem?.url || 'https://classroom.google.com'
              
              const sortedLevels = [...(course.levels || [])].sort((a, b) => a.no - b.no)

              let nextUnlockableLevelId: string | null = null
              
              if (trackType === 'Progressive') {
                // Find highest completed level number
                let highestCompletedNo = 0
                for (const lvlId of ownedLevels) {
                  const levelData = enrolledLevelsData[lvlId]
                  if (!levelData) continue
                  
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const isCompleted = levelData.status === 'Completed' ||
                                      levelData.is_completed === true ||
                                      levelData.content_items?.some((i: any) => i.is_completed === true)
                                      
                  if (isCompleted) {
                    const l = sortedLevels.find(s => s.level_id === lvlId)
                    if (l && l.no > highestCompletedNo) {
                      highestCompletedNo = l.no
                    }
                  }
                }
                
                // Find the exact next level in sequence
                if (highestCompletedNo > 0) {
                  const nextLvl = sortedLevels.find(s => s.no === highestCompletedNo + 1)
                  if (nextLvl && !ownedLevels.includes(nextLvl.level_id)) {
                    nextUnlockableLevelId = nextLvl.level_id
                  }
                }
              }

              return (
                <div key={courseId} className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm space-y-8 overflow-hidden relative">
                  {/* Subtle background decoration */}
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-slate-50/50 rounded-bl-[400px] pointer-events-none -z-10"></div>
                  
                  {/* Course Header & Buttons */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-100 pb-5">
                    <div className="space-y-2.5">
                      <h3 className="text-[22px] font-extrabold text-[#0F172A] leading-tight">
                        {course.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex rounded bg-orange-50 px-3 py-1 text-[10px] font-black text-[#F18231] tracking-widest uppercase">
                          {trackType} Track
                        </span>
                        {enrollNo && (
                          <span className="inline-flex rounded bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-500 tracking-widest uppercase border border-slate-200">
                            ID: {enrollNo}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`/courses/${course.slug}?track=${trackType}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        Buy More Levels
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      </Link>
                      <a
                        href={classroomUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0F172A] px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm shadow-slate-900/10"
                      >
                        Join Google Classroom
                        <ExternalLink className="h-4 w-4 text-[#F18231]" />
                      </a>
                    </div>
                  </div>

                  {/* Level Stepper Timeline */}
                  <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar">
                    {sortedLevels.map((lvl) => {
                      const isOwned = ownedLevels.includes(lvl.level_id)
                      const isActive = activeLevelId === lvl.level_id
                      const isNextUnlockable = lvl.level_id === nextUnlockableLevelId
                      
                      let bgClass = 'bg-slate-100 border-slate-200'
                      let textClass = 'text-slate-500'
                      let icon = <Hash className="h-4 w-4" />

                      const levelData = enrolledLevelsData[lvl.level_id]
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const isCompleted = levelData && (
                        levelData.status === 'Completed' || 
                        levelData.is_completed === true || 
                        levelData.content_items?.some((i: any) => i.is_completed === true)
                      )

                      if (isOwned) {
                        bgClass = isActive 
                          ? 'bg-orange-50 border-[#F18231] hover:border-[#F18231]' 
                          : 'bg-orange-50 border-orange-300 hover:border-[#F18231]'
                        textClass = 'text-[#F18231]'
                        
                        if (isCompleted) {
                          icon = <CheckCircle2 className="h-4 w-4" />
                        } else {
                          icon = <Clock className="h-4 w-4" />
                        }
                      } else if (isNextUnlockable) {
                        bgClass = 'bg-orange-50 border-orange-400 ring-2 ring-[#F18231]/30 hover:bg-[#F18231] group'
                        textClass = 'text-[#F18231] group-hover:text-white transition-colors'
                        icon = <Lock className="h-4 w-4 group-hover:text-white transition-colors" />
                      }

                      return (
                        <div key={lvl.level_id} className="flex items-center gap-3 shrink-0">
                          {/* Level Box */}
                          <div
                            onClick={() => {
                              if (isOwned) {
                                handleLevelClick(courseId, lvl.level_id, isOwned)
                              } else if (isNextUnlockable) {
                                const checkoutParams = new URLSearchParams({
                                  course_id: course.course_id,
                                  slug: course.slug,
                                  track: 'Progressive',
                                  amount: lvl.price.toString(),
                                  levels: lvl.level_id,
                                })
                                router.push(`/checkout?${checkoutParams.toString()}`)
                              }
                            }}
                            className={`flex flex-col justify-center w-40 h-24 rounded-xl border-2 p-3 transition-all ${
                              (isOwned || isNextUnlockable) ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'
                            } ${bgClass}`}
                          >
                            <div className={`flex items-center justify-between mb-2 ${textClass}`}>
                              <span className="text-[10px] font-bold uppercase tracking-wider">
                                Level {lvl.no}
                              </span>
                              {icon}
                            </div>
                            {isNextUnlockable ? (
                               <div className="flex flex-col gap-0.5">
                                 <p className="text-[10px] text-[#F18231] group-hover:text-orange-100 transition-colors line-clamp-1">{lvl.level_title}</p>
                                 <p className="text-xs font-bold leading-tight text-[#F18231] group-hover:text-white transition-colors flex items-center gap-1">
                                   Unlock Now <ArrowRight className="h-3 w-3" />
                                 </p>
                               </div>
                            ) : (
                               <p className={`text-xs font-semibold leading-tight line-clamp-2 ${isOwned ? 'text-[#0F172A]' : 'text-slate-500'}`}>
                                 {lvl.level_title}
                               </p>
                            )}
                          </div>

                          {/* Certificate Button */}
                          <div className="flex flex-col items-center justify-center w-12 gap-1">
                            <div className={`h-0.5 w-full ${isCompleted ? 'bg-[#F18231]' : isOwned ? 'bg-orange-200/50' : 'bg-slate-200'}`} />
                            <button
                              title={isCompleted ? `View Certificate for Level ${lvl.no}` : `Complete Level ${lvl.no} to unlock certificate`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isCompleted) {
                                  // Can optionally route to certificate view if needed
                                }
                              }}
                              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all shrink-0 ${
                                isCompleted
                                  ? 'border-[#F18231] bg-orange-50 text-[#F18231] shadow-sm hover:scale-110'
                                  : isOwned
                                  ? 'border-orange-200 bg-orange-50/30 text-orange-300 cursor-not-allowed'
                                  : 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
                              }`}
                            >
                              <Award className="h-4 w-4" />
                            </button>
                            <div className={`h-0.5 w-full ${isCompleted ? 'bg-[#F18231]' : isOwned ? 'bg-orange-200/50' : 'bg-slate-200'}`} />
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
