import { notFound } from 'next/navigation'
import { getCourseBySlug } from '@/lib/api/courses'
import { TrackSelector } from './TrackSelector'
import { BookOpen } from 'lucide-react'

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
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 space-y-12">
      {/* Course Overview Header */}
      <div className="border-b border-slate-200 pb-8 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-[#0F172A]">
          <BookOpen className="h-3.5 w-3.5 text-[#F18231]" />
          {course.category}
        </div>
        <h1 className="text-3xl font-extrabold text-[#0F172A] sm:text-4xl">{course.name}</h1>
        <p className="text-base text-slate-600 max-w-3xl leading-relaxed">{course.description}</p>
      </div>

      {/* Curriculum Outline */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-lg font-bold text-[#0F172A]">Available Course Levels</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {course.levels?.map((lvl) => (
            <div key={lvl.level_id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
              <span className="text-[11px] font-bold text-[#F18231]">Level {lvl.no}</span>
              <h3 className="text-sm font-bold text-[#0F172A]">{lvl.level_title}</h3>
              <p className="text-xs text-slate-500">{lvl.level_description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive 4-Track System Component */}
      <TrackSelector course={course} />
    </div>
  )
}
