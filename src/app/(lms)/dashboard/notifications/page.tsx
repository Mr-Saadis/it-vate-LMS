import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAllUserEnrollmentsStatus } from '@/lib/api/courses'
import {
  Clock,
  XCircle,
  Mail,
  Phone,
  MessageCircle,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react'

export const metadata = {
  title: 'Notifications — PDAT Academy',
}

interface PageProps {
  searchParams: Promise<{ id?: string }>
}

export default async function DashboardNotificationsPage({ searchParams }: PageProps) {
  const { id } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const enrollments = await getAllUserEnrollmentsStatus()

  // No enrollment at all
  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="mx-auto max-w-md w-full text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Clock className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-[#0F172A]">No Notifications</h2>
          <p className="text-sm text-slate-500">You don't have any enrollment requests or notifications yet.</p>
        </div>
      </div>
    )
  }

  // --- LIST VIEW ---
  if (!id) {
    const groupedEnrollments = Object.values(
      enrollments.reduce((acc: any, req: any) => {
        const pId = req.payment_enrollments?.[0]?.payment_id || (Array.isArray(req.payment_enrollments?.[0]?.payments) ? req.payment_enrollments?.[0]?.payments[0]?.payment_id : req.payment_enrollments?.[0]?.payments?.payment_id)
        const key = pId || req.enroll_no || req.enroll_id
        if (!acc[key]) {
          acc[key] = { ...req, all_levels: [req.levels] }
        } else {
          acc[key].all_levels.push(req.levels)
        }
        return acc
      }, {})
    )

    return (
      <div className="flex flex-1 flex-col items-center px-4 md:px-8 py-8">
        <div className="mx-auto max-w-3xl w-full space-y-6">
          <div className="border-b border-slate-200 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-[#0F172A]">Notifications</h1>
            <p className="text-sm text-slate-500 mt-1">View the status of your enrollment requests.</p>
          </div>
          
          <div className="grid gap-3">
            {groupedEnrollments.map((req: any) => {
              const courseName = (req.levels as any)?.courses?.name || 'Unknown Course'
              const isPending = req.status === 'Pending'
              const isActive = req.status === 'Active'
              const isRejected = req.status === 'Rejected'
              
              // All statuses go to detail view
              const href = `/dashboard/notifications?id=${req.enroll_id}`
              
              return (
                <Link
                  key={req.enroll_id}
                  href={href}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-[#F18231] hover:shadow-sm transition-all group min-w-0"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                    isActive ? 'bg-green-50 text-green-600' :
                    isPending ? 'bg-amber-50 text-[#F18231]' :
                    'bg-red-50 text-red-500'
                  }`}>
                    {isActive && <CheckCircle2 className="h-6 w-6" />}
                    {isPending && <Clock className="h-6 w-6" />}
                    {isRejected && <XCircle className="h-6 w-6" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[#0F172A] truncate">
                      {isPending ? 'Enrollment Under Review' : isRejected ? 'Enrollment Rejected' : 'Enrollment Approved'}
                    </h3>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {courseName} &bull; {req.track_type} Track
                    </p>
                  </div>
                  
                  <div className="shrink-0 hidden sm:block">
                    <span className={`inline-block rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      isActive ? 'bg-green-100 text-green-700' :
                      isPending ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // --- DETAIL VIEW ---
  const initialEnrollment = enrollments.find(e => e.enroll_id === id) 
  
  if (!initialEnrollment) {
    redirect('/dashboard/notifications')
  }

  const initReq: any = initialEnrollment
  const pId = initReq.payment_enrollments?.[0]?.payment_id || (Array.isArray(initReq.payment_enrollments?.[0]?.payments) ? initReq.payment_enrollments?.[0]?.payments[0]?.payment_id : initReq.payment_enrollments?.[0]?.payments?.payment_id)
  const groupKey = pId || initReq.enroll_no || initReq.enroll_id
  const groupEnrollments = enrollments.filter((e: any) => {
    const eId = e.payment_enrollments?.[0]?.payment_id || (Array.isArray(e.payment_enrollments?.[0]?.payments) ? e.payment_enrollments?.[0]?.payments[0]?.payment_id : e.payment_enrollments?.[0]?.payments?.payment_id)
    return (eId || e.enroll_no || e.enroll_id) === groupKey
  })
  const enrollment = groupEnrollments[0]

  const isActive = enrollment.status === 'Active'
  const isPending = enrollment.status === 'Pending'
  const isRejected = enrollment.status === 'Rejected'

  const courseName = (enrollment.levels as any)?.courses?.name || 'Your Course'
  const levelTitle = groupEnrollments.map(e => (e.levels as any)?.level_title).filter(Boolean).join(', ') || ''

  return (
    <div className="flex flex-1 flex-col px-4 md:px-8 py-8">
      <div className="mx-auto max-w-3xl w-full">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/dashboard/notifications" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0F172A] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Notifications
          </Link>
        </div>

        <div className="space-y-8 text-center">
          {/* Status Icon */}
          <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
            isActive ? 'bg-green-50 text-green-600' :
            isPending ? 'bg-amber-50 text-[#F18231]' :
            'bg-red-50 text-red-500'
          }`}>
            {isActive && <CheckCircle2 className="h-10 w-10" />}
            {isPending && <Clock className="h-10 w-10 animate-pulse" />}
            {isRejected && <XCircle className="h-10 w-10" />}
          </div>

          {/* Main Message */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-[#0F172A]">
              {isActive
                ? 'Enrollment Approved'
                : isPending
                ? 'Enrollment Under Review'
                : 'Enrollment Request Rejected'}
            </h1>

            {isActive && (
              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Congratulations! Your enrollment request for <span className="font-semibold text-[#0F172A]">{courseName}</span> has been approved. You now have full access to this course in your dashboard.
              </p>
            )}

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

          {/* Reason Note */}
          {enrollment.rejected_reason && (
            <div className={`rounded-xl border p-5 text-left ${
              isRejected ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'
            }`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${
                  isRejected ? 'text-red-500' : 'text-blue-500'
                }`} />
                <div className="space-y-1">
                  <p className={`text-xs font-bold uppercase tracking-wider ${
                    isRejected ? 'text-red-800' : 'text-blue-800'
                  }`}>
                    {isRejected ? 'Reason for Rejection' : 'Important Note'}
                  </p>
                  <p className={`text-sm leading-relaxed ${
                    isRejected ? 'text-red-700' : 'text-blue-700'
                  }`}>
                    {enrollment.rejected_reason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enrollment Details (Shown for all) */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 text-left shadow-sm">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#F18231]" />
              Enrollment Details
            </h3>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5">
                <span className="text-slate-500">Course:</span>
                <span className="font-semibold text-[#0F172A] sm:text-right">{courseName}</span>
              </div>
              {levelTitle && (
                <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 pt-1.5 sm:pt-0">
                  <span className="text-slate-500 sm:shrink-0">Levels Included ({groupEnrollments.length}):</span>
                  <span className="font-semibold sm:text-right sm:max-w-[60%]">{levelTitle}</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 pt-1.5 sm:pt-0">
                <span className="text-slate-500">Track:</span>
                <span className="font-bold text-[#F18231] sm:text-right">{enrollment.track_type} Track</span>
              </div>
              
              {isActive && enrollment.content_items?.[0]?.title && (
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 pt-1.5 sm:pt-0">
                  <span className="text-slate-500">Assigned Batch:</span>
                  <span className="font-semibold text-[#0F172A] sm:text-right">{enrollment.content_items[0].title}</span>
                </div>
              )}
              
              {/* Payment Amount */}
              {(() => {
                const p: any = enrollment.payment_enrollments?.[0]?.payments;
                const totalAmount = Array.isArray(p) ? p[0]?.total_amount : p?.total_amount;
                if (typeof totalAmount === 'number' || typeof totalAmount === 'string') {
                  return (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 border-t border-slate-100 pt-3 mt-3">
                      <span className="text-slate-500">Amount Paid:</span>
                      <span className="font-semibold sm:text-right">Rs. {totalAmount}</span>
                    </div>
                  )
                }
                return null;
              })()}

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 border-t border-slate-100 pt-3 mt-3">
                <span className="text-slate-500">Status:</span>
                <span className={`self-start sm:self-auto rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                  isActive ? 'bg-green-100 text-green-700' :
                  isPending ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {isActive ? 'Approved' : isPending ? 'Pending Review' : 'Rejected'}
                </span>
              </div>
            </div>
          </div>

          {/* Pending Info Alert */}
          {isPending && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-left">
              <p className="text-xs text-amber-800 leading-relaxed">
                <span className="font-bold">⏳ Please be patient:</span> The admin team is reviewing your payment proof. This process usually takes <span className="font-semibold">24–48 hours</span> on business days. You will get access to the course content once your enrollment is approved.
              </p>
            </div>
          )}

          {/* Contact Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
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

        </div>
      </div>
    </div>
  )
}
