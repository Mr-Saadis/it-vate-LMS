import { getAllCoupons } from '@/lib/actions/coupons'
import { getActiveCourses } from '@/lib/api/courses'
import { CouponsClient } from './CouponsClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CouponsPage() {
  const [coupons, courses] = await Promise.all([
    getAllCoupons(),
    getActiveCourses()
  ])

  return <CouponsClient coupons={coupons} courses={courses} />
}
