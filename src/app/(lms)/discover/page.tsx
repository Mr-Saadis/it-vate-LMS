import Link from 'next/link'
import { MOCK_COURSES } from '@/lib/mockData'
import { BookOpen, ArrowRight, ShieldCheck, Zap } from 'lucide-react'

export default function DiscoverCoursesPage() {
  return (
    <div className="mx-auto max-w-7xl px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">Internal Upgrades & Cross-Sell</span>
        <h1 className="text-2xl font-bold text-[#0F172A]">Discover Additional Courses & Tracks</h1>
        <p className="text-xs text-slate-600">
          Enroll in additional levels or upgrade your track directly from within your LMS dashboard without re-authenticatin.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {MOCK_COURSES.map((course) => (
          <div key={course.course_id} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <span className="inline-block rounded bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-[#0F172A]">
                {course.category}
              </span>
              <h3 className="text-lg font-bold text-[#0F172A]">{course.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{course.description}</p>
            </div>

            <Link
              href={`/courses/${course.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F18231] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#d96f21] transition-colors"
            >
              Configure Track & Enroll
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
