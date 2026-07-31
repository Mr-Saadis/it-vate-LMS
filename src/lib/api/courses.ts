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
          price,
          course_id,
          courses ( course_id, name, slug, description )
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'Active')

    if (error || !data) return []
    return data
  } catch {
    return []
  }
}

// Fetch all pending payments (admin only)
export async function getPendingPayments() {
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
          users ( name, email ),
          levels (
            level_title,
            courses ( name )
          )
        )
      `)
      .eq('status', 'Pending')
      .order('created_at', { ascending: true })

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
    console.error('Pending payments fetch error:', err)
    return []
  }
}
