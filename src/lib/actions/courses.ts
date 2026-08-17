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
}) {
  try {
    const supabase = await verifyAdmin()
    
    const { data, error } = await supabase
      .from('levels')
      .insert([levelData])
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

// ─── ENROLL NEXT LEVEL (No payment — for Expert/Progressive/Fast multi-level) ─
// Called from the student dashboard after completing a level.
// Creates a Pending enrollment for the next level with the selected batch.
// Admin must still approve before the student can access the next level.
export async function enrollNextLevel(
  levelId: string,
  batchId: string | null,
  trackType: string,
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 1. Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Not authenticated. Please log in.' }
    }

    // 2. Verify the level belongs to the given course
    const { data: levelData, error: levelErr } = await supabase
      .from('levels')
      .select('level_id, no, course_id')
      .eq('level_id', levelId)
      .single()

    if (levelErr || !levelData) {
      return { success: false, error: 'Invalid level.' }
    }

    if (levelData.course_id !== courseId) {
      return { success: false, error: 'Level does not belong to the specified course.' }
    }

    // 3. Verify the user has an Active enrollment for the PREVIOUS level of this course
    const { data: allCourseLevels } = await supabase
      .from('levels')
      .select('level_id, no')
      .eq('course_id', courseId)
      .order('no', { ascending: true })

    if (!allCourseLevels || allCourseLevels.length === 0) {
      return { success: false, error: 'Could not fetch course levels.' }
    }

    const currentLevelIndex = allCourseLevels.findIndex(l => l.level_id === levelId)
    if (currentLevelIndex <= 0) {
      return { success: false, error: 'This is the first level — use the standard enrollment flow.' }
    }

    const prevLevelId = allCourseLevels[currentLevelIndex - 1].level_id

    const { data: prevEnrollment, error: prevErr } = await supabase
      .from('enrollments')
      .select('enroll_id, status, is_completed')
      .eq('user_id', user.id)
      .eq('level_id', prevLevelId)
      .in('status', ['Active', 'Completed'])
      .maybeSingle()

    if (prevErr) {
      return { success: false, error: 'Could not verify previous level enrollment.' }
    }

    if (!prevEnrollment) {
      return { success: false, error: 'You must complete the previous level before unlocking the next one.' }
    }

    // 4. Ensure user doesn't already have a non-rejected enrollment for this level, UNLESS it's Fast/Expert needing a batch
    const { data: existing } = await supabase
      .from('enrollments')
      .select('enroll_id, status, content_items_id')
      .eq('user_id', user.id)
      .eq('level_id', levelId)
      .neq('status', 'Rejected')
      .maybeSingle()

    if (existing) {
      let isPlaceholder = false
      
      if (existing.content_items_id && (trackType === 'Expert' || trackType === 'Fast')) {
        const { data: currentBatchData } = await supabase
          .from('content_items')
          .select('level_id')
          .eq('content_items_id', existing.content_items_id)
          .maybeSingle()
          
        if (currentBatchData && currentBatchData.level_id !== levelId) {
          isPlaceholder = true
        }
      }

      if ((trackType === 'Expert' || trackType === 'Fast') && (!existing.content_items_id || isPlaceholder) && batchId) {
        // Update the existing enrollment with the newly selected batch
        const { error: updateErr } = await supabase
          .from('enrollments')
          .update({ content_items_id: batchId })
          .eq('enroll_id', existing.enroll_id)
          
        if (updateErr) {
          return { success: false, error: `Failed to assign batch: ${updateErr.message}` }
        }
        revalidatePath('/dashboard')
        return { success: true }
      }
      return { success: false, error: 'You already have an active enrollment for this level.' }
    }

    // 5. Create new enrollment — Pending, admin will activate
    const { error: insertErr } = await supabase
      .from('enrollments')
      .insert({
        user_id: user.id,
        level_id: levelId,
        status: 'Pending',
        track_type: trackType,
        content_items_id: batchId || null,
      })

    if (insertErr) {
      return { success: false, error: `Failed to create enrollment: ${insertErr.message}` }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

