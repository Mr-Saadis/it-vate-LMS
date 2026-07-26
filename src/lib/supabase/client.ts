import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xwcwnhverffffcttojwd.supabase.co'
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3Y3duaHZlcmZmZmZjdHRvandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4OTQ5NzgsImV4cCI6MjEwMDQ3MDk3OH0.qn0tHrQ-HpVlDr4tWBBBmfyU1hy3lzwjfbkeUlDsIi4'

  return createBrowserClient(supabaseUrl, supabaseKey)
}
