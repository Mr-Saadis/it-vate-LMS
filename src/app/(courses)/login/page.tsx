'use client'

import { useState, useTransition, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { signIn } from '@/lib/actions/auth'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap, Cpu, Award, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// ── Left Panel Features (Refined Light/Balanced Badges) ────────────────────────
const FEATURES = [
  {
    icon: <Zap className="h-4 w-4 text-[#F18231]" />,
    title: 'Real-time OS Architecture',
    desc: 'FreeRTOS, tasks, semaphores & interrupt-driven design on ARM Cortex-M.',
  },
  {
    icon: <Cpu className="h-4 w-4 text-[#F18231]" />,
    title: 'Hands-on Hardware Interfacing',
    desc: 'I²C, SPI, UART, CAN Bus & Industrial IoT protocols with real hardware kits.',
  },
  {
    icon: <Award className="h-4 w-4 text-[#F18231]" />,
    title: 'CPDP-Accredited Certification',
    desc: 'Industry-recognised certificates on completion of every enrolled track.',
  },
]

// ── SVG Icons ────────────────────────────────────────────────────────────────
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function LoginFormContent() {
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get('redirect') || '/dashboard'

  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('email', email)
    fd.append('password', password)
    fd.append('redirectTo', redirectTarget)

    startTransition(async () => {
      const result = await signIn(fd)
      if (result?.error) toast.error(result.error)
    })
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50/50">

      {/* ── LEFT PANEL: Softer, Balanced Slate Tone ── */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between overflow-hidden border-r border-slate-200 bg-slate-900 p-8 xl:p-10">

        {/* Soft Ambient Glows */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-[#F18231]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.05] pointer-events-none" />

        {/* Top Logo Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
              <Image src="/logo1.jpg" alt="IT-vate Icon" width={40} height={40} className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white tracking-tight leading-tight">
                IT-vate Solutions
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                PLATFORM &amp; LMS
              </span>
            </div>
          </Link>
        </div>

        {/* Center Content */}
        <div className="relative z-10 space-y-6 my-auto">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#F18231]/30 bg-[#F18231]/10 px-3 py-1 text-[11px] font-semibold text-[#F18231]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F18231] animate-pulse" />
              ENGINEERING EDUCATION PLATFORM
            </span>

            <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-white leading-snug">
              Build Industry-Grade <br />
              <span className="text-[#F18231]">
                Hardware &amp; Firmware
              </span> Skills.
            </h1>
          </div>

          {/* Feature Cards (Lighter Inner Fill) */}
          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group flex items-start gap-3.5 rounded-xl border border-slate-800 bg-slate-800/40 p-3.5 transition-all duration-200 hover:border-slate-700 hover:bg-slate-800/70"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F18231]/10 text-[#F18231] border border-[#F18231]/20">
                  {f.icon}
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-slate-200">{f.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Quote */}
        <div className="relative z-10 border-t border-slate-800 pt-4">
          <p className="text-xs text-slate-400 italic">
            &ldquo;Empowering engineers from register-level C to production-grade RTOS deployments.&rdquo;
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL: Clean & Balanced Light Theme ── */}
      <div className="flex flex-col min-h-screen lg:min-h-0 lg:col-span-7 bg-white">

        {/* Mobile Header View */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 lg:hidden bg-slate-50">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm">
              <Image src="/logo1.jpg" alt="IT-vate Icon" width={32} height={32} className="object-cover" />
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">IT-vate Solutions</span>
          </Link>
          <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-[#F18231] transition-colors">
            Browse Courses
          </Link>
        </div>

        {/* Main Form Center Box */}
        <div className="flex flex-1 items-center justify-center px-6 py-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-md space-y-6">

            {/* Header Text */}
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
              <p className="text-xs text-slate-500">
                Sign in to access your course dashboard and labs.
              </p>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => toast.info('GitHub OAuth coming soon')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs"
              >
                <GithubIcon className="h-4 w-4" />
                GitHub
              </button>
              <button
                type="button"
                onClick={() => toast.info('Google OAuth coming soon')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs"
              >
                <GoogleIcon className="h-4 w-4" />
                Google
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                Or with email
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    placeholder="you@example.com"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/30 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#F18231] focus:bg-white focus:ring-1 focus:ring-[#F18231] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <a href="#" className="text-xs font-semibold text-[#F18231] hover:text-[#d96f21] transition-colors">
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/30 pl-10 pr-11 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#F18231] focus:bg-white focus:ring-1 focus:ring-[#F18231] focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#F18231] px-4 py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#d96f21] transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In to Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500">
              Don&apos;t have an account?{' '}
              <Link
                href={`/signup?redirect=${encodeURIComponent(redirectTarget)}`}
                className="font-semibold text-[#F18231] hover:text-[#d96f21] transition-colors"
              >
                Create account free
              </Link>
            </p>
          </div>
        </div>

      </div>

    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="h-6 w-6 rounded-full border-2 border-[#F18231] border-t-transparent animate-spin" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  )
}