import { createClient } from '@/lib/supabase/server'
import { RealtimeListener } from './RealtimeListener'

export async function RealtimeProvider() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const role = profile?.role || 'student'

    return <RealtimeListener userId={user.id} role={role as any} />
  } catch (error: any) {
    if (error?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    console.error('Failed to initialize RealtimeProvider:', error)
    return null
  }
}
