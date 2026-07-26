import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xwcwnhverffffcttojwd.supabase.co'
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3Y3duaHZlcmZmZmZjdHRvandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4OTQ5NzgsImV4cCI6MjEwMDQ3MDk3OH0.qn0tHrQ-HpVlDr4tWBBBmfyU1hy3lzwjfbkeUlDsIi4'

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Ignored if called from a Server Component
        }
      },
    },
  })
}
