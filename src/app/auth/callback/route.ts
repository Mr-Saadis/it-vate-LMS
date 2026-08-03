import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// This route handles the OAuth callback from Google.
// It exchanges the code for a session, then decides where to send the user:
//   - /complete-profile  → if they have no profile row yet (first Google login)
//   - `next` param       → if their profile is already complete
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()

    // Exchange the auth code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if this user already has a complete profile row
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('user_id, education')
          .eq('user_id', user.id)
          .single()

        // If no profile or education is missing → send to complete-profile
        if (!profile || !profile.education) {
          const redirectUrl = `${origin}/complete-profile?next=${encodeURIComponent(next)}`
          return NextResponse.redirect(redirectUrl)
        }
      }

      // Profile is complete — check where to send them
      let finalRedirect = next
      if (finalRedirect === '/dashboard' && user) {
        const { data: profile } = await supabase.from('users').select('role').eq('user_id', user.id).single()
        if (profile?.role === 'admin') {
          finalRedirect = '/admin'
        } else {
          // Check enrollments
          const { data: enrolls } = await supabase.from('enrollments').select('enroll_id').eq('user_id', user.id).limit(1)
          if (!enrolls || enrolls.length === 0) {
            finalRedirect = '/'
          }
        }
      }

      return NextResponse.redirect(`${origin}${finalRedirect}`)
    }
  }

  // Something went wrong — redirect to login with an error
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}
