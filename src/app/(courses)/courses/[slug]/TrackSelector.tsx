'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Course, TrackType } from '@/lib/types'
import { TRACK_OPTIONS } from '@/lib/mockData'
import { createClient } from '@/lib/supabase/client'
import { Check, ShieldCheck, ArrowRight } from 'lucide-react'

interface TrackSelectorProps {
  course: Course
}

export function TrackSelector({ course }: TrackSelectorProps) {
  const router = useRouter()
  const [selectedTrack, setSelectedTrack] = useState<TrackType>('Expert')
  const [selectedLevelIds, setSelectedLevelIds] = useState<string[]>(
    course.levels?.map((l) => l.level_id) || []
  )
  const [couponCode, setCouponCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)

  const calculatePricing = () => {
    const levels = course.levels || []
    let basePrice = 0

    if (selectedTrack === 'Expert') {
      basePrice = levels.reduce((sum, lvl) => sum + lvl.price, 0) * 0.85
    } else if (selectedTrack === 'Fast') {
      const selected = levels.filter((lvl) => selectedLevelIds.includes(lvl.level_id))
      basePrice = selected.reduce((sum, lvl) => sum + lvl.price, 0)
    } else if (selectedTrack === 'Progressive') {
      basePrice = levels.length > 0 ? levels[0].price : 150
    } else if (selectedTrack === 'Premium') {
      basePrice = levels.reduce((sum, lvl) => sum + lvl.price, 0) + 150
    }

    const discountAmount = basePrice * (discountPercent / 100)
    const finalPrice = Math.max(0, basePrice - discountAmount)

    return {
      basePrice: Math.round(basePrice),
      discountAmount: Math.round(discountAmount),
      finalPrice: Math.round(finalPrice),
    }
  }

  const toggleLevelSelection = (levelId: string) => {
    if (selectedLevelIds.includes(levelId)) {
      if (selectedLevelIds.length > 1) {
        setSelectedLevelIds(selectedLevelIds.filter((id) => id !== levelId))
      }
    } else {
      setSelectedLevelIds([...selectedLevelIds, levelId])
    }
  }

  const applyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'ITVATE10') {
      setDiscountPercent(10)
    } else if (couponCode.trim().toUpperCase() === 'CPDP20') {
      setDiscountPercent(20)
    } else {
      alert('Invalid Coupon Code. Try "ITVATE10" or "CPDP20"')
    }
  }

  const pricing = calculatePricing()

  const handleCheckoutRedirect = async () => {
    setIsCheckingAuth(true)

    const checkoutParams = new URLSearchParams({
      course_id: course.course_id,
      slug: course.slug,
      track: selectedTrack,
      amount: pricing.finalPrice.toString(),
      discount: pricing.discountAmount.toString(),
      levels: selectedLevelIds.join(','),
    })
    const checkoutUrl = `/checkout?${checkoutParams.toString()}`

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Not logged in — redirect to signup with return URL
        router.push(`/signup?redirect=${encodeURIComponent(checkoutUrl)}`)
        return
      }

      // Logged in — proceed to checkout
      router.push(checkoutUrl)
    } catch {
      // On error, just go to signup
      router.push(`/signup?redirect=${encodeURIComponent(checkoutUrl)}`)
    } finally {
      setIsCheckingAuth(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      {/* 4-Track System Selector */}
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Select Your Enrollment Track</h2>
          <p className="text-xs text-slate-600">
            Choose the pathway that matches your pace. Your border selection highlights in IT-vate Orange.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TRACK_OPTIONS.map((track) => {
            const isSelected = selectedTrack === track.id
            return (
              <div
                key={track.id}
                onClick={() => setSelectedTrack(track.id)}
                className={`relative flex flex-col justify-between rounded-xl border p-5 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#F18231] bg-orange-50/20 ring-2 ring-[#F18231]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-[#F18231]' : 'text-slate-500'
                      }`}
                    >
                      {track.name}
                    </span>
                    {track.badge && (
                      <span className="rounded-full bg-[#F18231] px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                        {track.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A]">{track.tagline}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{track.description}</p>
                </div>

                <div className="mt-4 flex items-center justify-end">
                  <div
                    className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-[#F18231] bg-[#F18231] text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Custom Level Selector for Fast Track */}
        {selectedTrack === 'Fast' && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">
              Fast Track: Pick Specific Levels to Unlock
            </h3>
            <div className="space-y-3">
              {course.levels?.map((lvl) => {
                const isChecked = selectedLevelIds.includes(lvl.level_id)
                return (
                  <div
                    key={lvl.level_id}
                    onClick={() => toggleLevelSelection(lvl.level_id)}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 cursor-pointer hover:border-slate-300"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="h-4 w-4 rounded border-slate-300 text-[#F18231] focus:ring-[#F18231]"
                      />
                      <span className="text-xs font-semibold text-[#0F172A]">{lvl.level_title}</span>
                    </div>
                    <span className="text-xs font-bold text-[#0F172A]">${lvl.price}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pricing & Checkout Card */}
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-[#0F172A] border-b border-slate-100 pb-3">
            Enrollment Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Selected Course:</span>
              <span className="font-semibold text-[#0F172A] text-right">{course.name}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Track Selected:</span>
              <span className="font-bold text-[#F18231]">{selectedTrack} Track</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Base Tuition:</span>
              <span className="font-semibold text-[#0F172A]">${pricing.basePrice}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Discount ({discountPercent}%):</span>
                <span>-${pricing.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-[#0F172A] border-t border-slate-100 pt-3">
              <span>Total Investment:</span>
              <span className="text-[#F18231]">${pricing.finalPrice}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Have a Coupon Code? (Try: ITVATE10)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono uppercase focus:border-[#F18231] focus:outline-none"
              />
              <button
                onClick={applyCoupon}
                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Apply
              </button>
            </div>
          </div>

          <button
            onClick={handleCheckoutRedirect}
            disabled={isCheckingAuth}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#F18231] py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#d96f21] transition-colors disabled:opacity-60"
          >
            {isCheckingAuth ? 'Checking...' : 'Continue to Payment'}
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            <span>Guaranteed CPDP Enrollment Verification</span>
          </div>
        </div>
      </div>
    </div>
  )
}
