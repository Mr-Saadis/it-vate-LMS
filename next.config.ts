import type { NextConfig } from 'next'

// VULN-09 fix: Security headers to mitigate XSS, clickjacking, and data injection attacks
const securityHeaders = [
  {
    // Prevent MIME type sniffing
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // Prevent clickjacking
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    // Enable XSS filter in older browsers
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    // Prevent referrer leakage
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Restrict browser feature access
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    // HSTS: Force HTTPS for 1 year (enable in production)
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    // Content Security Policy
    // Allows: self, Supabase (for auth/storage), YouTube nocookie (for video player),
    // Google (for fonts/classroom links)
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Scripts: self + Next.js inline scripts (needed for hydration)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube-nocookie.com",
      // Styles: self + inline (needed for Tailwind/Next.js)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + Supabase Storage + data URIs
      `img-src 'self' data: blob: ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://xwcwnhverffffcttojwd.supabase.co'}`,
      // Connect: Supabase API calls (auth, DB, storage)
      `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://xwcwnhverffffcttojwd.supabase.co'} wss://*.supabase.co`,
      // Frames: YouTube nocookie only (for video embeds)
      "frame-src https://www.youtube-nocookie.com",
      // Form submissions: self only
      "form-action 'self'",
      // Block all mixed content
      "upgrade-insecure-requests",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
