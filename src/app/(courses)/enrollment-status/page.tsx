import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAllUserEnrollmentsStatus } from '@/lib/api/courses'
import {
  Clock,
  XCircle,
  CheckCircle2,
  Mail,
  Phone,
  MessageCircle,
  ShieldCheck,
  AlertTriangle,
  Home
} from 'lucide-react'

export const metadata = {
  title: 'Enrollment Status — IT-vate LMS',
}

interface PageProps {
  searchParams: Promise<{ id?: string }>
}

export default async function EnrollmentStatusPage({ searchParams }: PageProps) {
  const { id } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const enrollments = await getAllUserEnrollmentsStatus()

  // No enrollment at all — redirect to courses
  if (!enrollments || enrollments.length === 0) {
    redirect('/')
  }

  // Find the specific enrollment if requested, otherwise default to the first Pending/Rejected one
  let enrollment = id 
    ? enrollments.find(e => e.enroll_id === id) 
    : enrollments.find(e => e.status === 'Pending' || e.status === 'Rejected')

  // If specific ID not found or they only have active ones, fallback to first one
  if (!enrollment) {
    enrollment = enrollments[0]
  }

  // Active enrollment — allow dashboard access, unless they explicitly navigated here maybe?
  // Actually, we'll let them see the status page if they really want, but usually it's Pending/Rejected.
  if (enrollment.status === 'Active') {
    redirect('/dashboard')
  }

  const isPending = enrollment.status === 'Pending'
  const isRejected = enrollment.status === 'Rejected'

  const courseName = (enrollment.levels as any)?.courses?.name || 'Your Course'
  const levelTitle = (enrollment.levels as any)?.level_title || ''

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-8">
      <div className="mx-auto max-w-xl w-full space-y-8 text-center">

        {/* Status Icon */}
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
          isPending
            ? 'bg-amber-50 text-[#F18231]'
            : 'bg-red-50 text-red-500'
        }`}>
          {isPending ? (
            <Clock className="h-10 w-10 animate-pulse" />
          ) : (
            <XCircle className="h-10 w-10" />
          )}
        </div>

        {/* Main Message */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-[#0F172A]">
            {isPending
              ? 'Enrollment Under Review'
              : 'Enrollment Request Rejected'}
          </h1>

          {isPending && (
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              Your enrollment request for <span className="font-semibold text-[#0F172A]">{courseName}</span> has been submitted to the admin team. Please wait while they review and verify your payment.
            </p>
          )}

          {isRejected && (
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              Unfortunately, your enrollment request for <span className="font-semibold text-[#0F172A]">{courseName}</span> has been rejected by the admin team.
            </p>
          )}
        </div>

        {/* Rejection Reason */}
        {isRejected && enrollment.rejected_reason && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-left">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-red-800 uppercase tracking-wider">
                  Reason for Rejection
                </p>
                <p className="text-sm text-red-700 leading-relaxed">
                  {enrollment.rejected_reason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pending Details */}
        {isPending && (
          <>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-4 text-left">
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#F18231]" />
                Enrollment Details
              </h3>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Course:</span>
                  <span className="font-semibold text-[#0F172A]">{courseName}</span>
                </div>
                {levelTitle && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Level:</span>
                    <span className="font-semibold">{levelTitle}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Track:</span>
                  <span className="font-bold text-[#F18231]">{enrollment.track_type} Track</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 uppercase">
                    Pending Review
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-left">
              <p className="text-xs text-amber-800 leading-relaxed">
                <span className="font-bold">⏳ Please be patient:</span> The admin team is reviewing your payment proof. This process usually takes <span className="font-semibold">24–48 hours</span> on business days. You will get access to the student dashboard once your enrollment is approved.
              </p>
            </div>
          </>
        )}

        {/* Contact Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            {isRejected
              ? 'Questions? Contact Us to Resolve'
              : 'Need Help? Contact Us Directly'}
          </h3>
          <p className="text-xs text-slate-500">
            {isRejected
              ? 'If you believe this was an error or want to resubmit your payment proof, please contact us.'
              : 'If you have any questions or want to expedite your enrollment, feel free to reach out.'}
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {isRejected && (
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#F18231] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d96f21] transition-colors"
            >
              Browse Courses & Re-enroll
            </Link>
          )}
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors"
          >
            <Home className="h-4 w-4" />
            Return to Home Page
          </Link>
        </div>

      </div>
    </div>
  )
}
