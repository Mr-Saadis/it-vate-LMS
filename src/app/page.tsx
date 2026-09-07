import CoursesLandingPage from './(courses)/page'
import { DarkFooter } from '@/components/courses/Footer'

// Root page renders the courses landing page by default.
// The middleware handles subdomain routing for lms.* hosts.
export default function RootPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans antialiased text-[#0F172A]">
      <main className="flex-1">
        <CoursesLandingPage />
      </main>
      <DarkFooter />
    </div>
  )
}
