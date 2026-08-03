'use client'

import { useState, useEffect } from 'react'
import { ContentItem } from '@/lib/types'
import {
  ExternalLink,
  CheckCircle2,
  Video,
  FileText,
  Code,
  Layers,
} from 'lucide-react'

interface DashboardClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enrollments: any[]
  userName: string
  contentItems: Record<string, ContentItem[]>
  showApprovedBanner?: boolean
}

export function DashboardClient({
  enrollments,
  userName,
  contentItems,
  showApprovedBanner,
}: DashboardClientProps) {
  const [activeLevelId, setActiveLevelId] = useState<string>('l1')
  const [activeContent, setActiveContent] = useState<ContentItem | null>(
    contentItems['l1']?.[0] ?? null
  )
  const [showBanner, setShowBanner] = useState(showApprovedBanner)

  useEffect(() => {
    if (showApprovedBanner) {
      const timer = setTimeout(() => setShowBanner(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showApprovedBanner])

  const levelContentItems = contentItems[activeLevelId] || []

  return (
    <div className="relative mx-auto max-w-7xl px-4 md:px-8 py-6 md:py-10 space-y-8 md:space-y-10">
      {/* Auto-fading Approved Banner */}
      {showBanner && (
        <div className="absolute top-0 left-0 right-0 z-50 mx-8 mt-2 flex animate-in fade-in slide-in-from-top-4 duration-500 items-center justify-center rounded-lg bg-green-50 px-4 py-3 border border-green-200 shadow-sm transition-opacity">
          <div className="flex items-center gap-3 text-green-800 text-sm font-semibold">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Your request was approved by the admin! Welcome to your dashboard.
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#0F172A] px-2.5 py-0.5 text-xs font-bold text-white">
              STUDENT
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Verified CPDP Account
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">
            Welcome back, {userName}!
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Access your course lectures, Google Drive resources, and starter
            firmware repositories.
          </p>
        </div>

        {enrollments[0]?.enroll_no && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 shrink-0 space-y-1 transition-colors">
            <span className="text-[11px] font-bold text-[#F18231] uppercase tracking-wider">
              Permanent Enrollment ID
            </span>
            <div className="font-mono text-base font-extrabold text-[#0F172A] dark:text-white">
              {enrollments[0].enroll_no}
            </div>
          </div>
        )}
      </div>

      {/* Enrolled Courses */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">
          Enrolled Courses &amp; Active Levels
        </h2>

        {enrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed bg-white dark:bg-slate-900 py-16 px-6 text-center shadow-sm transition-colors">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-4">
              <Layers className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">No Active Enrollments</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              You haven't enrolled in any courses yet. Browse our engineering tracks to start your learning journey.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-[#F18231] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d96f21] transition-colors"
            >
              Browse Courses
            </a>
          </div>
        ) : (
          enrollments.map((item) => {
            const course = item._course || item.levels?.courses
            const levelTitle =
              item._course?.levels?.[1]?.level_title ??
              item.levels?.level_title ??
              'Level 1'
            const progressPercent = 66 // TODO: calculate from completed content items

            return (
              <div
                key={item.enroll_id}
                className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 space-y-6"
              >
                {/* Course Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-[#F18231]">
                        {item.track_type} Track
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        • {course?.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#0F172A]">
                      {course?.name}
                    </h3>
                  </div>

                  <a
                    href="https://classroom.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full md:w-auto gap-2 rounded-lg bg-[#0F172A] px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                  >
                    Join Google Classroom
                    <ExternalLink className="h-3.5 w-3.5 text-[#F18231]" />
                  </a>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#0F172A]">
                      Current Progress: {progressPercent}%
                    </span>
                    <span className="text-[#F18231]">{levelTitle}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-[#F18231] transition-all duration-500 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Level Tabs */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2">
                  {(item._course?.levels ?? []).map(
                    (
                      lvl: { level_id: string; no: number; level_title: string; code?: string },
                      index: number
                    ) => {
                      const isSelected = activeLevelId === lvl.level_id
                      return (
                        <div
                          key={lvl.level_id}
                          onClick={() => {
                            setActiveLevelId(lvl.level_id)
                            const items = contentItems[lvl.level_id] || []
                            setActiveContent(items[0] ?? null)
                          }}
                          className={`rounded-lg border p-4 text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#F18231] bg-orange-50/20 ring-2 ring-[#F18231]'
                              : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0F172A]">
                              Level {lvl.no}
                            </span>
                            {index === 0 && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            )}
                          </div>
                          <p className="font-semibold text-slate-700 truncate mt-1">
                            {lvl.level_title}
                          </p>
                          {lvl.code && (
                            <span className="text-[10px] text-slate-400">
                              {lvl.code}
                            </span>
                          )}
                        </div>
                      )
                    }
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Content Player */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#F18231]" />
            <h3 className="text-base font-bold text-[#0F172A]">
              Level Learning Material
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            Level ID:{' '}
            <code className="font-mono text-[#0F172A]">{activeLevelId}</code>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Content List */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Content Modules:
            </span>
            {levelContentItems.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">
                No content assigned for this level yet.
              </p>
            ) : (
              levelContentItems.map((item) => {
                const isActive =
                  activeContent?.content_items_id === item.content_items_id
                return (
                  <div
                    key={item.content_items_id}
                    onClick={() => setActiveContent(item)}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer text-xs transition-all ${
                      isActive
                        ? 'border-[#0F172A] bg-[#0F172A] text-white font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {item.content_type === 'video' && (
                      <Video
                        className={`h-4 w-4 ${isActive ? 'text-[#F18231]' : 'text-slate-400'}`}
                      />
                    )}
                    {item.content_type === 'drive' && (
                      <FileText
                        className={`h-4 w-4 ${isActive ? 'text-[#F18231]' : 'text-slate-400'}`}
                      />
                    )}
                    {item.content_type === 'code' && (
                      <Code
                        className={`h-4 w-4 ${isActive ? 'text-[#F18231]' : 'text-slate-400'}`}
                      />
                    )}
                    <span className="truncate flex-1">{item.title}</span>
                  </div>
                )
              })
            )}
          </div>

          {/* Player Stage */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4 md:p-6 flex flex-col justify-center space-y-4">
            {activeContent ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#0F172A]">
                    {activeContent.title}
                  </h4>
                  <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                    {activeContent.content_type}
                  </span>
                </div>

                {activeContent.content_type === 'video' &&
                  activeContent.youtube_id && (
                    <div className="relative overflow-hidden rounded-lg bg-black aspect-video">
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube-nocookie.com/embed/${activeContent.youtube_id}`}
                        title={activeContent.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                {activeContent.content_type === 'drive' && (
                  <div className="rounded-lg border border-slate-200 bg-white p-6 text-center space-y-3">
                    <FileText className="h-10 w-10 text-[#F18231] mx-auto" />
                    <p className="text-xs text-slate-600">
                      Drive file resource attached to your enrollment.
                    </p>
                    <a
                      href={activeContent.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                    >
                      Open Google Drive File{' '}
                      <ExternalLink className="h-3.5 w-3.5 text-[#F18231]" />
                    </a>
                  </div>
                )}

                {activeContent.content_type === 'code' && (
                  <div className="rounded-lg border border-slate-200 bg-[#0F172A] p-6 text-center space-y-3">
                    <Code className="h-10 w-10 text-[#F18231] mx-auto" />
                    <p className="text-xs text-slate-300">
                      Firmware code repository (C/C++ &amp; STM32 bare metal template).
                    </p>
                    <a
                      href={activeContent.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#F18231] px-4 py-2 text-xs font-bold text-white hover:bg-[#d96f21]"
                    >
                      Access GitHub Repository{' '}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-10">
                Select a content module to load learning material.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
