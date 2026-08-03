import { createClient } from '@/lib/supabase/server'

export async function getUserFullProfile() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        experiences (*)
      `)
      .eq('user_id', user.id)
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}
