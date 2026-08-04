'use client'

import { useState, useTransition, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { submitPayment } from '@/lib/actions/payment'
import { createClient } from '@/lib/supabase/client'
import { validateTrackSelection } from '@/lib/validations'
import { MOCK_COURSES } from '@/lib/mockData'
import {
  Building2,
  Upload,
  CheckCircle2,
  ArrowRight,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fileSelected, setFileSelected] = useState<string | null>(null)
  const [fileObj, setFileObj] = useState<File | null>(null)
  const [isAuthChecking, setIsAuthChecking] = useState(true)

  const slug = searchParams.get('slug') || ''
  const track = searchParams.get('track') || 'Expert'
  const amount = searchParams.get('amount') || '0'
  const discount = searchParams.get('discount') || '0'
  const levelIds = searchParams.get('levels') || ''
  const courseId = searchParams.get('course_id') || ''
  const couponId = searchParams.get('coupon_id') || ''

  const course = MOCK_COURSES.find((c) => c.slug === slug) || MOCK_COURSES[0]
  // Pick the first level id for enrollment (or the selected levels for Fast Track)
  const primaryLevelId = levelIds.split(',')[0] || course.levels?.[0]?.level_id || ''

  // Auth check & Duplicate check — redirect to login if no session, or back to course if duplicate
  useEffect(() => {
    const checkAuthAndDuplicates = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsAuthChecking(false)
        const currentUrl = `/checkout?${searchParams.toString()}`
        router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`)
        return
      }

      // Check for mutual exclusivity & duplicates
      if (levelIds && courseId) {
        const requestedLevelIds = levelIds.split(',')
        const { data: existingEnrollments } = await supabase
          .from('enrollments')
          .select('level_id, track_type, status, levels!inner(course_id, level_title)')
          .eq('user_id', user.id)
          .eq('levels.course_id', courseId)
          .neq('status', 'Rejected')

        const validation = validateTrackSelection(
          (existingEnrollments as any) || [], 
          track as any, 
          requestedLevelIds,
          course.levels || []
        )
        
        if (!validation.isValid) {
          const encodedErrorMsg = encodeURIComponent(validation.errorMessage || 'Invalid track selection.')
          router.push(`/courses/${slug}?error=duplicate&error_msg=${encodedErrorMsg}`)
          return
        }
      }

      setIsAuthChecking(false)
    }

    checkAuthAndDuplicates()
  }, [router, searchParams, levelIds, slug, courseId, track, course.levels])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileSelected(file.name)
      setFileObj(file)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)

    const fd = new FormData(e.currentTarget)
    // Append derived values not in form fields
    fd.append('level_id', primaryLevelId)
    fd.append('track_type', track)
    fd.append('levels', levelIds)
    
    // total discount = initial discount + (new coupon discount if applied)
    const currentDiscount = displayDiscount
    const finalAmount = Math.max(0, Number(amount) - currentDiscount)
    
    fd.append('amount', String(Number(amount) + currentDiscount))
    fd.append('discount', String(currentDiscount))
    fd.append('total_amount', String(finalAmount))
    
    if (finalCouponId) fd.append('coupon_id', finalCouponId)
    if (fileObj) fd.set('payment_proof', fileObj)

    startTransition(async () => {
      const result = await submitPayment(fd)
      if (result?.error) toast.error(result.error)
    })
  }

  const [promoCode, setPromoCode] = useState('')
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const [activeCouponState, setActiveCouponState] = useState<{id: string, code: string, discountAmount: number} | null | undefined>(undefined)

  const displayDiscount = activeCouponState === undefined ? Number(discount) : (activeCouponState ? activeCouponState.discountAmount : 0)
  const finalCouponId = activeCouponState === undefined ? couponId : (activeCouponState ? activeCouponState.id : '')
  const displayCode = activeCouponState?.code || ''
  const displayPercentage = Math.round((displayDiscount / Number(amount)) * 100) || 0
  const finalTotalDue = Math.max(0, Number(amount) - displayDiscount)

  const handleApplyPromo = async () => {
    if (!promoCode) return
    setIsApplyingPromo(true)
    try {
      const { validateCoupon } = await import('@/lib/actions/coupons')
      const res = await validateCoupon(promoCode, courseId, track)
      if (res.error) {
        toast.error(res.error)
        setActiveCouponState(null)
      } else if (res.success && res.coupon_id && res.discount_percentage) {
        toast.success(`Coupon applied! ${res.discount_percentage}% OFF`)
        setActiveCouponState({
          id: res.coupon_id,
          code: promoCode.toUpperCase(),
          discountAmount: Math.round(Number(amount) * (res.discount_percentage / 100))
        })
        setPromoCode('')
      }
    } catch (err: any) {
      toast.error('Failed to validate coupon')
    }
    setIsApplyingPromo(false)
  }

  const handleRemovePromo = () => {
    setActiveCouponState(null)
    setPromoCode('')
    toast.success('Coupon removed')
  }

  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center p-24 text-xs text-slate-500">
        <Clock className="mr-2 h-4 w-4 animate-spin" />
        Verifying session...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8 space-y-10">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">
          Enrollment Checkout
        </span>
        <h1 className="text-3xl font-extrabold text-[#0F172A]">
          Payment &amp; Bank Transfer Details
        </h1>
        <p className="mt-1 text-xs text-slate-600">
          Transfer tuition to the IT-vate Solutions corporate account and upload your
          payment receipt to complete enrollment.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left: Order Summary + Bank Details */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A]">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Program:</span>
                <span className="font-bold text-[#0F172A] text-right">{course.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Track:</span>
                <span className="font-bold text-[#F18231]">{track} Track</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span>PKR {Number(amount).toLocaleString()}</span>
              </div>
              {displayDiscount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount Applied {displayCode ? `(${displayCode})` : ''} {displayPercentage > 0 && `— ${displayPercentage}%`}:</span>
                  <span>-PKR {displayDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-[#0F172A] border-t border-slate-100 pt-3">
                <span>Total Due:</span>
                <span className="text-[#F18231]">PKR {finalTotalDue.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Promo Code section */}
          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A]">
                Promo Code
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {displayDiscount > 0 ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase">
                      {displayCode || 'COUPON APPLIED'} {displayPercentage > 0 && `(${displayPercentage}%)`}
                    </span>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRemovePromo}
                    className="h-7 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter code" 
                    value={promoCode} 
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="font-mono uppercase text-xs"
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleApplyPromo}
                    disabled={isApplyingPromo || !promoCode.trim()}
                    className="text-xs shrink-0"
                  >
                    {isApplyingPromo ? 'Applying...' : 'Apply'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-6 space-y-3">
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
            </CardContent>
          </Card>
        </div>

        {/* Right: Payment Proof Upload Form */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A]">
              Submit Payment Proof
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Transaction Reference */}
              <div className="space-y-1.5">
                <Label htmlFor="transaction_reference">
                  Transaction Reference / Deposit ID <span className="text-[#F18231]">*</span>
                </Label>
                <Input
                  id="transaction_reference"
                  name="transaction_reference"
                  type="text"
                  required
                  placeholder="e.g. TRX-99882211"
                  className="font-mono uppercase"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-1.5">
                <Label>
                  Payment Screenshot <span className="text-[#F18231]">*</span>
                </Label>
                <label
                  htmlFor="payment_proof_input"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-6 text-center hover:border-[#F18231] transition-colors cursor-pointer"
                >
                  {fileSelected ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      {fileSelected}
                    </span>
                  ) : (
                    <>
                      <Upload className="h-7 w-7 text-slate-400 mb-2" />
                      <p className="text-xs text-slate-500">
                        Click to upload payment screenshot (JPG/PNG)
                      </p>
                    </>
                  )}
                  <input
                    id="payment_proof_input"
                    name="payment_proof"
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#F18231] hover:bg-[#d96f21] text-white py-6"
              >
                {isPending ? 'Submitting...' : 'Submit Payment Verification'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-500">
          Loading Checkout...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
