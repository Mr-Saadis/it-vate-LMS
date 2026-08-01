'use client'

import { useState, useTransition, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/actions/auth'
import {
  Plus,
  Trash2,
  User,
  Mail,
  Lock,
  Phone,
  GraduationCap,
  ArrowRight,
  Cpu,
} from 'lucide-react'
import { toast } from 'sonner'
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
      <Label htmlFor={id}>
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
          className="pl-9"
        />
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F172A] text-[#F18231] mx-auto">
          <Cpu className="h-6 w-6" />
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-[#0F172A]">
            Create Your IT-vate Student Account
          </CardTitle>
          <CardDescription className="text-xs">
            Complete your technical onboarding profile to access courses &amp; the LMS platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Personal Credentials */}
            <div className="space-y-4">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#F18231]">
                Personal Credentials
              </span>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {field('Full Name', 'name', 'text', formState.name, (v) => setFormState({ ...formState, name: v }), <User className="h-4 w-4" />, 'Muhammad Ali')}
                {field('Email Address', 'email', 'email', formState.email, (v) => setFormState({ ...formState, email: v }), <Mail className="h-4 w-4" />, 'you@example.com')}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {field('Password', 'password', 'password', formState.password, (v) => setFormState({ ...formState, password: v }), <Lock className="h-4 w-4" />, 'Min. 8 characters')}
                {field('Phone Number', 'phone', 'tel', formState.phone, (v) => setFormState({ ...formState, phone: v }), <Phone className="h-4 w-4" />, '+92 300 0000000', false)}
              </div>
            </div>

            {/* Section 2: Academic & Role */}
            <div className="space-y-4 border-t border-slate-100 pt-5">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#F18231]">
                Academic Background
              </span>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="education">
                    Education <span className="text-[#F18231]">*</span>
                  </Label>
                  <Select value={formState.education} onValueChange={(v) => setFormState({ ...formState, education: v as string })}>
                    <SelectTrigger id="education">
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
                <div className="space-y-1.5">
                  <Label htmlFor="role">Account Role</Label>
                  <Select value={formState.role} onValueChange={(v) => setFormState({ ...formState, role: v })}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 3: Work Experience */}
            <div className="space-y-3 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#F18231]">
                  Work Experience (Optional)
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExperience}
                  className="h-7 text-[11px]"
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Experience
                </Button>
              </div>

              {experiences.map((exp, idx) => (
                <div key={exp.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Experience {idx + 1}
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
                    />
                    <Input
                      type="text"
                      value={exp.experience_dates}
                      placeholder="e.g. 2022 – Present"
                      onChange={(e) => updateExperience(exp.id, 'experience_dates', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#F18231] hover:bg-[#d96f21] text-white py-6"
            >
              {isPending ? 'Creating Account...' : 'Create Account & Continue'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link href={`/login?redirect=${encodeURIComponent(redirectTarget)}`} className="font-semibold text-[#F18231] hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading...</div>}>
      <SignupFormContent />
    </Suspense>
  )
}
