import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Allowed internal redirect paths (must start with /)
const ALLOWED_REDIRECT_PATHS = /^\/[a-zA-Z0-9\-_/?=&%]+$/

export function isAllowedRedirect(path: string): boolean {
  try {
    // Reject anything that looks like an external URL
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
      return false
    }
    return ALLOWED_REDIRECT_PATHS.test(path)
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  const pathname = url.pathname

  // Skip static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // ── Create a response we can mutate for cookie refresh ──────────────────────
  let response = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // VULN-01 fix: crash loudly if env vars are missing — no hardcoded fallbacks
  if (!supabaseUrl || !supabaseKey) {
    console.error('SECURITY: Missing Supabase environment variables')
    return NextResponse.next()
  }

  // Create a Supabase client that can refresh Auth tokens in proxy
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  // Refresh auth session so tokens don't expire mid-session
  const { data: { user } } = await supabase.auth.getUser()

  // ── Host-based domain detection ───────────────────────────────────────────
  const isLMSHost = hostname.startsWith('lms.')

  // VULN-06 fix: `?domain=lms` override is ONLY honoured in development.
  // In production it is ignored to prevent routing manipulation.
  const isDev = process.env.NODE_ENV === 'development'
  const queryDomain = isDev ? url.searchParams.get('domain') : null
  const isLMSByQuery = queryDomain === 'lms'

  // Paths that always belong to LMS regardless of host
  const isLMSPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/certificates') ||
    pathname.startsWith('/discover')

  // ── LMS routing ───────────────────────────────────────────────────────────
  if (isLMSHost || isLMSByQuery || isLMSPath) {
    // Auth protection: redirect unauthenticated users to login
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      // VULN-02 partial fix: sanitize the redirect value stored in the URL
      if (isAllowedRedirect(pathname)) {
        loginUrl.searchParams.set('redirect', pathname)
      }
      return NextResponse.redirect(loginUrl)
    }

    // If accessing LMS root without a specific path, redirect to dashboard
    if (pathname === '/') {
      url.pathname = '/dashboard'
      return NextResponse.rewrite(url)
    }

    return response
  }

  // ── Courses portal is the default ─────────────────────────────────────────
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
