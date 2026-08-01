import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
  console.log('Seeding real course into DB...')
  
  // 1. Insert Course
  const courseId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'
  const { error: courseError } = await supabase.from('courses').upsert({
    course_id: courseId,
    name: 'Embedded Systems Masterclass (REAL)',
    slug: 'embedded-systems-real',
    description: 'A real course inserted for testing the full admin flow.',
    is_active: true
  })
  
  if (courseError) {
    console.error('Error inserting course:', courseError)
    return
  }
  
  // 2. Insert Level
  const levelId = 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e'
  const { error: levelError } = await supabase.from('levels').upsert({
    level_id: levelId,
    course_id: courseId,
    no: 1,
    level_title: 'Level 1: Hardware Basics',
    level_description: 'Learn the basics of embedded hardware.',
    price: 150,
    code: 'EMB-L1',
    is_active: true
  })
  
  if (levelError) {
    console.error('Error inserting level:', levelError)
    return
  }
  
  console.log('Successfully inserted real course and level!')
}

seed()
