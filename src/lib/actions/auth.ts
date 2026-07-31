'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// VULN-02 fix: only allow relative paths as redirect destinations
// Prevents open redirect to external attacker-controlled URLs
function sanitizeRedirect(redirectTo: string | null | undefined): string {
  const fallback = '/dashboard'
  if (!redirectTo) return fallback

  // Must be a relative path starting with /
  // Reject absolute URLs, protocol-relative URLs, or anything suspicious
  if (
    redirectTo.startsWith('http://') ||
    redirectTo.startsWith('https://') ||
    redirectTo.startsWith('//') ||
    !redirectTo.startsWith('/')
  ) {
    return fallback
  }

  // Reject paths with unexpected characters (basic allowlist)
  if (!/^\/[a-zA-Z0-9\-_/?=&%#.]+$/.test(redirectTo)) {
    return fallback
  }

  return redirectTo
}

// ─── Sign Up ─────────────────────────────────────────────────────────────────
export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const education = formData.get('education') as string

  // VULN-02 fix: do NOT allow user-supplied 'role' to be anything other than 'student'
  // Prevents privilege escalation via crafted form submission
  const role = 'student'

  // VULN-02 fix: sanitize redirect path
  const redirectTo = sanitizeRedirect(formData.get('redirectTo') as string)

  // Input validation
  if (!email || !password || !name) {
    return { error: 'Name, email, and password are required.' }
  }
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  // Parse experience array (JSON string)
  let experiences: { experience: string; experience_dates: string }[] = []
  try {
    const raw = formData.get('experiences') as string
    if (raw) {
      const parsed = JSON.parse(raw)
      // Validate it's actually an array of objects
      if (Array.isArray(parsed)) {
        experiences = parsed
          .filter((e) => typeof e.experience === 'string')
          .slice(0, 10) // max 10 experience entries
      }
    }
  } catch { /* ignore malformed JSON */ }

  // 1. Create Supabase Auth user
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

  // 2. Insert user profile
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

  // 3. Insert experience rows
  if (experiences.length > 0) {
    const expRows = experiences.map((exp) => ({
      user_id: userId,
      experience: exp.experience,
      experience_dates: exp.experience_dates,
    }))
    const { error: expError } = await supabase.from('experiences').insert(expRows)
    if (expError) console.error('Experience insert error:', expError)
  }

  revalidatePath('/', 'layout')
  redirect(redirectTo)
}

// ─── Sign In ─────────────────────────────────────────────────────────────────
export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // VULN-02 fix: sanitize redirect path
  const redirectTo = sanitizeRedirect(formData.get('redirectTo') as string)

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect(redirectTo)
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
