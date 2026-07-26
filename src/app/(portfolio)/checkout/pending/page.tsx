import Link from 'next/link'
import { Clock, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function PendingVerificationPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center space-y-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-[#F18231]">
        <Clock className="h-8 w-8 animate-pulse" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#0F172A]">Payment Submitted — Pending Verification</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          Your transaction proof has been submitted to the Supabase database. Our admin team will verify your transaction reference shortly.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-3 text-left">
        <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">What Happens Next?</h3>
        <ul className="space-y-2 text-xs text-slate-700">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#F18231] shrink-0 mt-0.5" />
            <span>Admin verifies deposit against bank statement.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#F18231] shrink-0 mt-0.5" />
            <span>System generates your permanent Enrollment ID format: <code className="font-bold text-[#0F172A]">CPDP202607001</code>.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#F18231] shrink-0 mt-0.5" />
            <span>You receive LMS Portal access & Google Classroom invitation link.</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href="/dashboard"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#F18231] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d96f21]"
        >
          Go to Student LMS Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/admin"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
        >
          Open Admin Verification View
        </Link>
      </div>
    </div>
  )
}
