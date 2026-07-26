import { MOCK_COURSES, MOCK_CONTENT_ITEMS } from '@/lib/mockData'
import { Course, ContentItem } from '@/lib/types'

export async function getCourses(): Promise<Course[]> {
  try {
    const res = await fetch('/api/courses', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (data.courses && data.courses.length > 0) return data.courses
    }
  } catch (err) {
    console.warn('API /api/courses fallback to mock data:', err)
  }
  return MOCK_COURSES
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const courses = await getCourses()
  return courses.find((c) => c.slug === slug) || MOCK_COURSES.find((c) => c.slug === slug) || null
}

export async function getContentItems(levelId: string): Promise<ContentItem[]> {
  return MOCK_CONTENT_ITEMS[levelId] || []
}
