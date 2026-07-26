import Link from 'next/link'
import { Cpu, Wifi, Layers, GraduationCap, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { MOCK_COURSES } from '@/lib/mockData'

export default function PortfolioHome() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-16 pb-20 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-[#0F172A]">
              <Zap className="h-3.5 w-3.5 text-[#F18231]" />
              Engineering Excellence & Technical LMS Platform
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl lg:text-6xl">
              Innovating <span className="text-[#F18231]">Hardware</span> & Empowering Engineers
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed">
              IT-vate Solutions delivers high-performance Embedded Systems R&D, Industrial IoT solutions, and industry-grade engineering certifications tailored for real-world deployment.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-lg bg-[#F18231] px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-[#d96f21]"
              >
                Explore Courses & Tracks
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors"
              >
                Engineering Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Services Cards */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
            Core Engineering Competencies
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            From low-level microcontrollers to industrial cloud platforms, we engineer reliable hardware systems.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-8 space-y-4 hover:border-slate-300 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-[#0F172A] text-[#F18231] flex items-center justify-center">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-[#0F172A]">Embedded Firmware</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bare-metal C/C++, ARM Cortex architecture, register-level drivers, interrupt vectors, and FreeRTOS task scheduling.
            </p>
            <Link href="/services" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F18231]">
              Read Technical Specs <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-8 space-y-4 hover:border-slate-300 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-[#0F172A] text-[#F18231] flex items-center justify-center">
              <Wifi className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-[#0F172A]">Industrial IoT Gateways</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Edge computing nodes, telemetry protocols (MQTT, HTTP, Modbus), secure TLS handshakes, and cloud dashboard integrations.
            </p>
            <Link href="/services" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F18231]">
              Read Technical Specs <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-8 space-y-4 hover:border-slate-300 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-[#0F172A] text-[#F18231] flex items-center justify-center">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-[#0F172A]">High-Speed PCB Design</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Multi-layer PCB stackups, controlled impedance routing, EMI shielding, thermal dissipation, and Gerber export.
            </p>
            <Link href="/services" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F18231]">
              Read Technical Specs <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Courses & Track System Preview */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">CPDP Accredited Programs</span>
              <h2 className="text-2xl font-bold text-[#0F172A] sm:text-3xl mt-1">
                Featured Technical Courses
              </h2>
            </div>
            <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F172A] hover:text-[#F18231]">
              View All Courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {MOCK_COURSES.map((course) => (
              <div key={course.course_id} className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-sm">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-[#0F172A]">
                    {course.category}
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A] leading-snug">{course.name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{course.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    {course.levels?.length || 0} Levels Available
                  </span>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F18231] hover:underline"
                  >
                    Select Tracks <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4-Track Learning System Explanation */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-[#0F172A] p-8 md:p-12 text-white">
          <div className="max-w-3xl space-y-4 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">Flexible Learning Pathways</span>
            <h2 className="text-3xl font-bold tracking-tight">The 4-Track System</h2>
            <p className="text-sm text-slate-300">
              Customize your learning experience based on your current knowledge, career goals, and preferred pace.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-slate-800/80 p-5 border border-slate-700 space-y-2">
              <span className="text-xs font-bold text-[#F18231]">Track 01</span>
              <h4 className="text-base font-bold text-white">Expert Track</h4>
              <p className="text-xs text-slate-400">Unlock all course levels simultaneously for fast comprehensive mastery.</p>
            </div>

            <div className="rounded-lg bg-slate-800/80 p-5 border border-slate-700 space-y-2">
              <span className="text-xs font-bold text-[#F18231]">Track 02</span>
              <h4 className="text-base font-bold text-white">Progressive Track</h4>
              <p className="text-xs text-slate-400">Sequential step-by-step level progression upon assessment completion.</p>
            </div>

            <div className="rounded-lg bg-slate-800/80 p-5 border border-slate-700 space-y-2">
              <span className="text-xs font-bold text-[#F18231]">Track 03</span>
              <h4 className="text-base font-bold text-white">Fast Track</h4>
              <p className="text-xs text-slate-400">Direct custom selection of specific non-sequential levels.</p>
            </div>

            <div className="rounded-lg bg-slate-800/80 p-5 border border-slate-700 space-y-2">
              <span className="text-xs font-bold text-[#F18231]">Track 04</span>
              <h4 className="text-base font-bold text-white">Premium Track</h4>
              <p className="text-xs text-slate-400">Includes 1-on-1 personalized mentorship and live code reviews.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
