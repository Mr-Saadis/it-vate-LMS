'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface SidebarContextValue {
  activeStudentName: string | null
  setActiveStudentName: (name: string | null) => void
}

const SidebarContext = createContext<SidebarContextValue>({
  activeStudentName: null,
  setActiveStudentName: () => {},
})

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [activeStudentName, setActiveStudentNameState] = useState<string | null>(null)

  const setActiveStudentName = useCallback((name: string | null) => {
    setActiveStudentNameState(name)
  }, [])

  return (
    <SidebarContext.Provider value={{ activeStudentName, setActiveStudentName }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useActiveStudent() {
  return useContext(SidebarContext)
}
