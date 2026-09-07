export const metadata = {
  title: 'Privacy Policy | PDAT Academy',
  description: 'Privacy Policy for PDAT Academy.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-12 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl prose prose-slate">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl mb-8">
          Privacy Policy
        </h1>
        <div className="text-slate-600 space-y-6 text-sm leading-relaxed">
          <p>
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <p>
            At PDAT Academy, we are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
          </p>
          <h2 className="text-xl font-bold text-[#0F172A] mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect personal information that you voluntarily provide to us when you register on the platform, express an interest in obtaining information about us or our products and services, or otherwise contact us.
          </p>
          <h2 className="text-xl font-bold text-[#0F172A] mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            We use personal information collected via our platform for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
          </p>
          <h2 className="text-xl font-bold text-[#0F172A] mt-8 mb-4">3. Will Your Information Be Shared With Anyone?</h2>
          <p>
            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
          </p>
        </div>
      </div>
    </div>
  )
}
