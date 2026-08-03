import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const envPath = path.join(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const supabaseUrlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)
const supabaseAnonKeyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)

const supabase = createClient(supabaseUrlMatch![1].trim(), supabaseAnonKeyMatch![1].trim())

async function run() {
  const { data, error } = await supabase
    .from('enrollments')
    .select('level_id, track_type, status, levels!inner(course_id, level_title)')
    .limit(1)
  
  console.log("Error:", error)
  console.log("Data:", JSON.stringify(data, null, 2))
}

run()
