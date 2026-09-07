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
  CalendarDays,
  PlayCircle,
  FileText,
  HardDrive,
  Link as LinkIcon,
  Code2,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { NextLevelBatchDialog, NextLevelBatchInfo } from './NextLevelBatchDialog'

const IconMap: Record<string, any> = {
  video: PlayCircle,
  pdf: FileText,
  drive: HardDrive,
  link: LinkIcon,
  code: Code2,
}

const ColorMap: Record<string, string> = {
  video: 'text-red-500 bg-red-50 border-red-100',
  pdf: 'text-blue-500 bg-blue-50 border-blue-100',
  drive: 'text-green-500 bg-green-50 border-green-100',
  link: 'text-purple-500 bg-purple-50 border-purple-100',
  code: 'text-slate-700 bg-slate-100 border-slate-200',
}

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
  const [isDownloadingCert, setIsDownloadingCert] = useState<Record<string, boolean>>({})

  // Next-level batch dialog state
  const [nextLevelDialogOpen, setNextLevelDialogOpen] = useState(false)
  const [nextLevelInfo, setNextLevelInfo] = useState<{
    levelId: string
    levelNo: number
    levelTitle: string
    courseId: string
    trackType: string
    batches: NextLevelBatchInfo[]
  } | null>(null)

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
    
    const filteredContentItems = (level.content_items || []).filter((item: any) => {
      // Support both new date-based batches and legacy link-based batches
      const isBatchItem = (item.start_date && item.end_date) || item.content_type === 'link'
      if (isBatchItem) {
        return item.content_items_id === enroll.content_items_id
      }
      return true
    })

    enrolledLevelsData[level.level_id] = {
      started_at: level.started_at,
      ended_at: level.ended_at,
      content_items: filteredContentItems,
      status: enroll.status,
      is_completed: enroll.is_completed,
      assigned_batch_id: enroll.content_items_id
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
  
  // Post-process to ensure Expert track has all levels owned
  uniqueCourseIds.forEach(courseId => {
    const group = courseGroups[courseId]
    if (group.trackType === 'Expert') {
      const allLevelIds = (group.course.levels || []).map(l => l.level_id)
      group.ownedLevels = allLevelIds
    }
  })

  const totalCourses = uniqueCourseIds.length

  const sortedCourseIds = [...uniqueCourseIds].sort((a, b) => {
    const isCompletedA = courseGroups[a].ownedLevels.length > 0 && courseGroups[a].ownedLevels.every(lvlId => {
      const data = enrolledLevelsData[lvlId];
      return data && (data.status === 'Completed' || data.is_completed === true || data.content_items?.some((i: any) => i.is_completed === true));
    });
    const isCompletedB = courseGroups[b].ownedLevels.length > 0 && courseGroups[b].ownedLevels.every(lvlId => {
      const data = enrolledLevelsData[lvlId];
      return data && (data.status === 'Completed' || data.is_completed === true || data.content_items?.some((i: any) => i.is_completed === true));
    });
    if (isCompletedA && !isCompletedB) return 1;
    if (!isCompletedA && isCompletedB) return -1;
    return 0;
  });

  // User must click a level to view its details (no level is active by default)
  // useEffect removed for initial active state
  const handleLevelClick = (courseId: string, levelId: string, isOwned: boolean, trackType: string, isLockedForExpert: boolean) => {
    if (isOwned) {
      if (trackType === 'Expert' && isLockedForExpert) {
        toast.error("Please complete the previous level first.")
        return
      }
      setActiveCourseLevels(prev => ({ 
        ...prev, 
        [courseId]: prev[courseId] === levelId ? '' : levelId 
      }))
    }
  }

  const handleDownloadCertificate = async (levelId: string, courseId: string) => {
    try {
      setIsDownloadingCert(prev => ({ ...prev, [levelId]: true }))
      const res = await fetch(`/api/certificates/download?level_id=${levelId}&course_id=${courseId}`)
      
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to download certificate')
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // Provide a generic fallback name, server Content-Disposition will typically override this anyway,
      // but the <a> tag 'download' attribute is useful for forcing the browser download behavior.
      a.download = `Certificate.pdf` 
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success("Certificate downloaded successfully!")
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'An error occurred while downloading the certificate.')
    } finally {
      setIsDownloadingCert(prev => ({ ...prev, [levelId]: false }))
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
            {sortedCourseIds.map(courseId => {
              const { course, trackType, ownedLevels, enrollNo } = courseGroups[courseId]
              const activeLevelId = activeCourseLevels[courseId] || null
              
              const sortedLevels = [...(course.levels || [])].sort((a, b) => a.no - b.no)

              // Find the classroom link from the assigned batch of the active level (or first owned level)
              let targetLevelId = activeLevelId
              if (!targetLevelId && sortedLevels.length > 0) {
                const firstOwned = sortedLevels.find(l => ownedLevels.includes(l.level_id))
                if (firstOwned) targetLevelId = firstOwned.level_id
              }
              const targetLevelData = targetLevelId ? enrolledLevelsData[targetLevelId] : undefined
              const assignedBatchId = targetLevelData?.assigned_batch_id

              // Search across all items in the user's enrollments to find the assigned batch
              // (This ensures we have the full item data including the URL, which is omitted in the public courses API)
              const allEnrolledItems = Object.values(enrolledLevelsData).flatMap((data: any) => data.content_items || [])
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const batchItem = allEnrolledItems.find((i: any) => i.content_items_id === assignedBatchId)
              
              let classroomUrl = 'https://classroom.google.com'
              if (batchItem?.url) {
                classroomUrl = batchItem.url.startsWith('http') ? batchItem.url : `https://${batchItem.url}`
              }

              let isTargetLevelCompleted = false;
              if (targetLevelData) {
                isTargetLevelCompleted = targetLevelData.status === 'Completed' ||
                                         targetLevelData.is_completed === true ||
                                         targetLevelData.content_items?.some((i: any) => i.is_completed === true);
              }

              let nextUnlockableLevelId: string | null = null
              
              if (trackType === 'Progressive' || trackType === 'Fast' || trackType === 'Expert') {
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
                  if (nextLvl) {
                    if (trackType === 'Fast' || trackType === 'Expert') {
                      // For Fast/Expert, they already own all levels, but might need to pick a batch
                      if (ownedLevels.includes(nextLvl.level_id)) {
                        const nextData = enrolledLevelsData[nextLvl.level_id]
                        
                        // Check if the assigned batch actually belongs to THIS level.
                        // In Expert track, checkout might assign Level 1's batch to Level 2 as a placeholder.
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const batchBelongsToThisLevel = (nextLvl.content_items || []).some((i: any) => i.content_items_id === nextData?.assigned_batch_id)

                        if (!nextData?.assigned_batch_id || !batchBelongsToThisLevel) {
                          nextUnlockableLevelId = nextLvl.level_id
                        }
                      }
                    }
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
                      {trackType !== 'Expert' && trackType !== 'Premium' && (
                        <Link
                          href={`/courses/${course.slug}?track=${trackType}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                          Buy More Levels
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                        </Link>
                      )}
                      {trackType === 'Premium' ? (
                        <a
                          href="mailto:admin@it-vate.com"
                          className="inline-flex items-center gap-2 rounded-xl bg-[#0F172A] px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm shadow-slate-900/10"
                        >
                          Contact Admin
                          <ExternalLink className="h-4 w-4 text-[#F18231]" />
                        </a>
                      ) : !isTargetLevelCompleted && (
                        <a
                          href={classroomUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-[#0F172A] px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm shadow-slate-900/10"
                        >
                          Join Google Classroom
                          <ExternalLink className="h-4 w-4 text-[#F18231]" />
                        </a>
                      )}
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

                      let isLockedForExpert = false;
                      if (trackType === 'Expert') {
                        const sortedOwnedLevels = [...ownedLevels].sort((aId, bId) => {
                          const lA = sortedLevels.find(s => s.level_id === aId)
                          const lB = sortedLevels.find(s => s.level_id === bId)
                          return (lA?.no || 0) - (lB?.no || 0)
                        })
                        
                        const myIndex = sortedOwnedLevels.indexOf(lvl.level_id)
                        if (myIndex > 0) {
                          const prevLvlId = sortedOwnedLevels[myIndex - 1]
                          const prevLvlData = enrolledLevelsData[prevLvlId]
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const prevIsCompleted = prevLvlData && (
                            prevLvlData.status === 'Completed' || 
                            prevLvlData.is_completed === true || 
                            prevLvlData.content_items?.some((i: any) => i.is_completed === true)
                          )
                          if (!prevIsCompleted) {
                            isLockedForExpert = true;
                          }
                        }
                      }

                      if (isOwned) {
                        if (trackType === 'Expert') {
                          bgClass = isActive 
                            ? 'bg-orange-50 border-[#F18231] hover:border-[#F18231]' 
                            : 'bg-orange-50/50 border-orange-200 hover:border-orange-300'
                          textClass = isActive ? 'text-[#F18231]' : 'text-orange-400/80'
                          
                          if (isCompleted) {
                            icon = <CheckCircle2 className={`h-4 w-4 ${isActive ? 'text-[#F18231]' : 'text-orange-400/80'}`} />
                          } else if (isLockedForExpert) {
                            icon = <Lock className={`h-4 w-4 ${isActive ? 'text-[#F18231]' : 'text-orange-300/80'}`} />
                          } else {
                            icon = <Clock className={`h-4 w-4 ${isActive ? 'text-[#F18231]' : 'text-orange-400/80'}`} />
                          }
                        } else {
                          bgClass = isActive 
                            ? 'bg-orange-50 border-[#F18231] hover:border-[#F18231]' 
                            : 'bg-orange-50 border-orange-300 hover:border-[#F18231]'
                          textClass = 'text-[#F18231]'
                          
                          if (isCompleted) {
                            icon = <CheckCircle2 className="h-4 w-4" />
                          } else {
                            icon = <Clock className="h-4 w-4" />
                          }
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
                              if (isLockedForExpert) {
                                toast.error('Complete the previous level first.')
                                return
                              }
                              
                              if (isNextUnlockable) {
                                // Get batches for this level from content_items
                                const levelData = course.levels?.find(l => l.level_id === lvl.level_id)
                                const batches: NextLevelBatchInfo[] = (levelData?.content_items || [])
                                  .filter((item: any) => item.start_date && item.end_date)
                                  .map((item: any) => ({
                                    content_items_id: item.content_items_id,
                                    title: item.title,
                                    start_date: item.start_date,
                                    end_date: item.end_date,
                                  }))

                                setNextLevelInfo({
                                  levelId: lvl.level_id,
                                  levelNo: lvl.no,
                                  levelTitle: lvl.level_title,
                                  courseId,
                                  trackType,
                                  batches,
                                })
                                setNextLevelDialogOpen(true)
                                return
                              }

                              if (!isOwned && trackType === 'Progressive') {
                                // Progressive track boxes are strictly status indicators and are not clickable.
                                // Users must use the "Buy More Levels" button to navigate to the course page.
                                return
                              }

                              if (isOwned) {
                                handleLevelClick(courseId, lvl.level_id, isOwned, trackType, isLockedForExpert)
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
                              title={isCompleted ? `Download Certificate for Level ${lvl.no}` : `Complete Level ${lvl.no} to unlock certificate`}
                              disabled={!isCompleted || isDownloadingCert[lvl.level_id]}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isCompleted) {
                                  handleDownloadCertificate(lvl.level_id, courseId);
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
                              {isDownloadingCert[lvl.level_id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Award className="h-4 w-4" />
                              )}
                            </button>
                            <div className={`h-0.5 w-full ${isCompleted ? 'bg-[#F18231]' : isOwned ? 'bg-orange-200/50' : 'bg-slate-200'}`} />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Inline Level Content for All Tracks */}
                  {activeLevelId && (
                    (() => {
                      const activeLevelInfo = sortedLevels.find(l => l.level_id === activeLevelId)
                      const activeLevelData = enrolledLevelsData[activeLevelId]
                      const activeItems = activeLevelData?.content_items || []
                      const isActiveLevelCompleted = activeLevelData && (
                        activeLevelData.status === 'Completed' ||
                        activeLevelData.is_completed === true ||
                        activeLevelData.content_items?.some((i: any) => i.is_completed === true)
                      )
                      
                      return (
                        <div className="mt-8 border-t border-slate-100 pt-8 animate-in fade-in duration-300">
                          <div className="mb-6 space-y-2">
                            <h4 className="text-xl font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                              {activeLevelInfo?.level_title}
                              <span className="rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-black text-[#F18231] uppercase tracking-widest">
                                Level {activeLevelInfo?.no}
                              </span>
                            </h4>
                            {activeLevelInfo?.level_description && (
                              <p className="text-sm text-slate-500 max-w-3xl">
                                {activeLevelInfo.level_description}
                              </p>
                            )}
                          </div>

                          <h5 className="text-[13px] font-extrabold text-[#0F172A] tracking-tight mb-4 flex items-center gap-2">
                            Course Materials
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 font-bold">{activeItems.length} items</span>
                          </h5>

                          {activeItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 border-dashed bg-slate-50/50 py-12 px-6 text-center">
                              <BookOpen className="h-8 w-8 text-slate-300 mb-2" />
                              <p className="text-sm font-bold text-slate-600">No materials available yet</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {activeItems.map((item: any, idx: number) => {
                                const Icon = IconMap[item.content_type] || FileText
                                const colorClass = ColorMap[item.content_type] || ColorMap.link
                                
                                return (
                                  <div
                                    key={item.content_items_id}
                                    className="group flex flex-col gap-3 rounded-xl border border-slate-200/60 bg-white p-3.5 transition-all duration-200 hover:shadow-md hover:border-slate-300"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${colorClass} transition-transform group-hover:scale-105`}>
                                        <Icon className="h-4 w-4" />
                                      </div>
                                      
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            {item.start_date ? 'BATCH' : item.content_type}
                                          </span>
                                        </div>
                                        <h6 className="text-[13px] font-bold text-[#0F172A] truncate group-hover:text-[#F18231] transition-colors" title={item.title}>
                                          {item.title}
                                        </h6>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {item.url && !isActiveLevelCompleted && (
                                        <a href={item.url.startsWith('http') ? item.url : `https://${item.url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 hover:bg-[#F18231] hover:text-white hover:border-[#F18231] transition-colors">
                                          <BookOpen className="h-3 w-3" /> Classroom
                                        </a>
                                      )}
                                      {item.drive_file_id && (
                                        <a href={item.drive_file_id.startsWith('http') ? item.drive_file_id : `https://drive.google.com/file/d/${item.drive_file_id}/view`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 hover:bg-[#F18231] hover:text-white hover:border-[#F18231] transition-colors">
                                          <FileText className="h-3 w-3" /> Google Drive
                                        </a>
                                      )}
                                      {item.youtube_id && (
                                        <a href={item.youtube_id.startsWith('http') ? item.youtube_id : `https://youtube.com/watch?v=${item.youtube_id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 hover:bg-[#F18231] hover:text-white hover:border-[#F18231] transition-colors">
                                          <PlayCircle className="h-3 w-3" /> YouTube
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })()
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Next Level Batch Dialog ── */}
      {nextLevelInfo && (
        <NextLevelBatchDialog
          isOpen={nextLevelDialogOpen}
          onClose={() => { setNextLevelDialogOpen(false); setNextLevelInfo(null) }}
          onSuccess={() => router.refresh()}
          levelId={nextLevelInfo.levelId}
          levelNo={nextLevelInfo.levelNo}
          levelTitle={nextLevelInfo.levelTitle}
          courseId={nextLevelInfo.courseId}
          trackType={nextLevelInfo.trackType}
          batches={nextLevelInfo.batches}
        />
      )}
    </div>
  )
}
