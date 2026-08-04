'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAllCoupons() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('coupons')
    .select(`
      *,
      courses:applicable_course_id ( name, slug )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching coupons:', error)
    return []
  }

  return data
}

export async function createCoupon(formData: FormData) {
  const supabase = await createClient()
  
  // Verify Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  const { data: userData } = await supabase.from('users').select('role').eq('user_id', user.id).single()
  if (userData?.role !== 'admin') return { error: 'Unauthorized' }

  const code = formData.get('code') as string
  const discount_percentage = parseFloat(formData.get('discount_percentage') as string)
  const usage_limit = formData.get('usage_limit') ? parseInt(formData.get('usage_limit') as string, 10) : null
  const applicable_course_id = formData.get('applicable_course_id') as string || null
  const applicable_track_type = formData.get('applicable_track_type') as string || null
  const valid_until = formData.get('valid_until') as string || null

  if (!code || isNaN(discount_percentage)) {
    return { error: 'Code and Discount Percentage are required' }
  }

  const { error } = await supabase
    .from('coupons')
    .insert([{
      code: code.toUpperCase(),
      discount_percentage,
      usage_limit,
      applicable_course_id,
      applicable_track_type,
      valid_until
    }])

  if (error) {
    console.error('Error creating coupon:', error)
    return { error: error.message || 'Failed to create coupon' }
  }

  revalidatePath('/admin/coupons')
  return { success: true }
}

export async function toggleCouponStatus(coupon_id: string, is_active: boolean) {
  const supabase = await createClient()
  
  // Verify Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  const { data: userData } = await supabase.from('users').select('role').eq('user_id', user.id).single()
  if (userData?.role !== 'admin') return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('coupons')
    .update({ is_active })
    .eq('coupon_id', coupon_id)

  if (error) {
    return { error: error.message || 'Failed to update coupon status' }
  }

  revalidatePath('/admin/coupons')
  return { success: true }
}

export async function deleteCoupon(coupon_id: string) {
  const supabase = await createClient()
  
  // Verify Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  const { data: userData } = await supabase.from('users').select('role').eq('user_id', user.id).single()
  if (userData?.role !== 'admin') return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('coupon_id', coupon_id)

  if (error) {
    return { error: error.message || 'Failed to delete coupon' }
  }

  revalidatePath('/admin/coupons')
  return { success: true }
}

export async function validateCoupon(code: string, courseId: string, trackType: string) {
  const supabase = await createClient()

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !coupon) {
    return { error: 'Invalid or expired coupon code' }
  }

  // Check Expiration
  if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
    return { error: 'This coupon has expired' }
  }

  // Check Usage Limits
  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
    return { error: 'This coupon has reached its usage limit' }
  }

  // Check Targeting (Course & Track)
  if (coupon.applicable_course_id && coupon.applicable_course_id !== courseId) {
    return { error: 'This coupon is not applicable for this course' }
  }
  if (coupon.applicable_track_type && coupon.applicable_track_type !== trackType) {
    return { error: 'This coupon is not applicable for this track' }
  }

  return { success: true, coupon_id: coupon.coupon_id, discount_percentage: coupon.discount_percentage }
}
