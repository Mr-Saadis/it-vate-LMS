import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { User, Experience } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, name, email, role, education, year, experiences } = body

    const userId = user_id || 'usr-' + Date.now()

    const newUser: User = {
      user_id: userId,
      created_at: new Date().toISOString(),
      email,
      name,
      role: role || 'student',
      education,
      year: Number(year) || 2026,
      updated_at: new Date().toISOString(),
    }

    const createdExperiences: Experience[] = (experiences || [])
      .filter((exp: any) => exp.experience && exp.experience.trim() !== '')
      .map((exp: any) => ({
        experience_id: 'exp-' + Math.floor(Math.random() * 100000),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        experience: exp.experience,
        experience_dates: exp.experience_dates || '',
        user_id: userId,
      }))

    // Try inserting into Supabase via server client
    try {
      const supabase = await createClient()

      // 1. Insert into User table
      await supabase.from('User').upsert([
        {
          user_id: newUser.user_id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          education: newUser.education,
          year: newUser.year,
        },
      ])

      // 2. Insert into Experience table
      if (createdExperiences.length > 0) {
        await supabase.from('Experience').insert(
          createdExperiences.map((exp) => ({
            user_id: exp.user_id,
            experience: exp.experience,
            experience_dates: exp.experience_dates,
          }))
        )
      }
    } catch (dbErr) {
      console.warn('Supabase DB server insert warning:', dbErr)
    }

    return NextResponse.json({
      success: true,
      user: newUser,
      experiences: createdExperiences,
    })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Invalid payload' },
      { status: 400 }
    )
  }
}
