import Link from 'next/link'
import { MOCK_COURSES } from '@/lib/mockData'
import { ArrowRight, BookOpen } from 'lucide-react'

export default function CoursesCatalogPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 space-y-12">
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">Engineering Course Catalog</span>
        <h1 className="text-3xl font-extrabold text-[#0F172A] sm:text-4xl">
          Browse Programs & Enroll in Track Systems
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Select from our specialized hardware and firmware engineering courses. Every course supports flexible enrollment through our 4-Track System.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {MOCK_COURSES.map((course) => (
          <div
            key={course.course_id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-8 space-y-6 hover:border-slate-300 transition-all shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-[#0F172A]">
                  <BookOpen className="h-3 w-3 text-[#F18231]" />
                  {course.category}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {course.levels?.length} Levels
                </span>
              </div>

              <h2 className="text-xl font-bold text-[#0F172A] leading-snug">{course.name}</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{course.description}</p>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Curriculum Outline:</span>
                <ul className="space-y-1 text-xs text-slate-700">
                  {course.levels?.map((lvl) => (
                    <li key={lvl.level_id} className="truncate">
                      • {lvl.level_title} (${lvl.price})
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Link
              href={`/courses/${course.slug}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#F18231] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#d96f21]"
            >
              Configure Enrollment Tracks
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
