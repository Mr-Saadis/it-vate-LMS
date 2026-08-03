'use client'

import { useState, useTransition, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { signUp } from '@/lib/actions/auth'
import {
  Plus,
  Trash2,
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Cpu,
  BookOpen,
  ShieldCheck,
  Zap,
  Award,
  Loader2,
} from 'lucide-react'
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface WorkExperienceInput {
  id: string
  experience: string
  experience_dates: string
}

function SignupFormContent() {
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get('redirect') || '/dashboard'

  const [isPending, startTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    education: 'Bachelor of Science (EE / CS)',
    role: 'student',
  })

  const [experiences, setExperiences] = useState<WorkExperienceInput[]>([
    { id: '1', experience: '', experience_dates: '' },
  ])

  const addExperience = () =>
    setExperiences([
      ...experiences,
      { id: Date.now().toString(), experience: '', experience_dates: '' },
    ])

  const removeExperience = (id: string) => {
    if (experiences.length > 1)
      setExperiences(experiences.filter((e) => e.id !== id))
  }

  const updateExperience = (
    id: string,
    field: 'experience' | 'experience_dates',
    value: string
  ) =>
    setExperiences(
      experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)

    const fd = new FormData()
    fd.append('name', formState.name)
    fd.append('email', formState.email)
    fd.append('password', formState.password)
    fd.append('phone', formState.phone)
    fd.append('education', formState.education)
    fd.append('role', formState.role)
    fd.append('redirectTo', redirectTarget)
    fd.append(
      'experiences',
      JSON.stringify(
        experiences.filter((e) => e.experience.trim() !== '')
      )
    )

    startTransition(async () => {
      const result = await signUp(fd)
      if (result?.error) toast.error(result.error)
    })
  }

  const field = (
    label: string,
    id: string,
    type: string,
    value: string,
    onChange: (v: string) => void,
    icon: React.ReactNode,
    placeholder?: string,
    required = true
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-slate-700">
        {label} {required && <span className="text-[#F18231]">*</span>}
      </Label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
          {icon}
        </div>
        <Input
          id={id}
          type={type}
          required={required}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-[#F18231] h-10 text-sm"
        />
      </div>
    </div>
  )

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
        <div className="flex flex-1 items-center justify-center px-4 py-8 lg:px-10 xl:px-14 overflow-y-auto">
          <div className="w-full max-w-2xl space-y-6">

            {/* Top Header Title */}
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F18231]/10 border border-[#F18231]/20 text-[#F18231] text-xs font-semibold">
                <Cpu className="h-3.5 w-3.5" />
                Student Technical Onboarding
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Create Your LMS Account
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md">
                Set up your profile to access course modules, hardware simulation labs, and certifications.
              </p>
            </div>

            {/* Card Container */}
            <Card className="border-slate-200 shadow-xs bg-white rounded-2xl overflow-hidden">

            <CardHeader className="bg-slate-50/70 border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center justify-between">
                <span>Registration Form</span>
                <span className="text-[11px] font-normal text-slate-500">Step 1 of 1</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Fields marked with <span className="text-[#F18231] font-bold">*</span> are required.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* ── Section 1: Personal Credentials ── */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F18231]/10 text-[10px] font-bold text-[#F18231]">
                      1
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">
                      Personal Credentials
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {field('Full Name', 'name', 'text', formState.name, (v) => setFormState({ ...formState, name: v }), <User className="h-4 w-4" />, 'Muhammad Ali')}
                    {field('Email Address', 'email', 'email', formState.email, (v) => setFormState({ ...formState, email: v }), <Mail className="h-4 w-4" />, 'you@example.com')}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {field('Password', 'password', 'password', formState.password, (v) => setFormState({ ...formState, password: v }), <Lock className="h-4 w-4" />, 'Min. 8 characters')}
                    {field('Phone Number', 'phone', 'tel', formState.phone, (v) => setFormState({ ...formState, phone: v }), <Phone className="h-4 w-4" />, '+92 300 0000000', false)}
                  </div>
                </div>

                {/* ── Section 2: Academic Background ── */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F18231]/10 text-[10px] font-bold text-[#F18231]">
                      2
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">
                      Academic Background
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="education" className="text-xs font-semibold text-slate-700">
                        Education Level <span className="text-[#F18231]">*</span>
                      </Label>
                      <Select value={formState.education} onValueChange={(v) => v && setFormState({ ...formState, education: v })}>
                        <SelectTrigger id="education" className="bg-slate-50/50 border-slate-200 h-10 text-sm">
                          <SelectValue placeholder="Select Education" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bachelor of Science (EE / CS)">Bachelor of Science (EE / CS)</SelectItem>
                          <SelectItem value="Bachelor of Engineering (EE / CE)">Bachelor of Engineering (EE / CE)</SelectItem>
                          <SelectItem value="Master of Science (EE / CS)">Master of Science (EE / CS)</SelectItem>
                          <SelectItem value="Diploma in Electronics">Diploma in Electronics</SelectItem>
                          <SelectItem value="Self-Taught / Bootcamp">Self-Taught / Bootcamp</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* ── Section 3: Work Experience ── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F18231]/10 text-[10px] font-bold text-[#F18231]">
                        3
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">
                        Work Experience (Optional)
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addExperience}
                      className="h-7 border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Plus className="h-3 w-3 mr-1 text-[#F18231]" /> Add Experience
                    </Button>
                  </div>

                  <div className="space-y-3 pt-1">
                    {experiences.map((exp, idx) => (
                      <div key={exp.id} className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-500">
                            Experience Entry #{idx + 1}
                          </span>
                          {experiences.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeExperience(exp.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <Input
                            type="text"
                            value={exp.experience}
                            placeholder="e.g. Embedded Firmware Engineer"
                            onChange={(e) => updateExperience(exp.id, 'experience', e.target.value)}
                            className="bg-white border-slate-200 text-xs h-9"
                          />
                          <Input
                            type="text"
                            value={exp.experience_dates}
                            placeholder="e.g. 2022 – Present"
                            onChange={(e) => updateExperience(exp.id, 'experience_dates', e.target.value)}
                            className="bg-white border-slate-200 text-xs h-9"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Action */}
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-[#F18231] hover:bg-[#d96f21] text-white h-12 md:h-14 py-0 text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors mt-4 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span className="truncate">Complete Account Registration</span>
                      <ArrowRight className="h-4 w-4 ml-2 shrink-0" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="justify-center border-t border-slate-100 py-4 bg-slate-50/50">
              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <Link href={`/login?redirect=${encodeURIComponent(redirectTarget)}`} className="font-semibold text-[#F18231] hover:underline">
                  Sign in to your LMS Dashboard
                </Link>
              </p>
            </CardFooter>
          </Card>

          </div>
        </div>

      </div>

    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-6 w-6 rounded-full border-2 border-[#F18231] border-t-transparent animate-spin" />
      </div>
    }>
      <SignupFormContent />
    </Suspense>
  )
}