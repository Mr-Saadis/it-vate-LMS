import Link from 'next/link'
import { Clock, CheckCircle2, Mail, Phone, MessageCircle } from 'lucide-react'

export default function PendingVerificationPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center space-y-8">
      {/* Success Icon */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-[#F18231]">
        <Clock className="h-10 w-10 animate-pulse" />
      </div>

      {/* Main Message */}
      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-[#0F172A]">
          Request Submitted Successfully!
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
          Your enrollment request along with your payment proof has been <span className="font-semibold text-[#F18231]">sent to the admin team</span> for review.
          The admin will verify your transaction and approve your enrollment.
        </p>
      </div>

      {/* What Happens Next */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-4 text-left">
        <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
          What Happens Next?
        </h3>
        <ul className="space-y-3 text-xs text-slate-700">
          <li className="flex items-start gap-3">
            <CheckCircle2 className="h-4 w-4 text-[#F18231] shrink-0 mt-0.5" />
            <span>
              Admin will <span className="font-semibold">review your payment proof</span> and verify it against the bank records.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="h-4 w-4 text-[#F18231] shrink-0 mt-0.5" />
            <span>
              Once verified, you will be <span className="font-semibold">admitted to the course</span> and your CPDP Enrollment ID will be generated (e.g. <code className="font-bold text-[#0F172A] bg-white px-1 py-0.5 rounded">CPDP202607001</code>).
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="h-4 w-4 text-[#F18231] shrink-0 mt-0.5" />
            <span>
              You will then get full access to the <span className="font-semibold">LMS Dashboard</span>, learning materials, and Google Classroom invitation.
            </span>
          </li>
        </ul>
      </div>

      {/* Important Notice */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-left">
        <p className="text-xs text-amber-800 leading-relaxed">
          <span className="font-bold">⏳ Please Note:</span> Until the admin approves your enrollment, you will remain in the waiting area and won&apos;t be able to access the student dashboard. This process usually takes <span className="font-semibold">24–48 hours</span> on business days.
        </p>
      </div>

      {/* Contact Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
          Need Help? Contact Us Directly
        </h3>
        <p className="text-xs text-slate-500">
          If you have any questions or want to expedite your enrollment, feel free to reach out.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="mailto:info@itvate.com"
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-[#0F172A] hover:border-[#F18231] hover:bg-orange-50 transition-colors"
          >
            <Mail className="h-4 w-4 text-[#F18231]" />
            Email Us
          </a>
          <a
            href="tel:+923001234567"
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-[#0F172A] hover:border-[#F18231] hover:bg-orange-50 transition-colors"
          >
            <Phone className="h-4 w-4 text-[#F18231]" />
            Call Us
          </a>
          <a
            href="https://wa.me/923001234567"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-[#0F172A] hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <MessageCircle className="h-4 w-4 text-green-600" />
            WhatsApp
          </a>
        </div>
      </div>

      {/* Back to Courses */}
      <div className="pt-2">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors"
        >
          ← Browse More Courses
        </Link>
      </div>
    </div>
  )
}
