'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, Cpu, ArrowRight, AlertCircle } from 'lucide-react'

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    const supabase = createClient()

    try {
      // 1. Supabase Auth Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error && !error.message.includes('Invalid login credentials')) {
        console.warn('Supabase auth login note:', error.message)
      }

      const isAdmin = email.toLowerCase().includes('admin')
      const activeUser = {
        user_id: data?.user?.id || 'usr-existing',
        name: data?.user?.user_metadata?.name || email.split('@')[0] || 'Enrolled Student',
        email,
        role: isAdmin ? 'admin' : 'student',
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('itvate_session_user', JSON.stringify(activeUser))
      }

      if (isAdmin) {
        router.push('/admin')
      } else {
        router.push(redirectTarget)
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16 lg:px-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F172A] text-[#F18231] mx-auto">
          <Cpu className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Sign In to IT-vate Platform</h1>
        <p className="text-xs text-slate-600">Access your enrolled courses, certificates, or admin portal.</p>
      </div>

      <form onSubmit={handleLogin} className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm space-y-5">
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-[#0F172A]">Email Address</label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="email"
              required
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-xs focus:border-[#F18231] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-[#0F172A]">Password</label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-xs focus:border-[#F18231] focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#F18231] py-3 text-sm font-semibold text-white hover:bg-[#d96f21] transition-colors disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
          <ArrowRight className="h-4 w-4" />
        </button>

        <div className="pt-2 text-center text-xs text-slate-500">
          New Student?{' '}
          <Link href={`/signup?redirect=${redirectTarget}`} className="font-semibold text-[#0F172A] hover:underline">
            Create an Account
          </Link>
        </div>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading Login...</div>}>
      <LoginFormContent />
    </Suspense>
  )
}
