'use client'

import { useState, useEffect, useTransition, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { completeProfile } from '@/lib/actions/auth'
import {
  Plus,
  Trash2,
  Phone,
  ArrowRight,
  Cpu,
  Zap,
  Award,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface WorkExperienceInput {
  id: string
  experience: string
  experience_dates: string
}

const FEATURES = [
  {
    icon: <Zap className="h-4 w-4 text-[#F18231]" />,
    title: 'Almost There!',
    desc: 'Your Google account is connected. Just fill in your academic profile to get started.',
  },
  {
    icon: <Cpu className="h-4 w-4 text-[#F18231]" />,
    title: 'Personalised Learning',
    desc: 'Your education background helps us recommend the right course tracks for you.',
  },
  {
    icon: <Award className="h-4 w-4 text-[#F18231]" />,
    title: 'One-time Setup',
    desc: 'You only need to do this once. Next time you sign in with Google it goes straight to your dashboard.',
  },
]

function CompleteProfileContent() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'

  const [isPending, startTransition] = useTransition()
  const [education, setEducation] = useState('Bachelor of Science (EE / CS)')
  const [phone, setPhone] = useState('')
  const [experiences, setExperiences] = useState<WorkExperienceInput[]>([
    { id: '1', experience: '', experience_dates: '' },
  ])
  const [prefilledName, setPrefilledName] = useState<string | null>(null)

  // Read Step 1 profile data saved by signup page before Google OAuth redirect
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('pending_profile')
      if (raw) {
        const data = JSON.parse(raw) as {
          name?: string; phone?: string; education?: string
          experiences?: WorkExperienceInput[]
        }
        if (data.phone) setPhone(data.phone)
        if (data.education) setEducation(data.education)
        if (data.experiences && Array.isArray(data.experiences) && data.experiences.length > 0) {
          // Only use if at least one has content
          const nonEmpty = data.experiences.filter((e) => e.experience.trim() !== '')
          if (nonEmpty.length > 0) setExperiences(data.experiences)
        }
        if (data.name) setPrefilledName(data.name)
        sessionStorage.removeItem('pending_profile')
      }
    } catch { /* ignore */ }
  }, [])

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

    const fd = new FormData()
    fd.append('phone', phone)
    fd.append('education', education)
    fd.append('redirectTo', next)
    fd.append(
      'experiences',
      JSON.stringify(
        experiences.filter((e) => e.experience.trim() !== '')
      )
    )

    startTransition(async () => {
      const result = await completeProfile(fd)
      if (result?.error) toast.error(result.error)
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50">

      {/* ── LEFT PANEL: Fixed ── */}
      <div className="hidden lg:flex w-[42%] shrink-0 relative flex-col justify-between overflow-hidden border-r border-slate-200 bg-slate-900 p-8 xl:p-10">

        {/* Ambient Glows */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-[#F18231]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
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

        {/* Center */}
        <div className="relative z-10 space-y-6 my-auto">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Google Account Connected
            </span>
            <h2 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-white leading-snug">
              One Last Step to <br />
              <span className="text-[#F18231]">Complete</span> Your Profile
            </h2>
          </div>

          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3.5 rounded-xl border border-slate-800 bg-slate-800/40 p-3.5"
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

        {/* Footer */}
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
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-8 lg:px-12 xl:px-16">
          <div className="w-full max-w-xl space-y-5">

            {/* Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Google Account Connected
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {prefilledName ? `Hi ${prefilledName.split(' ')[0]}! ` : ''}Complete Your Profile
              </h1>
              <p className="text-xs text-slate-500">
                {prefilledName
                  ? 'We carried over your details. Review them below and confirm to continue.'
                  : 'Just a few more details so we can personalise your learning experience.'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Academic Background */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#F18231]/15 text-[9px] font-black text-[#F18231]">1</span>
                  Academic Background
                </p>

                <div className="space-y-1">
                  <label htmlFor="education" className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                    Education Level<span className="text-[#F18231] ml-0.5">*</span>
                  </label>
                  <Select value={education} onValueChange={(v) => v && setEducation(v)}>
                    <SelectTrigger id="education" className="bg-slate-50/30 border-slate-200 h-10 text-sm rounded-xl">
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

                <div className="space-y-1">
                  <label htmlFor="phone" className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                    Phone Number <span className="text-slate-400 normal-case font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      placeholder="+92 300 0000000"
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 bg-slate-50/30 border-slate-200 h-10 text-sm rounded-xl focus-visible:ring-[#F18231]"
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100" />

              {/* Work Experience */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#F18231]/15 text-[9px] font-black text-[#F18231]">2</span>
                    Work Experience <span className="text-slate-300 normal-case font-normal">(optional)</span>
                  </p>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#F18231] hover:text-[#d96f21] transition-colors"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>

                <div className="space-y-2">
                  {experiences.map((exp, idx) => (
                    <div key={exp.id} className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2.5">
                      <span className="text-[10px] font-bold text-slate-400 shrink-0 w-4">{idx + 1}.</span>
                      <Input
                        type="text"
                        value={exp.experience}
                        placeholder="Role / Position"
                        onChange={(e) => updateExperience(exp.id, 'experience', e.target.value)}
                        className="flex-1 bg-white border-slate-200 text-xs h-8 rounded-lg"
                      />
                      <Input
                        type="text"
                        value={exp.experience_dates}
                        placeholder="2022 – Present"
                        onChange={(e) => updateExperience(exp.id, 'experience_dates', e.target.value)}
                        className="w-32 bg-white border-slate-200 text-xs h-8 rounded-lg"
                      />
                      {experiences.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExperience(exp.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#F18231] px-4 py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#d96f21] transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Profile...
                  </>
                ) : (
                  <>
                    Complete & Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400">
              Wrong account?{' '}
              <Link href="/login" className="font-semibold text-[#F18231] hover:text-[#d96f21] transition-colors">
                Sign out and try again
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-6 w-6 rounded-full border-2 border-[#F18231] border-t-transparent animate-spin" />
      </div>
    }>
      <CompleteProfileContent />
    </Suspense>
  )
}
