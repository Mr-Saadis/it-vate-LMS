import Link from 'next/link'
import {
  Cpu,
  Wifi,
  Layers,
  GraduationCap,
  ArrowRight,
  Zap,
  Globe,
  Leaf,
  Users,
  CheckCircle2,
  BookOpen,
  Target,
  Eye,
  Calendar,
} from 'lucide-react'
import { MOCK_COURSES } from '@/lib/mockData'

const BLOG_POSTS = [
  {
    title: 'Why PCB Design Is the Heart of Your Product',
    excerpt:
      'Learn why professional PCB design is crucial for product performance, reliability, and manufacturing success.',
    date: 'June 15, 2023',
    href: '#',
  },
  {
    title: 'Choosing the Right Microcontroller for Your Application',
    excerpt:
      'A comprehensive guide to selecting the optimal microcontroller based on your project requirements.',
    date: 'May 22, 2023',
    href: '#',
  },
  {
    title: 'IoT vs. Embedded: Understanding the Difference',
    excerpt:
      'Clarifying the distinctions between IoT and traditional embedded systems for better project planning.',
    date: 'April 10, 2023',
    href: '#',
  },
]

export default function PortfolioHome() {
  return (
    <div className="space-y-0 pb-0">

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-[#0F172A] pt-20 pb-24">
        {/* Subtle grid pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 60px)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-4 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur">
              <Zap className="h-3.5 w-3.5 text-[#F18231]" />
              Embedded with Excellence — Founded 2022
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
              Empowering Innovation in{' '}
              <span className="text-[#F18231]">IoT & Embedded Systems</span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              From concept to deployment, IT-vate Solutions delivers world-class embedded systems and
              IoT development. We turn ideas into reality with precision, performance, and a passion
              for excellence.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-lg bg-[#F18231] px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-[#d96f21] hover:shadow-[#F18231]/30 hover:shadow-xl"
              >
                Discover Our Services
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/40 px-6 py-3.5 text-base font-semibold text-white backdrop-blur transition-all hover:border-slate-400 hover:bg-slate-700/40"
              >
                {"Let's Connect"}
              </Link>
            </div>
          </div>

          {/* Stat bar */}
          <div className="mt-16 grid grid-cols-2 gap-px sm:grid-cols-4 rounded-2xl border border-slate-700/60 overflow-hidden">
            {[
              { label: 'Engineers & Innovators', value: '20+' },
              { label: 'Successful Projects', value: '50+' },
              { label: 'Countries Served', value: '10+' },
              { label: 'Students Trained', value: '500+' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-slate-800/50 backdrop-blur px-6 py-5 text-center"
              >
                <div className="text-3xl font-extrabold text-[#F18231]">{stat.value}</div>
                <div className="mt-1 text-xs text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CORE EXPERTISE ─── */}
      <section className="bg-white py-20 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">
              What We Do
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F172A] sm:text-4xl">
              Our Core Expertise
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              End-to-end hardware and software engineering — from chip to cloud.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                Icon: Cpu,
                title: 'Embedded Systems Development',
                desc: 'Reliable hardware and firmware for innovative products — bare-metal C/C++, ARM Cortex, FreeRTOS, and register-level drivers.',
                href: '/services',
              },
              {
                Icon: Wifi,
                title: 'IoT Development',
                desc: 'Smart, connected solutions for a data-driven world — MQTT, Modbus, TLS, edge computing, and cloud dashboard integrations.',
                href: '/services',
              },
              {
                Icon: Layers,
                title: 'Consultancy',
                desc: 'Expert advice to accelerate your innovation journey — from architecture reviews to multi-layer PCB design and EMI analysis.',
                href: '/services',
              },
              {
                Icon: GraduationCap,
                title: 'Training',
                desc: 'Industry-leading CPDP-accredited courses to empower future engineers — structured tracks from beginner to expert level.',
                href: '/courses',
              },
            ].map(({ Icon, title, desc, href }) => (
              <div
                key={title}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-7 space-y-4 hover:border-[#F18231]/40 hover:shadow-md transition-all"
              >
                <div className="h-12 w-12 rounded-lg bg-[#0F172A] text-[#F18231] flex items-center justify-center group-hover:bg-[#F18231] group-hover:text-white transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] leading-snug">{title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed flex-1">{desc}</p>
                <Link
                  href={href}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F18231]"
                >
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHO WE ARE ─── */}
      <section className="bg-slate-50 py-20 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            {/* Text */}
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">
                Our Story
              </span>
              <h2 className="text-3xl font-extrabold text-[#0F172A] sm:text-4xl leading-tight">
                Who We Are
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Founded in 2022, IT-vate Solutions is a passionate team of engineers and
                innovators. We specialize in embedded systems, IoT, and professional training —
                helping clients worldwide turn bold ideas into reality.
              </p>

              <div className="space-y-5 pt-2">
                <div className="flex gap-4">
                  <div className="mt-0.5 h-8 w-8 shrink-0 rounded-lg bg-[#0F172A] flex items-center justify-center">
                    <Target className="h-4 w-4 text-[#F18231]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A]">Our Mission</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      To empower innovation through precision, performance, and partnership in
                      embedded and IoT solutions.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-0.5 h-8 w-8 shrink-0 rounded-lg bg-[#0F172A] flex items-center justify-center">
                    <Eye className="h-4 w-4 text-[#F18231]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A]">Our Vision</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      To be a global leader in embedded systems development and training by
                      delivering reliable and scalable technology.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F172A] hover:text-[#F18231] transition-colors"
              >
                Learn more about us <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Innovation First', desc: 'Every solution built around cutting-edge hardware and firmware design.' },
                { label: 'Precision Engineering', desc: 'Controlled impedance, EMI shielding, and thermal analysis on every PCB.' },
                { label: 'Global Reach', desc: 'Serving clients across 10+ countries with remote and on-site teams.' },
                { label: 'Education-Driven', desc: '500+ engineers trained through CPDP-accredited structured programs.' },
              ].map((v) => (
                <div
                  key={v.label}
                  className="rounded-xl border border-slate-200 bg-white p-5 space-y-2 hover:border-slate-300 transition-colors"
                >
                  <CheckCircle2 className="h-5 w-5 text-[#F18231]" />
                  <h4 className="text-sm font-bold text-[#0F172A]">{v.label}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED COURSES ─── */}
      <section className="bg-white py-20 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">
                CPDP Accredited Programs
              </span>
              <h2 className="text-3xl font-extrabold text-[#0F172A] sm:text-4xl mt-1">
                Featured Technical Courses
              </h2>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F172A] hover:text-[#F18231] transition-colors"
            >
              View All Courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {MOCK_COURSES.map((course) => (
              <div
                key={course.course_id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-md hover:border-slate-300"
              >
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-[#0F172A]">
                    {course.category}
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A] leading-snug">{course.name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
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

      {/* ─── 4-TRACK SYSTEM ─── */}
      <section className="bg-[#0F172A] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">
              Flexible Learning Pathways
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              The 4-Track System
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Customize your learning experience based on your current knowledge, career goals, and
              preferred pace.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                no: '01',
                title: 'Expert Track',
                desc: 'Unlock all course levels simultaneously for fast, comprehensive mastery. Ideal for industry professionals.',
              },
              {
                no: '02',
                title: 'Progressive Track',
                desc: 'Sequential step-by-step level progression upon assessment completion. Best for students new to embedded.',
              },
              {
                no: '03',
                title: 'Fast Track',
                desc: 'Direct custom selection of specific non-sequential levels for targeted skill-building.',
              },
              {
                no: '04',
                title: 'Premium Track',
                desc: 'Includes 1-on-1 personalized mentorship, live code reviews, and priority career support.',
              },
            ].map((t) => (
              <div
                key={t.no}
                className="group rounded-xl bg-slate-800/60 border border-slate-700 p-6 space-y-3 hover:border-[#F18231]/40 hover:bg-slate-800 transition-all"
              >
                <span className="text-xs font-bold text-[#F18231]">Track {t.no}</span>
                <h4 className="text-base font-bold text-white">{t.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{t.desc}</p>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-[#F18231] transition-colors"
                >
                  Explore <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-lg bg-[#F18231] px-7 py-3.5 text-sm font-semibold text-white hover:bg-[#d96f21] transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Explore All Courses & Tracks
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SUSTAINABILITY ─── */}
      <section className="bg-white py-20 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">
              Responsibility & Impact
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F172A] sm:text-4xl">
              Sustainability at Our Core
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              {"We're"} committed to a sustainable future. Our projects align with the UN Sustainable
              Development Goals (SDGs), driving positive change for industry and society.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-12">
            {[
              {
                Icon: Leaf,
                color: 'text-green-600',
                bg: 'bg-green-50',
                sdg: 'SDG 9: Industry, Innovation & Infrastructure',
                desc: 'We foster innovation through robust, future-ready embedded systems and IoT technologies that help modernize industries and create smarter infrastructure.',
              },
              {
                Icon: Globe,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                sdg: 'SDG 11: Sustainable Cities & Communities',
                desc: 'Our IoT solutions contribute to more sustainable urban environments — enabling energy efficiency, smart monitoring, and improved quality of life.',
              },
              {
                Icon: GraduationCap,
                color: 'text-[#F18231]',
                bg: 'bg-orange-50',
                sdg: 'SDG 4: Quality Education',
                desc: 'Ensuring accessible, practical engineering training to bridge the technical skills gap with free and subsidized programs across developing regions.',
              },
            ].map(({ Icon, color, bg, sdg, desc }) => (
              <div
                key={sdg}
                className="rounded-xl border border-slate-200 bg-white p-7 space-y-4 hover:shadow-md transition-all"
              >
                <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <h3 className="text-sm font-bold text-[#0F172A]">{sdg}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Community commitment */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-lg bg-[#0F172A] flex items-center justify-center">
                <Users className="h-5 w-5 text-[#F18231]" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Our Commitment to Community</h3>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Empowering underrepresented groups with free and subsidized training',
                'Hosting technical workshops at local universities',
                'Mentoring students and contributing to open-source',
                'Championing eco-friendly electronics design',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-[#F18231] mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link
                href="/sustainability"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] hover:text-[#F18231] transition-colors"
              >
                View Full Sustainability Report <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BLOG / INSIGHTS ─── */}
      <section className="bg-slate-50 py-20 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">
                From Our Engineers
              </span>
              <h2 className="text-3xl font-extrabold text-[#0F172A] sm:text-4xl mt-1">
                Insights & Updates
              </h2>
            </div>
            <Link
              href="#"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F172A] hover:text-[#F18231] transition-colors"
            >
              View all articles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.title}
                href={post.href}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-7 space-y-4 hover:border-slate-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <Calendar className="h-3.5 w-3.5" />
                  {post.date}
                </div>
                <h3 className="text-base font-bold text-[#0F172A] leading-snug group-hover:text-[#F18231] transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed flex-1">{post.excerpt}</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F18231]">
                  Read more <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-2xl bg-[#0F172A] px-8 py-14 text-center space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">
              Ready to Start?
            </span>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Build Something Remarkable with IT-vate
            </h2>
            <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Whether you need a hardware partner, engineering consultancy, or a structured
              learning path — {"we're"} here to make it happen.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-[#F18231] px-7 py-3.5 text-sm font-semibold text-white hover:bg-[#d96f21] transition-colors"
              >
                {"Let's Connect"} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-7 py-3.5 text-sm font-semibold text-white hover:border-slate-400 transition-colors"
              >
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
