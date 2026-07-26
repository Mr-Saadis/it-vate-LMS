'use client'

import { useState, useEffect } from 'react'
import { MOCK_COURSES, MOCK_CONTENT_ITEMS } from '@/lib/mockData'
import { ContentItem } from '@/lib/types'
import {
  ExternalLink,
  CheckCircle2,
  PlayCircle,
  Video,
  FileText,
  Code,
  Cpu,
  Layers
} from 'lucide-react'

export default function StudentDashboardPage() {
  const [userName, setUserName] = useState('Saad Ali')
  const [activeLevelId, setActiveLevelId] = useState<string>('l1')
  const [activeContent, setActiveContent] = useState<ContentItem | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('itvate_session_user')
      if (session) {
        try {
          const user = JSON.parse(session)
          if (user.name) setUserName(user.name)
        } catch {}
      }
    }
    const items = MOCK_CONTENT_ITEMS['l1'] || []
    if (items.length > 0) setActiveContent(items[0])
  }, [])

  const enrolledCourses = [
    {
      course: MOCK_COURSES[0],
      track_type: 'Expert',
      cpdp_id: 'CPDP202607001',
      progress_percent: 66,
      current_level: 'Level 2: Peripherals (I2C, SPI, UART, Timers, ADC)',
      classroom_link: 'https://classroom.google.com/c/ITVATE_EMBEDDED_2026',
    },
  ]

  const levelContentItems = MOCK_CONTENT_ITEMS[activeLevelId] || []

  return (
    <div className="mx-auto max-w-7xl px-8 py-10 space-y-10">
      {/* Student Welcome Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#0F172A] px-2.5 py-0.5 text-xs font-bold text-white">STUDENT</span>
            <span className="text-xs font-semibold text-slate-500">Verified CPDP Account</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Welcome back, {userName}!</h1>
          <p className="text-xs text-slate-600">
            Access your course lectures, Google Drive resources, logic analyzer traces, and starter firmware repos.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shrink-0 space-y-1">
          <span className="text-[11px] font-bold text-[#F18231] uppercase tracking-wider">Permanent Enrollment ID</span>
          <div className="font-mono text-base font-extrabold text-[#0F172A]">CPDP202607001</div>
        </div>
      </div>

      {/* Main Enrolled Course Card */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-[#0F172A]">Enrolled Course & Active Levels</h2>

        {enrolledCourses.map((item) => (
          <div key={item.course.course_id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-[#F18231]">
                    {item.track_type} Track
                  </span>
                  <span className="text-xs font-semibold text-slate-400">• {item.course.category}</span>
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">{item.course.name}</h3>
              </div>

              <a
                href={item.classroom_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
              >
                Join Google Classroom
                <ExternalLink className="h-3.5 w-3.5 text-[#F18231]" />
              </a>
            </div>

            {/* Level Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#0F172A]">Current Progress: {item.progress_percent}%</span>
                <span className="text-[#F18231]">{item.current_level}</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[#F18231] transition-all duration-500 rounded-full"
                  style={{ width: `${item.progress_percent}%` }}
                />
              </div>
            </div>

            {/* Interactive Level Selector Tabs */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2">
              {item.course.levels?.map((lvl, index) => {
                const isSelected = activeLevelId === lvl.level_id
                return (
                  <div
                    key={lvl.level_id}
                    onClick={() => {
                      setActiveLevelId(lvl.level_id)
                      const items = MOCK_CONTENT_ITEMS[lvl.level_id] || []
                      if (items.length > 0) setActiveContent(items[0])
                    }}
                    className={`rounded-lg border p-4 text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#F18231] bg-orange-50/20 ring-2 ring-[#F18231]'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0F172A]">Level {lvl.no}</span>
                      {index === 0 && <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
                    </div>
                    <p className="font-semibold text-slate-700 truncate mt-1">{lvl.level_title}</p>
                    <span className="text-[10px] text-slate-400">Code: {lvl.code}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Content Items Player & Resource Viewer (Content_Items Table) */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#F18231]" />
            <h3 className="text-base font-bold text-[#0F172A]">Level Learning Material & Content Items</h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            Level ID: <code className="font-mono text-[#0F172A]">{activeLevelId}</code>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Content Items List Sidebar */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Content Modules:</span>
            {levelContentItems.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No content items assigned yet for this level.</p>
            ) : (
              levelContentItems.map((item) => {
                const isActive = activeContent?.content_items_id === item.content_items_id
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
                    {item.content_type === 'video' && <Video className={`h-4 w-4 ${isActive ? 'text-[#F18231]' : 'text-slate-400'}`} />}
                    {item.content_type === 'drive' && <FileText className={`h-4 w-4 ${isActive ? 'text-[#F18231]' : 'text-slate-400'}`} />}
                    {item.content_type === 'code' && <Code className={`h-4 w-4 ${isActive ? 'text-[#F18231]' : 'text-slate-400'}`} />}
                    <span className="truncate flex-1">{item.title}</span>
                  </div>
                )
              })
            )}
          </div>

          {/* Player / Document Preview Stage */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col justify-center space-y-4">
            {activeContent ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#0F172A]">{activeContent.title}</h4>
                  <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                    Type: {activeContent.content_type}
                  </span>
                </div>

                {activeContent.content_type === 'video' && activeContent.youtube_id && (
                  <div className="relative overflow-hidden rounded-lg bg-black aspect-video flex items-center justify-center">
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
                    <p className="text-xs text-slate-600">Drive File Resource attached to your student enrollment.</p>
                    <a
                      href={activeContent.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                    >
                      Open Google Drive File <ExternalLink className="h-3.5 w-3.5 text-[#F18231]" />
                    </a>
                  </div>
                )}

                {activeContent.content_type === 'code' && (
                  <div className="rounded-lg border border-slate-200 bg-[#0F172A] text-white p-6 text-center space-y-3">
                    <Code className="h-10 w-10 text-[#F18231] mx-auto" />
                    <p className="text-xs text-slate-300">Firmware Code Repository (C/C++ & STM32 bare metal template).</p>
                    <a
                      href={activeContent.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#F18231] px-4 py-2 text-xs font-bold text-white hover:bg-[#d96f21]"
                    >
                      Access GitHub Repository <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-10">Select a content module to load learning material.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
