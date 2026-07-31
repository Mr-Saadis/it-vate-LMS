import Link from 'next/link'
import { ArrowRight, BookOpen, Layers, Cpu, Wifi } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MOCK_COURSES } from '@/lib/mockData'

export const metadata = {
  title: 'Engineering Courses — IT-vate Solutions',
  description: 'Enroll in specialized Embedded Systems, IoT, and PCB Design engineering courses with our flexible 4-Track system.',
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Hardware Engineering': <Cpu className="h-4 w-4" />,
  'Internet of Things': <Wifi className="h-4 w-4" />,
  'Hardware Design': <Layers className="h-4 w-4" />,
}

export default async function CoursesLandingPage() {
  // Try to fetch from Supabase; fall back to mock data if DB not seeded yet
  let courses = MOCK_COURSES
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('courses')
      .select('*, levels(*)')
      .eq('is_active', true)
      .order('name')

    if (!error && data && data.length > 0) {
      courses = data
    }
  } catch {
    // DB not configured yet — use mock data
  }

  return (
    <>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-[#0F172A] px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <span className="mb-4 inline-block rounded-full bg-[#F18231]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#F18231]">
            Engineering Education Platform
          </span>
          <h1 className="mt-3 text-4xl font-extrabold text-white sm:text-5xl">
            Master Hardware &amp; Firmware
            <br />
            <span className="text-[#F18231]">Engineering</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-400 leading-relaxed">
            Industry-grade courses in Embedded Systems, Industrial IoT, and PCB Design.
            Choose from our flexible 4-Track enrollment system — Expert, Progressive, Fast, or Premium.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#catalog"
              className="rounded-lg bg-[#F18231] px-6 py-3 text-sm font-bold text-white hover:bg-[#d96f21] transition-colors"
            >
              Browse Courses
            </a>
            <Link
              href="/signup"
              className="rounded-lg border border-slate-600 px-6 py-3 text-sm font-bold text-white hover:border-slate-400 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Course Catalog */}
      <section id="catalog" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-10 max-w-3xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">
            Engineering Course Catalog
          </span>
          <h2 className="text-2xl font-extrabold text-[#0F172A]">
            Browse Programs &amp; Enroll in Track Systems
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every course supports flexible enrollment through our 4-Track system.
            Select levels that match your existing expertise and learning goals.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.course_id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-7 space-y-5 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-4">
                {/* Category badge + level count */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-[#0F172A]">
                    {categoryIcons[course.category ?? ''] ?? <BookOpen className="h-3.5 w-3.5 text-[#F18231]" />}
                    {course.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {course.levels?.length ?? 0} Levels
                  </span>
                </div>

                {/* Title + description */}
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-[#0F172A] leading-snug">
                    {course.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {course.description}
                  </p>
                </div>

                {/* Level list */}
                <div className="space-y-1.5 border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Curriculum:
                  </span>
                  <ul className="space-y-1">
                    {course.levels?.map((lvl: { level_id: string; level_title?: string; title?: string; price: number }) => (
                      <li
                        key={lvl.level_id}
                        className="flex items-center justify-between text-xs text-slate-600"
                      >
                        <span className="truncate pr-2">{lvl.level_title ?? lvl.title}</span>
                        <span className="shrink-0 font-semibold text-[#0F172A]">
                          PKR {lvl.price.toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link
                href={`/courses/${course.slug}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F172A] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1e293b]"
              >
                Configure Enrollment Track
                <ArrowRight className="h-4 w-4 text-[#F18231]" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 4-Track System Info */}
      <section className="border-t border-slate-200 bg-slate-50 px-6 py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">
              Enrollment System
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-[#0F172A]">
              The 4-Track System
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Every course supports four distinct enrollment pathways.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: 'Expert Track',
                tagline: 'All levels, instant access',
                desc: 'Full curriculum unlocked simultaneously. Ideal for engineers seeking rapid complete mastery.',
                badge: 'Most Popular',
              },
              {
                name: 'Progressive Track',
                tagline: 'Sequential level unlocking',
                desc: 'Unlock the next level only after completing the current one. Best for structured learners.',
                badge: null,
              },
              {
                name: 'Fast Track',
                tagline: 'Custom level selection',
                desc: 'Skip directly to any specific level based on your existing knowledge base.',
                badge: null,
              },
              {
                name: 'Premium Track',
                tagline: '1-on-1 mentorship',
                desc: 'Dedicated instructor, live code reviews, custom project guidance, and direct debugging sessions.',
                badge: 'VIP',
              },
            ].map((track) => (
              <div
                key={track.name}
                className="rounded-xl border border-slate-200 bg-white p-5 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold text-[#0F172A]">{track.name}</span>
                  {track.badge && (
                    <span className="rounded bg-[#F18231] px-1.5 py-0.5 text-[10px] font-bold text-white shrink-0">
                      {track.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-[#F18231]">{track.tagline}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{track.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
