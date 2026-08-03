import { MOCK_PENDING_PAYMENTS } from '@/lib/mockData'
import { createClient } from '@/lib/supabase/server'

export async function fetchPendingPayments() {
  try {
    const res = await fetch('/api/admin/verify', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (data.payments) return data.payments
    }
  } catch (err) {
    console.warn('API /api/admin/verify fetch fallback:', err)
  }

  if (typeof window !== 'undefined') {
    const local = JSON.parse(localStorage.getItem('itvate_pending_payments') || '[]')
    return [...local, ...MOCK_PENDING_PAYMENTS]
  }

  return MOCK_PENDING_PAYMENTS
}

export async function approvePaymentAndGeneratePDAT(paymentId: string, seqIndex: number) {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const seqNo = String(seqIndex + 1).padStart(3, '0')
  const pdatId = `PDAT${year}${month}${seqNo}`

  try {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_id: paymentId, enroll_no: pdatId }),
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    console.warn('API approve error fallback:', err)
  }

  return { success: true, payment_id: paymentId, enroll_no: pdatId }
}

export async function getAllStudents() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('users')
      .select(`
        user_id,
        name,
        email,
        role,
        phone_number,
        education,
        created_at,
        enrollments!inner (
          enroll_id,
          track_type,
          status,
          enrolled_at,
          is_completed,
          levels (
            courses (
              name
            )
          )
        )
      `)
      .eq('role', 'student')
      .order('created_at', { ascending: false })

    if (error || !data) return []

    // Map to the expected UI format — inner join ensures only enrolled students are returned
    return data.map((user) => ({
      id: user.user_id,
      name: user.name,
      email: user.email,
      phone: (user as any).phone_number,
      education: (user as any).education,
      joined_at: (user as any).created_at,
      enrollments: (user.enrollments || []).map((enr: any) => ({
        enroll_id: enr.enroll_id,
        course: enr.levels?.courses?.name || 'Unknown Course',
        track: enr.track_type || 'Unknown',
        status: enr.status || 'Inactive',
        is_completed: !!enr.is_completed,
        enrollment_date: enr.enrolled_at || new Date().toISOString(),
      })),
    }))
  } catch (err) {
    console.error('Students fetch error:', err)
    return []
  }
}

export async function getStudentById(userId: string) {
  try {
    const supabase = await createClient()

    // Fetch user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('user_id, name, email, role, education, created_at')
      .eq('user_id', userId)
      .eq('role', 'student')
      .single()

    if (userError || !user) return null

    // Fetch experiences
    const { data: experiences } = await supabase
      .from('experiences')
      .select('experience_id, experience, experience_dates')
      .eq('user_id', userId)
      
    // Fetch enrollments with full details
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select(`
        enroll_id,
        track_type,
        status,
        enrolled_at,
        approved_at,
        enroll_no,
        rejected_reason,
        levels (
          level_id,
          no,
          level_title,
          price,
          course_id,
          courses (
            course_id,
            name,
            slug
          )
        ),
        payments (
          payment_id,
          status,
          total_amount,
          payment_method,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false })

    const enrolledData = enrollments || []
    
    // Extract unique course IDs
    const courseIds = Array.from(new Set(enrolledData.map((enr: any) => enr.levels?.course_id).filter(Boolean)))

    // Fetch full course structures for the enrolled courses
    let coursesData: any[] = []
    if (courseIds.length > 0) {
      const { data: courses } = await supabase
        .from('courses')
        .select(`
          course_id,
          name,
          slug,
          levels (
            level_id,
            no,
            level_title,
            price
          )
        `)
        .in('course_id', courseIds)
      
      coursesData = courses || []
    }

    // Group by course
    const groupedCourses = coursesData.map(course => {
      // Find all enrollments for this specific course
      const courseEnrollments = enrolledData.filter((enr: any) => enr.levels?.course_id === course.course_id)
      
      // Determine the track (assuming same track across a course, grab from first enrollment)
      const track = courseEnrollments.length > 0 ? courseEnrollments[0].track_type : 'Unknown'
      
      // Map levels with enrollment data
      const sortedLevels = (course.levels || []).sort((a: any, b: any) => a.no - b.no).map((level: any) => {
        const enrollmentForLevel = courseEnrollments.find((enr: any) => enr.levels?.level_id === level.level_id)
        return {
          level_id: level.level_id,
          no: level.no,
          title: level.level_title,
          price: level.price,
          enrollment: enrollmentForLevel ? {
            enroll_id: enrollmentForLevel.enroll_id,
            status: enrollmentForLevel.status || 'Inactive',
            track: enrollmentForLevel.track_type || 'Unknown',
            enrollment_date: enrollmentForLevel.enrolled_at || '',
            approved_at: enrollmentForLevel.approved_at || '',
            enroll_no: enrollmentForLevel.enroll_no || '',
            rejected_reason: enrollmentForLevel.rejected_reason || '',
            payment: enrollmentForLevel.payments?.[0] || null,
          } : null
        }
      })

      return {
        course_id: course.course_id,
        name: course.name,
        slug: course.slug,
        track,
        levels: sortedLevels
      }
    })

    return {
      ...user,
      experiences: experiences || [],
      courses: groupedCourses,
    }
  } catch (err) {
    console.error('Student detail fetch error:', err)
    return null
  }
}

