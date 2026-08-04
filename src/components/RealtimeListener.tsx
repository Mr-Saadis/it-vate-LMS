'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface RealtimeListenerProps {
  userId: string
  role: 'admin' | 'student'
}

export function RealtimeListener({ userId, role }: RealtimeListenerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debounce the router refresh to prevent spamming
  const debouncedRefresh = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      router.refresh()
    }, 500)
  }

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('global-schema-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload: any) => {
          console.log('[RealtimeListener] Event received:', payload)
          // Admins get updates for everything, no filter needed.
          if (role === 'admin') {
            console.log('[RealtimeListener] Refreshing for admin...')
            debouncedRefresh()
            return
          }

          // Students only care about rows that belong to them (user_id matches)
          // or generic public tables like courses/levels/coupons (though those rarely change).
          const table = payload.table
          const rowData = payload.new || payload.old
          
          const isRowForUser = rowData?.user_id === userId
          const isPublicTable = ['courses', 'levels', 'coupons', 'content_items'].includes(table)

          if (isRowForUser || isPublicTable) {
            debouncedRefresh()

            // Smart Notifications for Students
            if (payload.eventType === 'UPDATE' && isRowForUser) {
              if (table === 'payments' && payload.new.status === 'Verified' && payload.old.status !== 'Verified') {
                toast.success('Your payment was verified!', {
                  description: 'Your enrollment will be active shortly.',
                  duration: 6000,
                })
              }
              if (table === 'enrollments' && payload.new.status === 'Active' && payload.old.status !== 'Active') {
                toast.success('Your enrollment is now Active!', {
                  description: 'You can now access your course content.',
                  duration: 6000,
                })
              }
              if (table === 'enrollments' && payload.new.is_completed === true && payload.old.is_completed !== true) {
                toast.success('Congratulations!', {
                  description: 'You have completed this track!',
                  duration: 8000,
                })
              }
            }
          }
        }
      )
      .subscribe((status, err) => {
        if (err) console.error('Realtime subscription error:', err)
      })

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      supabase.removeChannel(channel)
    }
  }, [userId, role, router, pathname])

  return null
}
