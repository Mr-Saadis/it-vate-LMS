import { createClient } from '@/lib/supabase/server'
import { MOCK_COURSES } from '@/lib/mockData'
import type { Course } from '@/lib/types'

// Fetch all active courses with their levels
export async function getActiveCourses(): Promise<Course[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        levels (
          level_id,
          no,
          level_title,
          level_description,
          price,
          code,
          is_active,
          course_id
        )
      `)
      .eq('is_active', true)
      .order('name')

    if (error || !data || data.length === 0) return MOCK_COURSES
    return data as Course[]
  } catch {
    return MOCK_COURSES
  }
}

// Fetch a single course by slug with its levels
export async function getCourseBySlug(slug: string): Promise<Course | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        levels (
          level_id,
          no,
          level_title,
          level_description,
          price,
          code,
          is_active,
          course_id
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return MOCK_COURSES.find((c) => c.slug === slug) ?? null
    }
    return data as Course
  } catch {
    return MOCK_COURSES.find((c) => c.slug === slug) ?? null
  }
}

// Fetch enrollments for the current authenticated user
export async function getUserEnrollments() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        payments ( payment_id, status, total_amount ),
        levels (
          level_id,
          no,
          level_title,
          level_description,
          price,
          started_at,
          ended_at,
          course_id,
          courses ( course_id, name, slug, description ),
          content_items (*)
        )
      `)
      .eq('user_id', user.id)
      .in('status', ['Active', 'Completed'])

    if (error || !data) return []
    return data
  } catch {
    return []
  }
}

// Fetch all payments (admin only)
export async function getAllAdminPayments() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        enrollments (
          enroll_id,
          track_type,
          status,
          rejected_reason,
          users ( name, email ),
          levels (
            level_title,
            courses ( name )
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error || !data) return []

    // Dynamically generate fresh Signed URLs for the payment proofs
    // so they never expire and fix any relative path issues
    const paymentsWithSignedUrls = await Promise.all(
      data.map(async (payment) => {
        let proofUrl = payment.payment_proof
        // If it's a relative path (not starting with http)
        if (proofUrl && !proofUrl.startsWith('http')) {
          const { data: signed } = await supabase.storage
            .from('payment-proofs')
            .createSignedUrl(proofUrl, 60 * 60) // 1 hour expiry for admin session
          
          if (signed?.signedUrl) {
            proofUrl = signed.signedUrl
          } else {
            // Fallback: If signed URL fails (e.g. missing SELECT policy), 
            // try to get the public URL (works if they made the bucket public)
            const { data: publicData } = supabase.storage
              .from('payment-proofs')
              .getPublicUrl(proofUrl)
            
            if (publicData?.publicUrl) {
              proofUrl = publicData.publicUrl
            }
          }
        }
        return { ...payment, payment_proof: proofUrl }
      })
    )

    return paymentsWithSignedUrls
  } catch (err) {
    console.error('All payments fetch error:', err)
    return []
  }
}

// Fetch enrollment status for the current user (any status: Pending, Active, Rejected, Completed)
export async function getUserEnrollmentStatus() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        enroll_id,
        status,
        track_type,
        rejected_reason,
        enroll_no,
        enrolled_at,
        approved_at,
        levels (
          level_title,
          courses ( name )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

// Fetch ALL enrollment statuses for the current user (for notifications)
export async function getAllUserEnrollmentsStatus() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        enroll_id,
        status,
        track_type,
        rejected_reason,
        enroll_no,
        enrolled_at,
        approved_at,
        levels (
          level_title,
          courses ( name, slug )
        ),
        payments ( total_amount )
      `)
      .eq('user_id', user.id)
      .order('enrolled_at', { ascending: false })

    let results = data && !error ? data : []

    return results
  } catch {
    return []
  }
}

// Fetch a specific level and its content items (only if the user is actively enrolled)
export async function getLevelWithContents(levelId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // First check if user is actively enrolled in this level
    const { data: enrollment, error: enrollError } = await supabase
      .from('enrollments')
      .select('enroll_id')
      .eq('user_id', user.id)
      .eq('level_id', levelId)
      .eq('status', 'Active')
      .maybeSingle()

    if (enrollError || !enrollment) {
      return null // Not enrolled or not active
    }

    // Now fetch the level with its contents and course info
    const { data: level, error: levelError } = await supabase
      .from('levels')
      .select(`
        *,
        courses ( name, slug, description ),
        content_items (*)
      `)
      .eq('level_id', levelId)
      .maybeSingle()

    if (levelError || !level) return null

    // Sort content items by order_no
    if (level.content_items) {
      level.content_items.sort((a: any, b: any) => a.order_no - b.order_no)
    }

    return level
  } catch {
    return null
  }
}

// Fetch ALL courses (active and inactive) with their levels for Admin
export async function getAllCoursesWithLevelsAdmin(): Promise<Course[]> {
  try {
    const supabase = await createClient()
    // Verify admin role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data: profile } = await supabase.from('users').select('role').eq('user_id', user.id).single()
    if (profile?.role !== 'admin') return []

    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        levels (
          level_id,
          no,
          level_title,
          level_description,
          price,
          code,
          is_active,
          course_id,
          content_items (
            content_items_id,
            title,
            url,
            content_type,
            is_completed
          )
        )
      `)
      .order('name')

    if (error || !data) return []
    return data as Course[]
  } catch {
    return []
  }
}

export async function getCourseByIdAdmin(id: string): Promise<Course | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase.from('users').select('role').eq('user_id', user.id).single()
    if (profile?.role !== 'admin') return null

    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        levels (
          level_id,
          no,
          level_title,
          level_description,
          price,
          code,
          is_active,
          course_id,
          content_items (
            content_items_id,
            title,
            url,
            content_type,
            is_completed
          )
        )
      `)
      .eq('course_id', id)
      .single()

    if (error || !data) return null
    return data as Course
  } catch {
    return null
  }
}
