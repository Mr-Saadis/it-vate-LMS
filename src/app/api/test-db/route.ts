import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: certs, error } = await supabase.from('certificates').select('*').limit(1)
  return NextResponse.json({ certs, error })
}
