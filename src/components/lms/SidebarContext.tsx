'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface SidebarContextValue {
  activeStudentName: string | null
  setActiveStudentName: (name: string | null) => void
  activeCourseName: string | null
  setActiveCourseName: (name: string | null) => void
}

const SidebarContext = createContext<SidebarContextValue>({
  activeStudentName: null,
  setActiveStudentName: () => {},
  activeCourseName: null,
  setActiveCourseName: () => {},
})

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [activeStudentName, setActiveStudentNameState] = useState<string | null>(null)
  const [activeCourseName, setActiveCourseNameState] = useState<string | null>(null)

  const setActiveStudentName = useCallback((name: string | null) => {
    setActiveStudentNameState(name)
  }, [])

  const setActiveCourseName = useCallback((name: string | null) => {
    setActiveCourseNameState(name)
  }, [])

  return (
    <SidebarContext.Provider value={{ activeStudentName, setActiveStudentName, activeCourseName, setActiveCourseName }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useActiveStudent() {
  return useContext(SidebarContext)
}

export function useActiveCourse() {
  return useContext(SidebarContext)
}
