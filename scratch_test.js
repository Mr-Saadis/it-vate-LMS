const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const envPath = path.join(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const supabaseUrlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)
const supabaseAnonKeyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)

const supabase = createClient(supabaseUrlMatch[1].trim(), supabaseAnonKeyMatch[1].trim())

async function run() {
  const courseId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' // From previous output
  
  const { data, error } = await supabase
    .from('enrollments')
    .select('level_id, track_type, status, levels!inner(course_id, level_title)')
    .eq('levels.course_id', courseId)
    .limit(1)
  
  console.log("Error:", error)
  console.log("Data:", JSON.stringify(data, null, 2))
}

run()
