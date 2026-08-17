'use client'

import { useState, useTransition, useEffect } from 'react'
import { approvePayment, rejectPayment, getAvailableBatchesAction } from '@/lib/actions/admin'
import {
  CheckCircle2,
  XCircle,
  Eye,
  ShieldCheck,
  Cpu,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Payment {
  payment_id: string
  enroll_id: string
  user_name: string
  user_email: string
  course_name: string
  track_type: string
  batch_title?: string | null
  batch_id?: string | null
  amount: number
  discount: number
  total_amount: number
  transaction_reference: string
  status: string
  payment_proof: string
  created_at: string
  rejected_reason?: string | null
}

interface AdminClientProps {
  payments: Payment[]
}

export function AdminClient({ payments: initialPayments }: AdminClientProps) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments)

  useEffect(() => {
    setPayments(initialPayments)
  }, [initialPayments])

  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null)
  const [generatedIds, setGeneratedIds] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()
  const [actionTarget, setActionTarget] = useState<string | null>(null)
  const [rejectPaymentTarget, setRejectPaymentTarget] = useState<Payment | null>(null)
  const [approvePaymentTarget, setApprovePaymentTarget] = useState<Payment | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [availableBatches, setAvailableBatches] = useState<{content_items_id: string, title: string}[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState<string>('')
  const [initialBatchId, setInitialBatchId] = useState<string>('')
  const [batchChangeReason, setBatchChangeReason] = useState('')
  const [isLoadingBatches, setIsLoadingBatches] = useState(false)

  const handleApproveClick = (payment: Payment) => {
    setApprovePaymentTarget(payment)
    setAvailableBatches([])
    setSelectedBatchId(payment.batch_id || '')
    setInitialBatchId(payment.batch_id || '')
    setBatchChangeReason('')
    setIsLoadingBatches(true)
    getAvailableBatchesAction(payment.enroll_id).then(batches => {
      setAvailableBatches(batches)
      setIsLoadingBatches(false)
      // Default to student's selected batch if possible, otherwise first available
      let initId = ''
      if (payment.batch_id && batches.some(b => b.content_items_id === payment.batch_id)) {
        initId = payment.batch_id
      } else if (batches.length > 0) {
        initId = batches[0].content_items_id
      }
      setSelectedBatchId(initId)
      setInitialBatchId(initId)
    }).catch(() => {
      setIsLoadingBatches(false)
    })
  }

  const handleApproveConfirm = () => {
    if (!approvePaymentTarget) return
    const payment = approvePaymentTarget

    if (!selectedBatchId && approvePaymentTarget.track_type !== 'Premium') {
      toast.error('Please select a target batch.')
      return
    }

    const isBatchChanged = initialBatchId ? selectedBatchId !== initialBatchId : false
    if (isBatchChanged && !batchChangeReason.trim() && approvePaymentTarget.track_type !== 'Premium') {
      toast.error('Please provide a reason for changing the batch.')
      return
    }

    setApprovePaymentTarget(null)
    setActionTarget(payment.payment_id)
    const fd = new FormData()
    fd.append('payment_id', payment.payment_id)
    fd.append('enroll_id', payment.enroll_id)
    fd.append('new_batch_id', selectedBatchId)
    if (isBatchChanged) {
      fd.append('batch_change_reason', batchChangeReason.trim())
    }

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

  const handleRejectConfirm = () => {
    if (!rejectPaymentTarget || !rejectReason.trim()) return

    setActionTarget(rejectPaymentTarget.payment_id)
    const fd = new FormData()
    fd.append('payment_id', rejectPaymentTarget.payment_id)
    fd.append('enroll_id', rejectPaymentTarget.enroll_id)
    fd.append('reason', rejectReason.trim())

    startTransition(async () => {
      const result = await rejectPayment(fd)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.info('Payment rejected')
        setPayments((prev) =>
          prev.map((p) =>
            p.payment_id === rejectPaymentTarget.payment_id
              ? { ...p, status: 'Rejected', rejected_reason: rejectReason.trim() }
              : p
          )
        )
        setRejectPaymentTarget(null)
        setRejectReason('')
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded bg-[#0F172A] px-2 py-0.5 text-[10px] font-bold tracking-widest text-white uppercase">Admin</span>
            <span className="text-xs text-slate-400 font-medium">/ Payments</span>
          </div>
          <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Pending Enrollment Approvals
          </h1>
          <p className="text-[11px] text-slate-500 mt-1">
            Review submitted bank transfers and approve to generate CPDP enrollment IDs.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm shrink-0">
          <Cpu className="h-4 w-4 text-[#F18231]" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Pending
            </p>
            <p className="text-sm font-extrabold text-[#0F172A] leading-tight">
              {pending.length}
            </p>
          </div>
        </div>
      </div>

      {/* Proof Image Lightbox */}
      {selectedProofUrl && (
        <div
          className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black/70 p-6"
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

      {/* Approve Payment Dialog */}
      {approvePaymentTarget && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 shrink-0">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">Approve Payment</h3>
                <p className="text-xs text-slate-500">Confirm student enrollment batch.</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <p className="text-sm text-slate-600">
                Approving this payment will generate a new enrollment for the current month.
              </p>

              {approvePaymentTarget?.track_type === 'Premium' ? (
                <div className="rounded-xl border border-[#F18231]/20 bg-orange-50/50 p-5 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                    <CheckCircle2 className="h-5 w-5 text-[#F18231]" />
                  </div>
                  <h4 className="text-sm font-bold text-[#0F172A] mb-1">Premium Track (1-on-1)</h4>
                  <p className="text-[11px] font-medium text-slate-500 max-w-xs mx-auto">
                    No batch assignment is required for the Premium track since it includes 1-on-1 mentorship.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Target Classroom Batch
                  </label>
                  {isLoadingBatches ? (
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-mono mb-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Fetching batches...
                    </div>
                  ) : availableBatches.length > 0 ? (
                    <Select
                      value={selectedBatchId}
                      onValueChange={(val) => setSelectedBatchId(val || '')}
                    >
                      <SelectTrigger className="w-full h-10 border-slate-200 focus:border-[#F18231] focus:ring-[#F18231] mb-1 text-sm font-semibold text-[#0F172A] bg-white">
                        <SelectValue placeholder="Select a batch">
                          {availableBatches.find(b => b.content_items_id === selectedBatchId)?.title || "Select a batch"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {availableBatches.map(b => (
                          <SelectItem key={b.content_items_id} value={b.content_items_id}>
                            {b.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-red-500 font-semibold mb-1">No batches found for this level.</p>
                  )}
                  <p className="text-[10px] text-[#F18231] font-semibold mt-2">
                    Select the correct batch to generate the CPDP enrollment ID.
                  </p>
                </div>
              )}

              {approvePaymentTarget?.track_type !== 'Premium' && initialBatchId && selectedBatchId !== initialBatchId && (
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Reason for Changing Batch <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={batchChangeReason}
                    onChange={(e) => setBatchChangeReason(e.target.value)}
                    placeholder="Explain why the batch was changed (sent to student)"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#0F172A] placeholder-slate-400 focus:border-[#F18231] focus:outline-none focus:ring-1 focus:ring-[#F18231] transition-all resize-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setApprovePaymentTarget(null)}
                  disabled={isPending}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApproveConfirm}
                  disabled={
                    isPending || 
                    (approvePaymentTarget?.track_type !== 'Premium' && (
                      isLoadingBatches || 
                      !selectedBatchId || 
                      (initialBatchId ? selectedBatchId !== initialBatchId && !batchChangeReason.trim() : false)
                    ))
                  }
                  className="text-xs font-semibold bg-[#F18231] hover:bg-[#d96f21]"
                >
                  {isPending ? 'Approving...' : 'Confirm Approval'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Payment Dialog */}
      {rejectPaymentTarget && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 shrink-0">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">Reject Payment</h3>
                <p className="text-xs text-slate-500">Provide a reason for rejection.</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="rejectReason"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="rejectReason"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g., The transaction ID provided does not match our records."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] placeholder-slate-400 focus:border-[#F18231] focus:outline-none focus:ring-1 focus:ring-[#F18231] transition-all resize-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectPaymentTarget(null)
                    setRejectReason('')
                  }}
                  disabled={isPending}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRejectConfirm}
                  disabled={isPending || !rejectReason.trim()}
                  variant="destructive"
                  className="text-xs font-semibold"
                >
                  {isPending ? 'Rejecting...' : 'Confirm Rejection'}
                </Button>
              </div>
            </div>
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
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-[#F18231]">
                            {p.track_type} Track
                          </span>
                          {(p.batch_title || p.batch_id) && (
                            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                              Batch: {p.batch_title || p.batch_id?.slice(0, 8)}
                            </span>
                          )}
                        </div>
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
                            variant="outline"
                            onClick={() => handleApproveClick(p)}
                            disabled={actionTarget !== null}
                            className="h-7 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                          >
                            {isPending && actionTarget === p.payment_id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            )}
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setRejectPaymentTarget(p)
                              setRejectReason('')
                            }}
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

      {/* Generated PDAT IDs */}
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
                      'Status',
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
                  {processed.map((p) => (
                    <tr key={p.payment_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[#0F172A]">{p.user_name}</p>
                        <p className="text-slate-400">{p.user_email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[#0F172A] max-w-[150px] truncate">
                          {p.course_name}
                        </p>
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-[#F18231]">
                            {p.track_type} Track
                          </span>
                          {(p.batch_title || p.batch_id) && (
                            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                              Batch: {p.batch_title || p.batch_id?.slice(0, 8)}
                            </span>
                          )}
                        </div>
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
                        <div>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${p.status === 'Verified'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                              }`}
                          >
                            {p.status}
                          </span>
                          {p.status === 'Rejected' && p.rejected_reason && (
                            <p className="mt-1.5 text-[10px] text-red-600 max-w-[150px] leading-tight">
                              <span className="font-semibold">Reason:</span> {p.rejected_reason}
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
