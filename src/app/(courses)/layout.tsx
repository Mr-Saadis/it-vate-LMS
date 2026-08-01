import { CoursesNavbar } from '@/components/courses/Navbar'
import { DarkFooter } from '@/components/courses/Footer'

export const metadata = {
  title: 'IT-vate Solutions — Engineering Courses',
  description: 'Browse and enroll in specialized hardware and firmware engineering courses from IT-vate Solutions.',
}

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans antialiased text-[#0F172A]">
      <CoursesNavbar />
      <main className="flex-1">{children}</main>
      <DarkFooter />
    </div>
  )
}
