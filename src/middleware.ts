import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  const pathname = url.pathname

  // Skip static assets, _next, public files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // Detect domain/subdomain or developer query override (?domain=lms or ?domain=portfolio)
  const queryDomain = url.searchParams.get('domain')
  const isLMSHost = hostname.startsWith('lms.') || queryDomain === 'lms'

  // Route protection or explicit LMS paths
  const isLMSPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/certificates') ||
    pathname.startsWith('/discover')

  if (isLMSHost || isLMSPath) {
    // If accessing LMS root without specific path, direct to dashboard
    if (pathname === '/') {
      url.pathname = '/dashboard'
      return NextResponse.rewrite(url)
    }
    // Route group handles (lms) routes
    return NextResponse.next()
  }

  // Otherwise default to portfolio routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}