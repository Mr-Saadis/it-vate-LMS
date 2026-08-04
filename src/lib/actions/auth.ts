'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

// VULN-02 fix: only allow relative paths as redirect destinations
function sanitizeRedirect(redirectTo: string | null | undefined): string {
  const fallback = '/dashboard'
  if (!redirectTo) return fallback

  if (
    redirectTo.startsWith('http://') ||
    redirectTo.startsWith('https://') ||
    redirectTo.startsWith('//') ||
    !redirectTo.startsWith('/')
  ) {
    return fallback
  }

  if (!/^\/[a-zA-Z0-9\-_/?=&%#.]+$/.test(redirectTo)) {
    return fallback
  }

  return redirectTo
}

// ─── Sign Up (Email/Password) ─────────────────────────────────────────────────
export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const education = formData.get('education') as string

  // VULN-02 fix: never trust user-supplied role
  const role = 'student'
  const redirectTo = sanitizeRedirect(formData.get('redirectTo') as string)

  if (!email || !password || !name) {
    return { error: 'Name, email, and password are required.' }
  }
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  let experiences: { experience: string; experience_dates: string }[] = []
  try {
    const raw = formData.get('experiences') as string
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        experiences = parsed
          .filter((e) => typeof e.experience === 'string')
          .slice(0, 10)
      }
    }
  } catch { /* ignore malformed JSON */ }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone, education, role },
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  const userId = authData.user?.id
  if (!userId) return { error: 'User creation failed.' }

  const { error: profileError } = await supabase.from('users').insert({
    user_id: userId,
    email,
    name,
    phone_number: phone,
    education,
    role,
  })

  if (profileError) {
    console.error('Profile insert error:', profileError)
  }

  if (experiences.length > 0) {
    const expRows = experiences.map((exp) => ({
      user_id: userId,
      experience: exp.experience,
      experience_dates: exp.experience_dates,
    }))
    const { error: expError } = await supabase.from('experiences').insert(expRows)
    if (expError) console.error('Experience insert error:', expError)
  }

  let finalRedirect = redirectTo
  if (finalRedirect === '/dashboard') {
    // New user, no enrollments yet. Redirect to home to browse courses.
    finalRedirect = '/'
  }

  revalidatePath('/', 'layout')
  redirect(finalRedirect)
}

// ─── Sign In With Google (OAuth) ──────────────────────────────────────────────
export async function signInWithGoogle(redirectTo?: string) {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') ?? 'http://localhost:3000'

  // After Google OAuth, always hit our callback route first so we can
  // check whether the user's profile is complete before redirecting.
  const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(redirectTo ?? '/dashboard')}`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Return the Google OAuth URL — client will do window.location.href = url
  return { url: data.url }
}

// ─── Complete Profile (after Google OAuth) ────────────────────────────────────
export async function completeProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Not authenticated. Please sign in again.' }
  }

  const phone = formData.get('phone') as string
  const education = formData.get('education') as string
  const redirectTo = sanitizeRedirect(formData.get('redirectTo') as string)

  // Name & email come from Google OAuth user metadata
  const name = (user.user_metadata?.full_name as string) ?? user.email?.split('@')[0] ?? 'User'
  const email = user.email ?? ''

  let experiences: { experience: string; experience_dates: string }[] = []
  try {
    const raw = formData.get('experiences') as string
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        experiences = parsed
          .filter((e) => typeof e.experience === 'string')
          .slice(0, 10)
      }
    }
  } catch { /* ignore */ }

  // Check if profile row already exists (upsert-safe)
  const { data: existing } = await supabase
    .from('users')
    .select('user_id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    await supabase.from('users').update({
      phone_number: phone,
      education,
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.id)
  } else {
    const { error: profileError } = await supabase.from('users').insert({
      user_id: user.id,
      email,
      name,
      phone_number: phone,
      education,
      role: 'student',
    })
    if (profileError) {
      console.error('Profile insert error:', profileError)
      return { error: 'Failed to save profile. Please try again.' }
    }
  }

  if (experiences.length > 0) {
    const expRows = experiences.map((exp) => ({
      user_id: user.id,
      experience: exp.experience,
      experience_dates: exp.experience_dates,
    }))
    await supabase.from('experiences').insert(expRows)
  }

  let finalRedirect = redirectTo
  if (finalRedirect === '/dashboard') {
    // After profile completion (new oauth user), they have no enrollments.
    finalRedirect = '/'
  }

  revalidatePath('/', 'layout')
  redirect(finalRedirect)
}

// ─── Sign In (Email/Password) ─────────────────────────────────────────────────
export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  const userId = authData.user?.id
  let role = 'student'
  if (userId) {
    const { data: profile } = await supabase.from('users').select('role').eq('user_id', userId).single()
    if (profile?.role) {
      role = profile.role
    }
  }

  let finalRedirect = sanitizeRedirect(formData.get('redirectTo') as string)
  if (finalRedirect === '/dashboard') {
    if (role === 'admin') {
      finalRedirect = '/admin'
    } else {
      // Check if student has enrollments
      const { data: enrolls } = await supabase.from('enrollments').select('enroll_id').eq('user_id', userId).limit(1)
      if (!enrolls || enrolls.length === 0) {
        finalRedirect = '/'
      }
    }
  }

  revalidatePath('/', 'layout')
  redirect(finalRedirect)
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

// ─── Reset Password ───────────────────────────────────────────────────────────
export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Email is required.' }
  }

  const headersList = await headers()
  const origin = headersList.get('origin') ?? 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

// ─── Update Password ──────────────────────────────────────────────────────────
export async function updatePassword(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return { error: 'Both fields are required.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Once updated, sign out so they have to login with new credentials.
  await supabase.auth.signOut()
  
  return { success: true }
}
