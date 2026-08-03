'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase.from('users').select('role').eq('user_id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Not authorized')
  return supabase
}

export async function createContentItemAction(data: {
  level_id: string
  title: string
  content_type: 'link' | 'drive' | 'video'
  url?: string
  drive_file_id?: string
  youtube_id?: string
}) {
  try {
    const supabase = await verifyAdmin()
    const { data: inserted, error } = await supabase
      .from('content_items')
      .insert([{
        level_id: data.level_id,
        title: data.title,
        content_type: data.content_type,
        url: data.url,
        drive_file_id: data.drive_file_id,
        youtube_id: data.youtube_id,
        is_free: false,
        order_no: 0
      }])
      .select()
      .single()

    if (error) throw error
    revalidatePath('/admin/courses/[id]', 'page')
    return { success: true, data: inserted }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteClassroomLinkAction(contentItemsId: string) {
  try {
    const supabase = await verifyAdmin()
    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('content_items_id', contentItemsId)

    if (error) throw error
    revalidatePath('/admin/courses/[id]', 'page')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
