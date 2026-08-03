import CoursesLandingPage from './(courses)/page'

// Root page renders the courses landing page by default.
// The middleware handles subdomain routing for lms.* hosts.
export default function RootPage() {
  return <CoursesLandingPage />
}
