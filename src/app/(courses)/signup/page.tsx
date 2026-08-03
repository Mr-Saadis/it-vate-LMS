'use client'

import { useState, useTransition, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { signUp, signInWithGoogle } from '@/lib/actions/auth'
import {
  Plus,
  Trash2,
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ArrowLeft,
  Cpu,
  Zap,
  Award,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// ── Left Panel Features ────────────────────────────────────────────────────────
const FEATURES_STEP1 = [
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

const FEATURES_STEP2 = [
  {
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    title: 'Profile Ready!',
    desc: 'Your academic profile is saved. Now choose how you want to sign in.',
  },
  {
    icon: <Zap className="h-4 w-4 text-[#F18231]" />,
    title: 'Google — Fastest Option',
    desc: 'One click, no password needed. Powered by your existing Google account.',
  },
  {
    icon: <Lock className="h-4 w-4 text-[#F18231]" />,
    title: 'Email — Full Control',
    desc: 'Create a dedicated account with your own email and password.',
  },
]

interface WorkExperienceInput {
  id: string
  experience: string
  experience_dates: string
}

interface Step1Data {
  name: string
  phone: string
  education: string
  experiences: WorkExperienceInput[]
}

// ── Google Icon SVG ────────────────────────────────────────────────────────────
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

// ── Shared input field helper ──────────────────────────────────────────────────
function InputField({
  label, id, type, value, onChange, icon, placeholder, required = true,
}: {
  label: string; id: string; type: string; value: string
  onChange: (v: string) => void; icon: React.ReactNode
  placeholder?: string; required?: boolean
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
        {label}{required && <span className="text-[#F18231] ml-0.5">*</span>}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
          {icon}
        </div>
        <Input
          id={id} type={type} required={required} value={value}
          placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
          className="pl-10 bg-slate-50/30 border-slate-200 focus-visible:ring-[#F18231] focus-visible:border-[#F18231] h-10 text-sm rounded-xl"
        />
      </div>
    </div>
  )
}

function SignupFormContent() {
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get('redirect') || '/dashboard'

  // ── Step State ───────────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2>(1)

  // ── Step 1 data ──────────────────────────────────────────────────────────────
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [education, setEducation] = useState('Bachelor of Science (EE / CS)')
  const [experiences, setExperiences] = useState<WorkExperienceInput[]>([
    { id: '1', experience: '', experience_dates: '' },
  ])

  // ── Step 2 data ──────────────────────────────────────────────────────────────
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  // ── Transitions ──────────────────────────────────────────────────────────────
  const [isEmailPending, startEmailTransition] = useTransition()
  const [isGooglePending, startGoogleTransition] = useTransition()

  // ── Experience helpers ───────────────────────────────────────────────────────
  const addExperience = () =>
    setExperiences([...experiences, { id: Date.now().toString(), experience: '', experience_dates: '' }])

  const removeExperience = (id: string) => {
    if (experiences.length > 1) setExperiences(experiences.filter((e) => e.id !== id))
  }

  const updateExperience = (id: string, field: 'experience' | 'experience_dates', value: string) =>
    setExperiences(experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)))

  // ── Step 1 → Step 2 ─────────────────────────────────────────────────────────
  const handleStep1Next = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Please enter your full name.'); return }
    setStep(2)
  }

  // ── Email Submit ─────────────────────────────────────────────────────────────
  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('name', name)
    fd.append('email', email)
    fd.append('password', password)
    fd.append('phone', phone)
    fd.append('education', education)
    fd.append('role', 'student')
    fd.append('redirectTo', redirectTarget)
    fd.append('experiences', JSON.stringify(experiences.filter((e) => e.experience.trim() !== '')))

    startEmailTransition(async () => {
      const result = await signUp(fd)
      if (result?.error) toast.error(result.error)
    })
  }

  // ── Google OAuth ─────────────────────────────────────────────────────────────
  const handleGoogleSignUp = () => {
    // Persist Step 1 profile data so /complete-profile can pick it up
    const profileData: Step1Data = { name, phone, education, experiences }
    try {
      sessionStorage.setItem('pending_profile', JSON.stringify(profileData))
    } catch { /* ignore if sessionStorage unavailable */ }

    startGoogleTransition(async () => {
      const result = await signInWithGoogle(redirectTarget)
      if ('error' in result && result.error) {
        toast.error(result.error)
      } else if ('url' in result && result.url) {
        window.location.href = result.url
      }
    })
  }

  // ── Left Panel ───────────────────────────────────────────────────────────────
  const features = step === 1 ? FEATURES_STEP1 : FEATURES_STEP2

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50">

      {/* ── LEFT PANEL: Fixed ── */}
      <div className="hidden lg:flex w-[42%] shrink-0 relative flex-col justify-between overflow-hidden border-r border-slate-200 bg-slate-900 p-8 xl:p-10">
        <div className="absolute top-0 left-0 w-80 h-80 bg-[#F18231]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.05] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
              <Image src="/logo1.jpg" alt="IT-vate Icon" width={40} height={40} className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white tracking-tight leading-tight">IT-vate Solutions</span>
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">PLATFORM &amp; LMS</span>
            </div>
          </Link>
        </div>

        {/* Center Content — transitions with step */}
        <div className="relative z-10 space-y-6 my-auto">
          <div className="space-y-3">
            {/* Step indicator */}
            <div className="flex items-center gap-2">
              <div className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-[#F18231]' : 'bg-slate-700'}`} />
              <div className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-[#F18231]' : 'bg-slate-700'}`} />
              <span className="text-[10px] text-slate-500 ml-1">Step {step} of 2</span>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-[#F18231]/30 bg-[#F18231]/10 px-3 py-1 text-[11px] font-semibold text-[#F18231]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F18231] animate-pulse" />
              {step === 1 ? 'ENGINEERING EDUCATION PLATFORM' : 'CHOOSE YOUR LOGIN METHOD'}
            </span>

            <h2 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-white leading-snug">
              {step === 1 ? (
                <>Build Industry-Grade <br /><span className="text-[#F18231]">Hardware &amp; Firmware</span> Skills.</>
              ) : (
                <>Last Step — <br /><span className="text-[#F18231]">Create Your</span> Account.</>
              )}
            </h2>
          </div>

          <div className="space-y-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group flex items-start gap-3.5 rounded-xl border border-slate-800 bg-slate-800/40 p-3.5 transition-all duration-200 hover:border-slate-700 hover:bg-slate-800/70"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F18231]/10 border border-[#F18231]/20">
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

        <div className="relative z-10 border-t border-slate-800 pt-4">
          <p className="text-xs text-slate-400 italic">
            &ldquo;Empowering engineers from register-level C to production-grade RTOS deployments.&rdquo;
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL: Scrollable ── */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">

        {/* Mobile Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 lg:hidden bg-slate-50 shrink-0">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm">
              <Image src="/logo1.jpg" alt="IT-vate Icon" width={32} height={32} className="object-cover" />
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">IT-vate Solutions</span>
          </Link>
          <span className="text-xs text-slate-400">Step {step} of 2</span>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-8 lg:px-12 xl:px-16">
          <div className="w-full max-w-xl space-y-5">

            {/* ── STEP 1: Profile Info ── */}
            {step === 1 && (
              <>
                {/* Header */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F18231] text-[10px] font-black text-white">1</span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-black text-slate-400">2</span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Your Profile</h1>
                  <p className="text-xs text-slate-500">Tell us about yourself — this helps personalise your learning track.</p>
                </div>

                <form onSubmit={handleStep1Next} className="space-y-4">

                  {/* Personal Info */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Personal Info</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <InputField label="Full Name" id="name" type="text" value={name} onChange={setName} icon={<User className="h-4 w-4" />} placeholder="Muhammad Ali" />
                      <InputField label="Phone" id="phone" type="tel" value={phone} onChange={setPhone} icon={<Phone className="h-4 w-4" />} placeholder="+92 300 0000000" required={false} />
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Academic Background */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Academic Background</p>
                    <div className="space-y-1">
                      <label htmlFor="education" className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                        Education Level<span className="text-[#F18231] ml-0.5">*</span>
                      </label>
                      <Select value={education} onValueChange={(v) => v && setEducation(v)}>
                        <SelectTrigger id="education" className="bg-slate-50/30 border-slate-200 h-10 text-sm rounded-xl focus:ring-[#F18231]">
                          <SelectValue placeholder="Select Education" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bachelor of Science (EE / CS)">BSc (EE / CS)</SelectItem>
                          <SelectItem value="Bachelor of Engineering (EE / CE)">BEng (EE / CE)</SelectItem>
                          <SelectItem value="Master of Science (EE / CS)">MSc (EE / CS)</SelectItem>
                          <SelectItem value="Diploma in Electronics">Diploma in Electronics</SelectItem>
                          <SelectItem value="Self-Taught / Bootcamp">Self-Taught / Bootcamp</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Work Experience */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Work Experience <span className="normal-case font-normal text-slate-300">(optional)</span>
                      </p>
                      <button type="button" onClick={addExperience} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#F18231] hover:text-[#d96f21] transition-colors">
                        <Plus className="h-3 w-3" /> Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {experiences.map((exp, idx) => (
                        <div key={exp.id} className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2.5">
                          <span className="text-[10px] font-bold text-slate-400 shrink-0 w-4">{idx + 1}.</span>
                          <Input type="text" value={exp.experience} placeholder="Role / Position"
                            onChange={(e) => updateExperience(exp.id, 'experience', e.target.value)}
                            className="flex-1 bg-white border-slate-200 text-xs h-8 rounded-lg" />
                          <Input type="text" value={exp.experience_dates} placeholder="2022 – Present"
                            onChange={(e) => updateExperience(exp.id, 'experience_dates', e.target.value)}
                            className="w-32 bg-white border-slate-200 text-xs h-8 rounded-lg" />
                          {experiences.length > 1 && (
                            <button type="button" onClick={() => removeExperience(exp.id)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Button */}
                  <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#F18231] px-4 py-3 text-sm font-semibold text-white hover:bg-[#d96f21] transition-colors mt-2">
                    Continue to Account Setup
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <p className="text-center text-xs text-slate-500">
                  Already registered?{' '}
                  <Link href={`/login?redirect=${encodeURIComponent(redirectTarget)}`} className="font-semibold text-[#F18231] hover:text-[#d96f21] transition-colors">
                    Sign in
                  </Link>
                </p>
              </>
            )}

            {/* ── STEP 2: Account Creation ── */}
            {step === 2 && (
              <>
                {/* Header */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white">
                      <CheckCircle2 className="h-3 w-3" />
                    </span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F18231] text-[10px] font-black text-white">2</span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Your Account</h1>
                  <p className="text-xs text-slate-500">
                    Profile saved for <span className="font-semibold text-slate-700">{name}</span>. Now choose how to sign in.
                  </p>
                </div>

                <div className="space-y-4">

                  {/* Google OAuth */}
                  <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    disabled={isGooglePending}
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isGooglePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon className="h-4 w-4" />}
                    {isGooglePending ? 'Redirecting to Google...' : 'Continue with Google'}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">Or with email</span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>

                  {/* Email Form */}
                  <form onSubmit={handleEmailSubmit} className="space-y-3">
                    <InputField label="Email Address" id="email" type="email" value={email} onChange={setEmail} icon={<Mail className="h-4 w-4" />} placeholder="you@example.com" />

                    <div className="space-y-1">
                      <label htmlFor="password" className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                        Password<span className="text-[#F18231] ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                          <Lock className="h-4 w-4" />
                        </div>
                        <Input
                          id="password" type={showPw ? 'text' : 'password'} required
                          value={password} placeholder="Min. 8 characters" onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-11 bg-slate-50/30 border-slate-200 focus-visible:ring-[#F18231] h-10 text-sm rounded-xl"
                        />
                        <button type="button" tabIndex={-1} onClick={() => setShowPw((v) => !v)}
                          className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                          {showPw
                            ? <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
                            : <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          }
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isEmailPending}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1e293b] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isEmailPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating Account...</> : <>Create Account <ArrowRight className="h-4 w-4" /></>}
                    </button>
                  </form>

                </div>

                {/* Back + sign-in links */}
                <div className="flex items-center justify-between pt-1">
                  <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>
                  <p className="text-xs text-slate-500">
                    Already registered?{' '}
                    <Link href={`/login?redirect=${encodeURIComponent(redirectTarget)}`} className="font-semibold text-[#F18231] hover:text-[#d96f21] transition-colors">
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            )}

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