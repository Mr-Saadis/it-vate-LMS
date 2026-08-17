import Link from 'next/link'

import {

  ArrowRight,
  BookOpen,
  Cpu,

  Wifi,

  CircuitBoard,

  Zap,

  TrendingUp,

  Timer,

  Crown,

  CheckCircle2,

  Clock,

  BarChart,

} from 'lucide-react'

import { createClient } from '@/lib/supabase/server'

import { MOCK_COURSES } from '@/lib/mockData'
import { CircuitGraphic } from '@/components/courses/CircuitGraphic'
import { getAllUserEnrollmentsStatus } from '@/lib/api/courses'
import { HeroNavbarClient } from '@/components/courses/HeroNavbarClient'
import { UpcomingCohorts, CohortInfo } from '@/components/courses/UpcomingCohorts'



export const metadata = {

  title: 'Engineering Courses — IT-vate Solutions',

  description:

    'Enroll in specialized Embedded Systems, IoT, and PCB Design engineering courses with our flexible 4-Track system.',

}



const categoryIcons: Record<string, React.ReactNode> = {

  'Hardware Engineering': <Cpu className="h-4 w-4 text-[#F18231]" />,

  'Internet of Things': <Wifi className="h-4 w-4 text-[#F18231]" />,

  'Hardware Design': <CircuitBoard className="h-4 w-4 text-[#F18231]" />,

}



export default async function CoursesLandingPage() {

  // Try to fetch from Supabase; fall back to mock data if DB not seeded yet

  let courses = MOCK_COURSES

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('courses')
      .select('*, levels(*, content_items(*))')
      .eq('is_active', true)
      .order('name')



    if (!error && data && data.length > 0) {
      courses = data
    }
  } catch {
    // DB not configured yet — use mock data
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch enrollments only if user is logged in
  const enrollments = user ? await getAllUserEnrollmentsStatus() : []
  let userRole = 'student'

  if (user) {
    const { data: userData } = await supabase.from('users').select('role').eq('user_id', user.id).single()
    if (userData?.role) {
      userRole = userData.role
    }
  }

  let upcomingCohorts: CohortInfo[] = []
  if (courses && courses !== MOCK_COURSES) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (const course of courses) {
      if (!course.levels) continue
      const hue = Math.abs(course.name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)) % 360
      
      for (const level of course.levels) {
        if (!level.content_items) continue
        for (const item of level.content_items) {
          if (item.start_date && item.end_date) {
            const startDate = new Date(item.start_date)
            if (startDate >= today) {
              upcomingCohorts.push({
                content_items_id: item.content_items_id,
                courseName: course.name,
                levelTitle: level.level_title,
                batchId: item.title,
                startDate: item.start_date,
                endDate: item.end_date,
                hue
              })
            }
          }
        }
      }
    }
    
    upcomingCohorts.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  }

  return (
    <>

      {/* 1. Hero Section (Compact Split Layout with High-Readability Contrast) */}

      <section className="relative overflow-hidden border-b border-slate-800 bg-[#0b1120] px-4 md:px-6 py-10 md:py-12 lg:px-8 lg:py-16">

        {/* Subtle grid mesh overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#F18231_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl">
          
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <HeroNavbarClient user={user} userRole={userRole} enrollments={enrollments as any} />

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 mt-4">



            {/* Left Column: Tightly Aligned Text & Interactive CTAs */}

            <div className="flex flex-col items-start space-y-5 text-left lg:col-span-7 max-w-xl">

              <span className="inline-flex items-center gap-2 rounded-full border border-[#F18231]/30 bg-[#F18231]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#F18231]">

                <span className="h-1.5 w-1.5 rounded-full bg-[#F18231] animate-pulse" />

                ENGINEERING EDUCATION PLATFORM

              </span>



              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.15]">

                Master Hardware &amp; <br />

                <span className="bg-gradient-to-r from-[#F18231] to-amber-400 bg-clip-text text-transparent">

                  Firmware Engineering

                </span>

              </h1>



              <p className="text-sm text-slate-300 leading-relaxed font-normal">

                Industry-grade courses in Embedded Systems, Industrial IoT, and PCB Design.

                Choose from our flexible 4-Track enrollment system — Expert, Progressive, Fast, or Premium.

              </p>



              {/* CTAs with Clean, Static Hover State & Focus Rings */}

              <div className="pt-1 flex flex-wrap items-center gap-3.5">

                <a

                  href="#catalog"

                  className="inline-flex items-center gap-2 rounded-xl bg-[#F18231] px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d96f21] focus-visible:ring-2 focus-visible:ring-[#F18231] focus-visible:outline-none"

                >

                  Browse Courses

                  <ArrowRight className="h-4 w-4" />

                </a>

                <Link

                  href="/signup"

                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/50 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-slate-500 hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-[#F18231] focus-visible:outline-none"

                >

                  Create Account

                </Link>

              </div>



              {/* Feature Highlights Badges */}

              <div className="pt-2 flex flex-wrap gap-5 text-xs text-slate-400">

                <div className="flex items-center gap-1.5">

                  <CheckCircle2 className="h-4 w-4 text-[#F18231]" />

                  <span>CPDP Accredited</span>

                </div>

                <div className="flex items-center gap-1.5">

                  <CheckCircle2 className="h-4 w-4 text-[#F18231]" />

                  <span>4-Track Selection</span>

                </div>

                <div className="flex items-center gap-1.5">

                  <CheckCircle2 className="h-4 w-4 text-[#F18231]" />

                  <span>Hands-on Labs</span>

                </div>

              </div>

            </div>



            {/* Right Column: Sleek MCU Graphic */}

            <div className="w-full lg:col-span-5 flex justify-center lg:justify-end ml-auto">

              <CircuitGraphic />

            </div>



          </div>

        </div>

      </section>

      {/* 2. Course Catalog Section (Equal Height Cards & Micro-Badges) */}

      <section id="catalog" className="bg-slate-50/50 py-12 md:py-16 px-4 md:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="mb-10 max-w-3xl space-y-2">

            <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">

              Engineering Course Catalog

            </span>

            <h2 className="text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">

              Browse Programs &amp; Enroll in Track Systems

            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">

              Every course supports flexible enrollment through our 4-Track system.

              Select levels that match your existing expertise and learning goals.

            </p>

          </div>



          {/* Strict 3-Column Responsive Equal-Height Grid */}

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">

            {courses.map((course) => (

              <div

                key={course.course_id}

                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#F18231]/50 hover:shadow-xl focus-within:ring-2 focus-within:ring-[#F18231]/40 h-full"

              >

                <div className="space-y-4">

                  {/* Category badge + level count */}

                  <div className="flex items-center justify-between">

                    <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-[#0F172A]">

                      {categoryIcons[course.category ?? ''] ?? <BookOpen className="h-3.5 w-3.5 text-[#F18231]" />}

                      {course.category}

                    </span>

                    <span className="rounded-md bg-slate-50 border border-slate-200/80 px-2 py-0.5 text-[11px] font-bold text-slate-600">

                      {course.levels?.length ?? 0} Levels

                    </span>

                  </div>



                  {/* Title + description */}

                  <div className="space-y-1.5">

                    <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#F18231] transition-colors leading-snug">

                      {course.name}

                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">

                      {course.description}

                    </p>

                  </div>



                  {/* Micro-Badges & Course Metadata */}

                  <div className="flex items-center gap-4 text-slate-500 pt-1">

                    <div className="flex items-center gap-1 text-[11px] font-medium">

                      <Clock className="h-3.5 w-3.5 text-slate-400" />

                      <span>8–12 Weeks</span>

                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-medium">

                      <BarChart className="h-3.5 w-3.5 text-slate-400" />

                      <span>Interm. to Adv.</span>

                    </div>

                  </div>



                  {/* Level list curriculum breakdown */}

                  <div className="space-y-2 border-t border-slate-100 pt-3">

                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">

                      Curriculum Levels:

                    </span>

                    <ul className="space-y-1.5">

                      {course.levels?.map(

                        (lvl: { level_id: string; level_title?: string; title?: string; price: number }) => (

                          <li

                            key={lvl.level_id}

                            className="flex items-center justify-between text-xs text-slate-700 bg-slate-50 rounded-lg px-2.5 py-1.5"

                          >

                            <span className="truncate pr-2 font-medium">{lvl.level_title ?? lvl.title}</span>

                            <span className="shrink-0 font-bold text-[#0F172A]">

                              PKR {lvl.price.toLocaleString()}

                            </span>

                          </li>

                        )

                      )}

                    </ul>

                  </div>

                </div>



                {/* Mandatory Primary Full-Width Action Button with Focus Ring */}

                <div className="pt-5">

                  <Link

                    href={`/courses/${course.slug}`}

                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-4 py-3 text-xs font-semibold text-white transition-colors group-hover:bg-[#F18231] shadow-sm focus-visible:ring-2 focus-visible:ring-[#F18231] focus-visible:outline-none"

                  >

                    Configure Enrollment Track

                    <ArrowRight className="h-3.5 w-3.5 text-white" />

                  </Link>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* Upcoming Cohorts Section */}
      <UpcomingCohorts cohorts={upcomingCohorts} />

      {/* 3. Track System Section (Interactive Cards with Accessible Focus Rings) */}

      <section id="tracks" className="border-t border-slate-200 bg-slate-100/60 py-12 md:py-16 px-4 md:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="mb-12 text-center max-w-2xl mx-auto space-y-2">

            <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">

              Enrollment Pathways

            </span>

            <h2 className="text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">

              The 4-Track Enrollment System

            </h2>

            <p className="text-sm text-slate-600">

              Select the optimal track tailored to your learning pace and practical engineering background.

            </p>

          </div>



          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {[

              {

                name: 'Expert Track',

                tagline: 'All levels, instant access',

                desc: 'Full curriculum unlocked simultaneously. Ideal for engineers seeking rapid complete mastery.',

                badge: 'Most Popular',

                icon: <Zap className="h-5 w-5 text-[#F18231]" />,

              },

              {

                name: 'Progressive Track',

                tagline: 'Sequential level unlocking',

                desc: 'Unlock the next level only after completing the current one. Best for structured learners.',

                badge: null,

                icon: <TrendingUp className="h-5 w-5 text-[#F18231]" />,

              },

              {

                name: 'Fast Track',

                tagline: 'Custom level selection',

                desc: 'Skip directly to any specific level based on your existing knowledge base.',

                badge: null,

                icon: <Timer className="h-5 w-5 text-[#F18231]" />,

              },

              {

                name: 'Premium Track',

                tagline: '1-on-1 mentorship',

                desc: 'Dedicated instructor, live code reviews, custom project guidance, and direct debugging sessions.',

                badge: 'VIP',

                icon: <Crown className="h-5 w-5 text-[#F18231]" />,

              },

            ].map((track) => (

              <div

                key={track.name}

                tabIndex={0}

                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#F18231] hover:shadow-xl cursor-pointer overflow-hidden focus-visible:ring-2 focus-visible:ring-[#F18231] focus-visible:outline-none"

              >

                {/* Thick Orange Accent Line on Hover */}

                <div className="absolute top-0 left-0 right-0 h-1 bg-[#F18231] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />



                <div className="space-y-4">

                  {/* Top-Left STATIC Icon Box & Badge */}

                  <div className="flex items-start justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50/80 border border-[#F18231]/20 text-[#F18231]">

                      {track.icon}

                    </div>

                    {track.badge && (

                      <span className="rounded-full bg-[#F18231] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide shadow-xs">

                        {track.badge}

                      </span>

                    )}

                  </div>



                  {/* Name & Tagline */}

                  <div className="space-y-1 pt-1">

                    <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#F18231] transition-colors">

                      {track.name}

                    </h3>

                    <p className="text-xs font-semibold text-[#F18231] tracking-tight">{track.tagline}</p>

                  </div>



                  {/* Description */}

                  <p className="text-xs text-slate-500 leading-relaxed">

                    {track.desc}

                  </p>

                </div>



                {/* Bottom link prompt - Hover orange highlight strictly here */}

                <div className="pt-5 flex items-center text-xs font-bold text-[#0F172A] group-hover:text-[#F18231] transition-colors">

                  <span>Explore Track Options</span>

                  <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

    </>

  )

}

