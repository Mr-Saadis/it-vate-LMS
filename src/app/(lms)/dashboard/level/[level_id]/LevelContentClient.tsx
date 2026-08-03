'use client'

import { ContentItem } from '@/lib/types'
import Link from 'next/link'
import {
  ArrowLeft,
  PlayCircle,
  FileText,
  HardDrive,
  Link as LinkIcon,
  Code2,
  ExternalLink,
  BookOpen
} from 'lucide-react'

interface LevelContentClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  level: any
}

const IconMap = {
  video: PlayCircle,
  pdf: FileText,
  drive: HardDrive,
  link: LinkIcon,
  code: Code2,
}

const ColorMap = {
  video: 'text-red-500 bg-red-50 border-red-100',
  pdf: 'text-blue-500 bg-blue-50 border-blue-100',
  drive: 'text-green-500 bg-green-50 border-green-100',
  link: 'text-purple-500 bg-purple-50 border-purple-100',
  code: 'text-slate-700 bg-slate-100 border-slate-200',
}

export function LevelContentClient({ level }: LevelContentClientProps) {
  const contentItems: ContentItem[] = level.content_items || []
  const courseName = level.courses?.name || 'Course'

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-8 space-y-8 pb-20">
      {/* Header */}
      <div className="space-y-4">
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/50 rounded-full blur-3xl -z-10 -mr-20 -mt-20"></div>
          
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
              <BookOpen className="h-3 w-3" />
              {courseName}
            </span>
            <span className="inline-flex items-center rounded-md bg-orange-50 px-2.5 py-1 text-[10px] font-black tracking-widest text-[#F18231] uppercase">
              Level {level.no}
            </span>
          </div>
          
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
            {level.level_title}
          </h1>
          
          {level.level_description && (
            <p className="text-sm text-slate-500 mt-2 max-w-2xl">
              {level.level_description}
            </p>
          )}
        </div>
      </div>

      {/* Content List */}
      <div className="space-y-4">
        <h2 className="text-[15px] font-extrabold text-[#0F172A] tracking-tight px-1 flex items-center gap-2">
          Course Materials
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] text-slate-500">{contentItems.length} items</span>
        </h2>

        {contentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 border-dashed bg-white py-16 px-6 text-center shadow-sm">
            <BookOpen className="h-10 w-10 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No Materials Yet</h3>
            <p className="text-sm text-slate-500">
              Content for this level will be added soon. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {contentItems.map((item, idx) => {
              const Icon = IconMap[item.content_type] || FileText
              const colorClass = ColorMap[item.content_type] || ColorMap.link
              
              return (
                <a
                  key={item.content_items_id}
                  href={item.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-4 rounded-xl border border-slate-200/60 bg-white p-4 transition-all duration-200 hover:shadow-md hover:border-slate-300 ${
                    !item.url ? 'pointer-events-none opacity-70' : ''
                  }`}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${colorClass} transition-transform group-hover:scale-105`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {idx + 1}. {item.content_type}
                      </span>
                      {item.is_free && (
                        <span className="rounded bg-green-50 px-1.5 py-0.5 text-[9px] font-bold text-green-600 uppercase tracking-wider">Free</span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-[#0F172A] truncate group-hover:text-[#F18231] transition-colors">
                      {item.title}
                    </h4>
                  </div>

                  <div className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-slate-50 border border-slate-100 group-hover:bg-[#F18231] group-hover:border-[#F18231] transition-colors">
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-white" />
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
