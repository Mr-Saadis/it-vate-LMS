'use client'

import { useState, useTransition } from 'react'
import { approvePayment, rejectPayment } from '@/lib/actions/admin'
import {
  CheckCircle2,
  XCircle,
  Eye,
  ShieldCheck,
  Cpu,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface Payment {
  payment_id: string
  enroll_id: string
  user_name: string
  user_email: string
  course_name: string
  track_type: string
  amount: number
  discount: number
  total_amount: number
  transaction_reference: string
  status: string
  payment_proof: string
  created_at: string
}

interface AdminClientProps {
  payments: Payment[]
}

export function AdminClient({ payments: initialPayments }: AdminClientProps) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments)
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null)
  const [generatedIds, setGeneratedIds] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()
  const [actionTarget, setActionTarget] = useState<string | null>(null)

  const handleApprove = (payment: Payment) => {
    setActionTarget(payment.payment_id)
    const fd = new FormData()
    fd.append('payment_id', payment.payment_id)
    fd.append('enroll_id', payment.enroll_id)

    startTransition(async () => {
      const result = await approvePayment(fd)
      if (result?.success && result.enrollNo) {
        toast.success(`Payment verified! Enrollment ID: ${result.enrollNo}`)
        setGeneratedIds((prev) => ({
          ...prev,
          [payment.payment_id]: result.enrollNo as string,
        }))
        setPayments((prev) =>
          prev.map((p) =>
            p.payment_id === payment.payment_id
              ? { ...p, status: 'Verified' }
              : p
          )
        )
      } else {
        toast.error(result?.error || 'Failed to approve payment')
      }
      setActionTarget(null)
    })
  }

  const handleReject = (payment: Payment) => {
    setActionTarget(payment.payment_id)
    const fd = new FormData()
    fd.append('payment_id', payment.payment_id)
    fd.append('enroll_id', payment.enroll_id)
    fd.append('reason', 'Payment could not be verified.')

    startTransition(async () => {
      const result = await rejectPayment(fd)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.info('Payment rejected')
        setPayments((prev) =>
          prev.map((p) =>
            p.payment_id === payment.payment_id ? { ...p, status: 'Rejected' } : p
          )
        )
      }
      setActionTarget(null)
    })
  }

  const pending = payments.filter((p) => p.status === 'Pending')
  const processed = payments.filter(
    (p) => p.status === 'Verified' || p.status === 'Rejected'
  )

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#0F172A] px-2.5 py-0.5 text-xs font-bold text-white">
              ADMIN
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Payment Verification Panel
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-[#0F172A]">
            Pending Enrollment Approvals
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Review submitted bank transfers and approve to generate CPDP enrollment IDs.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shrink-0">
          <Cpu className="h-4 w-4 text-[#F18231]" />
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pending
            </p>
            <p className="text-2xl font-extrabold text-[#0F172A]">
              {pending.length}
            </p>
          </div>
        </div>
      </div>

      {/* Proof Image Lightbox */}
      {selectedProofUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={() => setSelectedProofUrl(null)}
        >
          <div
            className="relative max-h-[80vh] max-w-3xl w-full rounded-xl overflow-hidden border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedProofUrl}
              alt="Payment Proof"
              className="w-full h-auto object-contain max-h-[80vh]"
            />
            <button
              onClick={() => setSelectedProofUrl(null)}
              className="absolute top-3 right-3 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Pending Payments Table */}
      {pending.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <ShieldCheck className="h-10 w-10 text-green-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#0F172A]">All payments reviewed!</p>
          <p className="text-xs text-slate-500 mt-1">No pending verifications at this time.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    'Student',
                    'Course / Track',
                    'Amount',
                    'Transaction Ref',
                    'Submitted',
                    'Proof',
                    'Actions',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-bold text-[11px] uppercase tracking-wider text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {pending.map((p) => {
                  const isProcessing = isPending && actionTarget === p.payment_id
                  return (
                    <tr key={p.payment_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[#0F172A]">{p.user_name}</p>
                        <p className="text-slate-400">{p.user_email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[#0F172A] max-w-[150px] truncate">
                          {p.course_name}
                        </p>
                        <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-[#F18231]">
                          {p.track_type} Track
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-extrabold text-[#0F172A]">
                          PKR {p.total_amount.toLocaleString()}
                        </p>
                        {p.discount > 0 && (
                          <p className="text-green-600">
                            -{p.discount} disc.
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-[#0F172A]">
                          {p.transaction_reference}
                        </code>
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {new Date(p.created_at).toLocaleDateString('en-PK', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProofUrl(p.payment_proof)}
                          className="h-8 text-[11px]"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(p)}
                            disabled={isProcessing}
                            className="h-8 bg-green-600 hover:bg-green-700 text-[11px]"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            {isProcessing ? '...' : 'Approve'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(p)}
                            disabled={isProcessing}
                            className="h-8 text-[11px]"
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generated CPDP IDs */}
      {Object.keys(generatedIds).length > 0 && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5 space-y-3">
          <h3 className="text-xs font-bold text-green-800 uppercase tracking-wider">
            Generated Enrollment IDs (this session)
          </h3>
          {Object.entries(generatedIds).map(([pid, id]) => (
            <div key={pid} className="flex items-center justify-between">
              <code className="text-sm font-mono font-extrabold text-green-800">
                {id}
              </code>
              <span className="text-[10px] text-green-600">
                Payment: {pid}
              </span>
            </div>
          ))}
          <p className="text-[11px] text-green-700 border-t border-green-200 pt-3">
            Manually add the student to Google Classroom using the above enrollment ID.
          </p>
        </div>
      )}

      {/* Processed Payments */}
      {processed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Processed ({processed.length})
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <tbody>
                {processed.map((p) => (
                  <tr key={p.payment_id} className="px-4 py-3 flex items-center justify-between">
                    <td className="px-4 py-3 flex-1">
                      <p className="font-semibold text-[#0F172A]">{p.user_name}</p>
                      <p className="text-slate-400">{p.course_name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          p.status === 'Verified'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
