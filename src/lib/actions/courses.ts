'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper to verify admin
async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase.from('users').select('role').eq('user_id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Not authorized')
  return supabase
}

export async function createCourseAction(courseData: {
  name: string
  description: string
  category: string
  slug: string
  is_active: boolean
}) {
  try {
    const supabase = await verifyAdmin()
    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single()

    if (error) throw error
    revalidatePath('/admin/courses')
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateCourseAction(courseId: string, courseData: {
  name: string
  description: string
  category: string
  slug: string
  is_active: boolean
}) {
  try {
    const supabase = await verifyAdmin()
    const { data, error } = await supabase
      .from('courses')
      .update(courseData)
      .eq('course_id', courseId)
      .select()
      .single()

    if (error) throw error
    revalidatePath('/admin/courses')
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createLevelAction(levelData: {
  course_id: string
  no: number
  code: string
  level_title: string
  level_description: string
  price: number
  is_active: boolean
  year?: number
}) {
  try {
    const supabase = await verifyAdmin()
    // Ensure we set a year if not provided, assuming 2026 for now or null
    const dataToInsert = { ...levelData }
    if (!dataToInsert.year) {
      dataToInsert.year = new Date().getFullYear()
    }

    const { data, error } = await supabase
      .from('levels')
      .insert([dataToInsert])
      .select()
      .single()

    if (error) throw error
    revalidatePath('/admin/courses')
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateLevelAction(levelId: string, levelData: {
  no: number
  code: string
  level_title: string
  level_description: string
  price: number
  is_active: boolean
}) {
  try {
    const supabase = await verifyAdmin()
    const { data, error } = await supabase
      .from('levels')
      .update(levelData)
      .eq('level_id', levelId)
      .select()
      .single()

    if (error) throw error
    revalidatePath('/admin/courses')
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteCourseAction(courseId: string) {
  try {
    const supabase = await verifyAdmin()
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('course_id', courseId)

    if (error) throw error
    revalidatePath('/admin/courses')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteLevelAction(levelId: string) {
  try {
    const supabase = await verifyAdmin()
    const { error } = await supabase
      .from('levels')
      .delete()
      .eq('level_id', levelId)

    if (error) throw error
    revalidatePath('/admin/courses')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
