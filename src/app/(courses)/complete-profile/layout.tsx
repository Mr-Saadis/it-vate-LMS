import type { ReactNode } from 'react'

// Complete-profile page bypasses the CoursesLayout (no Navbar/Footer)
export default function CompleteProfileLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
