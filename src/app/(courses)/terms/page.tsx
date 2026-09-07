export const metadata = {
  title: 'Terms of Service | IT-vate Solutions',
  description: 'Terms of Service for IT-vate Solutions.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white py-12 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl prose prose-slate">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl mb-8">
          Terms of Service
        </h1>
        <div className="text-slate-600 space-y-6 text-sm leading-relaxed">
          <p>
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <p>
            Welcome to IT-vate Solutions! These terms and conditions outline the rules and regulations for the use of our educational platform.
          </p>
          <h2 className="text-xl font-bold text-[#0F172A] mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing this platform, we assume you accept these terms and conditions. Do not continue to use IT-vate Solutions if you do not agree to take all of the terms and conditions stated on this page.
          </p>
          <h2 className="text-xl font-bold text-[#0F172A] mt-8 mb-4">2. License to Use</h2>
          <p>
            Unless otherwise stated, IT-vate Solutions and/or its licensors own the intellectual property rights for all material on the platform. All intellectual property rights are reserved. You may access this from IT-vate Solutions for your own personal educational use subjected to restrictions set in these terms and conditions.
          </p>
          <h2 className="text-xl font-bold text-[#0F172A] mt-8 mb-4">3. User Accounts</h2>
          <p>
            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>
        </div>
      </div>
    </div>
  )
}
