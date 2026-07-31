'use client'

import { useState, useTransition, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/actions/auth'
import { Mail, Lock, Cpu, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

function LoginFormContent() {
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get('redirect') || '/dashboard'

  const [isPending, startTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

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
    <div className="mx-auto max-w-md px-6 py-16 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F172A] text-[#F18231] mx-auto">
          <Cpu className="h-6 w-6" />
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-[#0F172A]">Sign In to IT-vate</CardTitle>
          <CardDescription className="text-xs">
            Access your courses, dashboard, and learning materials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">
                Email Address <span className="text-[#F18231]">*</span>
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">
                Password <span className="text-[#F18231]">*</span>
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#F18231] hover:bg-[#d96f21] text-white py-6"
            >
              {isPending ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500">
            No account yet?{' '}
            <Link
              href={`/signup?redirect=${encodeURIComponent(redirectTarget)}`}
              className="font-semibold text-[#F18231] hover:underline"
            >
              Create one free
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  )
}
