import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getCourseBySlug } from '@/lib/api/courses'
import { TrackSelector } from './TrackSelector'
import { Cpu, CheckCircle2 } from 'lucide-react'

interface CoursePageProps {
  params: Promise<{ slug: string }>
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)

  if (!course) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 space-y-10">
      
      {/* 1. Header Banner (Dark Navy Surface) */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1120] p-8 md:p-10 shadow-xl space-y-4">
        {/* Ambient mesh background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#F18231_1px,transparent_1px)] [background-size:20px_20px] opacity-5 pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#F18231]/30 bg-[#F18231]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#F18231]">
            <Cpu className="h-3.5 w-3.5 text-[#F18231]" />
            {course.category}
          </span>

          <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl leading-tight">
            {course.name}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed font-normal max-w-3xl">
            {course.description}
          </p>

          <div className="pt-2 flex flex-wrap gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#F18231]" />
              <span>CPDP Accredited Curriculum</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#F18231]" />
              <span>Flexible 4-Track System</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Available Course Levels (Equal Grid) */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 md:p-8 space-y-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">
            Curriculum Structure
          </span>
          <h2 className="text-xl font-bold text-[#0F172A]">Available Course Levels</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {course.levels?.map((lvl) => (
            <div
              key={lvl.level_id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors h-full space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-block rounded bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-[#F18231]">
                    Level {lvl.no}
                  </span>
                  <span className="text-xs font-bold text-[#0F172A]">
                    PKR {lvl.price.toLocaleString()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#0F172A] leading-snug">{lvl.level_title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{lvl.level_description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 & 4. Interactive 4-Track System & Sticky Summary Sidebar */}
      <Suspense fallback={<div className="h-96 w-full animate-pulse bg-slate-100 rounded-xl"></div>}>
        <TrackSelector course={course} />
      </Suspense>

    </div>
  )
}
