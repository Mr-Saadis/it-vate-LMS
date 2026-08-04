'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowRight, Zap, Cpu, Award, KeyRound, CheckCircle2, RefreshCcw, Loader2 } from 'lucide-react'
import { resetPassword } from '@/lib/actions/auth'
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<"idle" | "success">("idle")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    const fd = new FormData()
    fd.append('email', email)

    startTransition(async () => {
      const result = await resetPassword(fd)
      if (result?.error) {
        toast.error(result.error)
      } else {
        setStatus("success")
      }
    })
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50/50 font-sans">
      
      {/* ── LEFT PANEL: Softer, Balanced Slate Tone ── */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between overflow-hidden border-r border-slate-200 bg-slate-900 p-8 xl:p-10">

        {/* Soft Ambient Glows */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-[#F18231]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.05] pointer-events-none" />

        {/* Top Logo Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/logo2.png" alt="IT-vate Icon" width={40} height={40} className="object-cover" />
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
            <Image src="/logo2.png" alt="IT-vate Icon" width={32} height={32} className="object-cover" />
            <span className="text-sm font-bold text-slate-900 tracking-tight">IT-vate Solutions</span>
          </Link>
          <Link href="/login" className="text-xs font-semibold text-slate-600 hover:text-[#F18231] transition-colors">
            Back to Sign In
          </Link>
        </div>

        {/* Main Form Center Box */}
        <div className="flex flex-1 items-center justify-center px-6 py-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-md">
            
            {status === "idle" ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Badge */}
                <div className="flex mb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase tracking-wider border border-slate-200">
                    <KeyRound className="w-3.5 h-3.5 text-[#F18231]" />
                    <span>Account Security Recovery</span>
                  </div>
                </div>

                {/* Header Text */}
                <div className="space-y-1 text-left">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reset Password</h2>
                  <p className="text-xs text-slate-500">
                    Enter your registered email address to receive a secure recovery link.
                  </p>
                </div>

                {/* Inputs */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        placeholder="you@example.com"
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/30 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#F18231] focus:bg-white focus:ring-1 focus:ring-[#F18231] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#F18231] px-4 py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#d96f21] transition-colors mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-xs text-slate-500 pt-2">
                  Remember your password?{' '}
                  <Link
                    href="/login"
                    className="font-semibold text-[#F18231] hover:text-[#d96f21] transition-colors"
                  >
                    Back to Sign In
                  </Link>
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-in zoom-in-95 fade-in duration-500 text-center py-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Check your inbox</h2>
                  <p className="text-xs text-slate-500 mb-6">
                    We've sent a password reset link to <br />
                    <span className="font-semibold text-slate-900 text-sm mt-1 inline-block">{email}</span>
                  </p>
                </div>
                
                <button
                  onClick={() => setStatus("idle")}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors mt-4"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Resend / Change Email
                </button>

                <p className="text-center text-xs text-slate-500 pt-4">
                  <Link
                    href="/login"
                    className="font-semibold text-[#F18231] hover:text-[#d96f21] transition-colors"
                  >
                    Return to Sign In
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
