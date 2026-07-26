'use client'

import { useState, useEffect } from 'react'
import { MOCK_PENDING_PAYMENTS } from '@/lib/mockData'
import { CheckCircle2, XCircle, Eye, ShieldCheck, Search, ExternalLink, RefreshCw, Cpu } from 'lucide-react'

export default function AdminVerificationPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null)
  const [generatedIds, setGeneratedIds] = useState<Record<string, string>>({})

  useEffect(() => {
    // Combine mock pending payments with any submitted in local storage session
    if (typeof window !== 'undefined') {
      const local = JSON.parse(localStorage.getItem('itvate_pending_payments') || '[]')
      setPayments([...local, ...MOCK_PENDING_PAYMENTS])
    } else {
      setPayments(MOCK_PENDING_PAYMENTS)
    }
  }, [])

  // Approve Logic & CPDP Sequential ID Generator
  const handleApprove = (paymentId: string, index: number) => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const seqNo = String(index + 1).padStart(3, '0')

    // Generate permanent ID: CPDP[YYYY][MM][Seq] e.g. CPDP202607001
    const cpdpId = `CPDP${year}${month}${seqNo}`

    setGeneratedIds((prev) => ({ ...prev, [paymentId]: cpdpId }))

    setPayments((prev) =>
      prev.map((p) => (p.payment_id === paymentId ? { ...p, status: 'Verified', enroll_no: cpdpId } : p))
    )
  }

  const handleReject = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.payment_id === paymentId ? { ...p, status: 'Rejected' } : p))
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#0F172A] px-2.5 py-1 text-xs font-bold text-white">ADMIN</span>
            <span className="text-xs font-semibold text-slate-500">IT-vate Verification Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] mt-1">Pending Payment Approvals & CPDP ID Generator</h1>
        </div>

        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              const local = JSON.parse(localStorage.getItem('itvate_pending_payments') || '[]')
              setPayments([...local, ...MOCK_PENDING_PAYMENTS])
            }
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
        >
          <RefreshCw className="h-3.5 w-3.5 text-[#F18231]" />
          Refresh Table
        </button>
      </div>

      {/* Pending Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#0F172A] text-white uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5">Program & Track</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Transaction Ref</th>
                <th className="px-6 py-3.5">Proof</th>
                <th className="px-6 py-3.5">Status / Enrollment ID</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {payments.map((item, idx) => (
                <tr key={item.payment_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-[#0F172A]">
                    {item.user_name}
                    <div className="text-[11px] font-normal text-slate-400">{item.user_email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[#0F172A]">{item.course_name}</div>
                    <span className="inline-block rounded bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-[#F18231] mt-1">
                      {item.track_type} Track
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#0F172A]">
                    ${item.total_amount || item.amount}
                  </td>
                  <td className="px-6 py-4 font-mono font-semibold text-slate-700">
                    {item.transaction_ref}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedProofUrl(item.payment_proof_url)}
                      className="inline-flex items-center gap-1 font-semibold text-[#F18231] hover:underline"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Proof
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {item.status === 'Verified' ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-800">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                        <div className="font-mono text-[11px] font-extrabold text-[#0F172A]">
                          {item.enroll_no || generatedIds[item.payment_id]}
                        </div>
                      </div>
                    ) : item.status === 'Rejected' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-800">
                        <XCircle className="h-3 w-3" /> Rejected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                        Pending Verification
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.status === 'Pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(item.payment_id, idx)}
                          className="rounded bg-green-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(item.payment_id)}
                          className="rounded bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-300"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Proof Modal */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0F172A]">Payment Proof Receipt</h3>
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100 max-h-96 flex items-center justify-center">
              <img src={selectedProofUrl} alt="Payment Proof Receipt" className="object-contain max-h-96" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
