import type { ReactNode } from 'react'

// Login page gets its own layout — bypasses the CoursesLayout (no Navbar/Footer)
export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
