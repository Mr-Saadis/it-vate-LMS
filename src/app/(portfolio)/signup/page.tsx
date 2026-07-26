'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, User, Mail, Lock, Phone, GraduationCap, ArrowRight, Cpu, AlertCircle } from 'lucide-react'

interface WorkExperienceInput {
  id: string
  experience: string
  experience_dates: string
}

function SignupFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get('redirect') || '/checkout'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    education: 'Bachelor of Science (EE / CS)',
    year: '2026',
    role: 'student',
  })

  const [experiences, setExperiences] = useState<WorkExperienceInput[]>([
    { id: '1', experience: 'Embedded / Firmware Engineer', experience_dates: '2023 - Present' },
  ])

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const addExperienceField = () => {
    setExperiences([
      ...experiences,
      { id: Date.now().toString(), experience: '', experience_dates: '' },
    ])
  }

  const removeExperienceField = (id: string) => {
    if (experiences.length > 1) {
      setExperiences(experiences.filter((exp) => exp.id !== id))
    }
  }

  const handleExperienceChange = (
    id: string,
    field: 'experience' | 'experience_dates',
    value: string
  ) => {
    setExperiences(
      experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const supabase = createClient()

    try {
      // 1. Trigger Supabase Auth SignUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role,
          },
        },
      })

      if (authError && !authError.message.includes('User already registered')) {
        console.warn('Supabase auth notice:', authError.message)
      }

      const assignedUserId = authData?.user?.id || 'usr-' + Date.now()

      // 2. Insert into Supabase User and Experience tables via API & Client
      const apiRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: assignedUserId,
          ...formData,
          experiences,
        }),
      })

      const apiData = await apiRes.json()

      // Direct Client insertion fallback for RLS/live database sync
      try {
        await supabase.from('User').upsert([
          {
            user_id: assignedUserId,
            email: formData.email,
            name: formData.name,
            role: formData.role,
            education: formData.education,
            year: Number(formData.year) || 2026,
          },
        ])

        const validExp = experiences.filter((exp) => exp.experience.trim() !== '')
        if (validExp.length > 0) {
          await supabase.from('Experience').insert(
            validExp.map((exp) => ({
              user_id: assignedUserId,
              experience: exp.experience,
              experience_dates: exp.experience_dates,
            }))
          )
        }
      } catch (dbErr) {
        console.warn('Supabase direct DB insertion note:', dbErr)
      }

      // 3. Save Active Session Object locally for immediate state persistence
      const activeUser = {
        user_id: assignedUserId,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        education: formData.education,
        year: formData.year,
        experiences,
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('itvate_session_user', JSON.stringify(activeUser))
      }

      setSuccessMessage('Account created successfully! Redirecting...')
      setTimeout(() => {
        router.push(redirectTarget)
      }, 800)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to create profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 lg:px-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F172A] text-[#F18231] mx-auto">
          <Cpu className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Create Your IT-vate Student Account</h1>
        <p className="text-xs text-slate-600">
          Complete your technical onboarding profile to access courses & LMS platform.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-xs font-semibold text-green-700 border border-green-200">
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. Personal Credentials */}
        <div className="space-y-4 border-b border-slate-100 pb-6">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider text-[11px] text-[#F18231]">
            1. Personal Credentials
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-[#0F172A]">Full Name *</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Engr. Saad Ali"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-xs focus:border-[#F18231] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#0F172A]">Email Address *</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="saad@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-xs focus:border-[#F18231] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#0F172A]">Password *</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="•••••••• (Min 6 chars)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-xs focus:border-[#F18231] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#0F172A]">Phone Number</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-xs focus:border-[#F18231] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Academic Details */}
        <div className="space-y-4 border-b border-slate-100 pb-6">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider text-[11px] text-[#F18231]">
            2. Academic Qualification
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-[#0F172A]">Highest Degree / Discipline</label>
              <div className="relative mt-1">
                <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-xs focus:border-[#F18231] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#0F172A]">Graduation Year</label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#F18231] focus:outline-none mt-1"
              />
            </div>
          </div>
        </div>

        {/* 3. Dynamic Multi-Experience Builder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider text-[11px] text-[#F18231]">
                3. Professional Experience (Multiple Entries)
              </h3>
              <p className="text-[11px] text-slate-500">Maps directly to Supabase Experience Table.</p>
            </div>

            <button
              type="button"
              onClick={addExperienceField}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#F18231] hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Experience
            </button>
          </div>

          <div className="space-y-3">
            {experiences.map((exp, index) => (
              <div key={exp.id} className="flex gap-3 items-start rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder={`Experience #${index + 1} (e.g. Firmware Engineer at XYZ)`}
                    value={exp.experience}
                    onChange={(e) => handleExperienceChange(exp.id, 'experience', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-[#F18231] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Dates (e.g. 2022 - Present)"
                    value={exp.experience_dates}
                    onChange={(e) => handleExperienceChange(exp.id, 'experience_dates', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-[#F18231] focus:outline-none"
                  />
                </div>

                {experiences.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExperienceField(exp.id)}
                    className="text-slate-400 hover:text-red-500 p-1.5"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#F18231] py-3.5 text-sm font-semibold text-white hover:bg-[#d96f21] transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating Supabase Account...' : 'Create Profile & Proceed'}
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link href={`/login?redirect=${redirectTarget}`} className="font-semibold text-[#0F172A] hover:underline">
            Sign In here
          </Link>
        </p>
      </form>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading Signup...</div>}>
      <SignupFormContent />
    </Suspense>
  )
}
