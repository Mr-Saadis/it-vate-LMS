import { CoursesNavbar } from '@/components/courses/Navbar'

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
      <footer className="border-t border-slate-200 bg-[#0F172A] py-6">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#F18231]">
              <span className="text-[9px] font-black text-white">IT</span>
            </div>
            <span className="text-xs font-bold text-white">IT-vate Solutions</span>
          </div>
          <p className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} IT-vate Solutions. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
