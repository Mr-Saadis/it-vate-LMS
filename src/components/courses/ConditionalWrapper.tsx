'use client'

import { usePathname } from 'next/navigation'

export function ConditionalWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  if (pathname === '/login' || pathname === '/signup' || pathname === '/complete-profile') {
    return null
  }

  return <>{children}</>
}
