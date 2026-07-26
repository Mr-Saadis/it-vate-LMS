'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MOCK_COURSES } from '@/lib/mockData'
import { Building2, Upload, CheckCircle2, ArrowRight } from 'lucide-react'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const slug = searchParams.get('slug') || 'embedded-systems-firmware'
  const track = searchParams.get('track') || 'Expert'
  const amount = searchParams.get('amount') || '540'
  const discount = searchParams.get('discount') || '60'

  const course = MOCK_COURSES.find((c) => c.slug === slug) || MOCK_COURSES[0]

  const [transactionRef, setTransactionRef] = useState('')
  const [fileSelected, setFileSelected] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('itvate_session_user')
      if (!session) {
        const currentUrl = `/checkout?${searchParams.toString()}`
        router.push(`/signup?redirect=${encodeURIComponent(currentUrl)}`)
      }
    }
  }, [router, searchParams])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileSelected(file.name)
    }
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const newPayment = {
      payment_id: 'pay-' + Date.now(),
      enroll_id: 'enr-' + Date.now(),
      user_name: 'Saad Ali (Student)',
      user_email: 'saad@example.com',
      course_name: course.name,
      track_type: track,
      amount: Number(amount) + Number(discount),
      discount: Number(discount),
      total_amount: Number(amount),
      status: 'Pending',
      transaction_ref: transactionRef || 'TRX-' + Math.floor(100000 + Math.random() * 900000),
      payment_proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
    }

    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('itvate_pending_payments') || '[]')
      localStorage.setItem('itvate_pending_payments', JSON.stringify([newPayment, ...existing]))
    }

    setTimeout(() => {
      setIsSubmitting(false)
      router.push('/checkout/pending')
    }, 1000)
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8 space-y-10">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">Enrollment Checkout</span>
        <h1 className="text-3xl font-extrabold text-[#0F172A]">Payment & Bank Transfer Details</h1>
        <p className="text-xs text-slate-600">
          Transfer tuition to IT-vate Solutions corporate bank account and upload your payment transaction receipt.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Order Summary & Bank Details */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#0F172A] border-b border-slate-100 pb-3 uppercase tracking-wider text-[11px]">
              Order Summary
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Program:</span>
                <span className="font-bold text-[#0F172A]">{course.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Selected Track:</span>
                <span className="font-bold text-[#F18231]">{track} Track</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span>${Number(amount) + Number(discount)}</span>
              </div>
              {Number(discount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Track Discount:</span>
                  <span>-${discount}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-[#0F172A] border-t border-slate-100 pt-3">
                <span>Total Due:</span>
                <span className="text-[#F18231]">${amount}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
              <Building2 className="h-4 w-4 text-[#F18231]" />
              IT-vate Solutions Corporate Account
            </div>
            <div className="space-y-1.5 text-xs text-slate-700 font-mono">
              <p><span className="text-slate-400 font-sans">Bank:</span> Habib Bank Limited (HBL)</p>
              <p><span className="text-slate-400 font-sans">Title:</span> IT-vate Solutions (Pvt) Ltd</p>
              <p><span className="text-slate-400 font-sans">Account No:</span> 0123-9988776655</p>
              <p><span className="text-slate-400 font-sans">IBAN:</span> PK36HABB0001239988776655</p>
            </div>
          </div>
        </div>

        {/* Transaction Reference & Proof Upload */}
        <form onSubmit={handlePaymentSubmit} className="rounded-xl border border-slate-200 bg-white p-6 space-y-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] border-b border-slate-100 pb-3 uppercase tracking-wider text-[11px]">
            Submit Payment Proof
          </h3>

          <div>
            <label className="text-xs font-semibold text-[#0F172A]">
              Transaction Reference / Deposit ID *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. TRX-99882211"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono uppercase focus:border-[#F18231] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#0F172A]">
              Payment Proof Screenshot (Supabase Storage) *
            </label>
            <div className="mt-1 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-6 text-center hover:border-slate-300 transition-colors">
              <Upload className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-xs text-slate-600">
                {fileSelected ? (
                  <span className="font-semibold text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> {fileSelected}
                  </span>
                ) : (
                  'Click to upload payment screenshot (JPG/PNG)'
                )}
              </p>
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleFileUpload}
                className="mt-2 text-xs text-slate-500 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#F18231] py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#d96f21] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Payment Verification'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading Checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
