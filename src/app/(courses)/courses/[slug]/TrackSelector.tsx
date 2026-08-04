'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Course, TrackType } from '@/lib/types'
import { TRACK_OPTIONS, MOCK_COURSES } from '@/lib/mockData'
import { createClient } from '@/lib/supabase/client'
import { Check, ShieldCheck, ArrowRight, Lock, ChevronDown, X, Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { validateTrackSelection } from '@/lib/validations'

interface TrackSelectorProps {
  course: Course
}

export function TrackSelector({ course: initialCourse }: TrackSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // --- State ---
  const [activeCourse, setActiveCourse] = useState<Course>(initialCourse)
  const [selectedTrack, setSelectedTrack] = useState<TrackType>('Expert')
  const [selectedLevelIds, setSelectedLevelIds] = useState<string[]>(
    initialCourse.levels?.map((l) => l.level_id) || []
  )
  const [couponCode, setCouponCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Reset level selection when course changes
  useEffect(() => {
    setSelectedLevelIds(activeCourse.levels?.map((l) => l.level_id) || [])
    setDiscountPercent(0)
    setCouponCode('')
  }, [activeCourse])

  // Close modal on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowCourseModal(false)
      }
    }
    if (showCourseModal) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showCourseModal])

  // --- Duplicate Error Handling (from checkout redirect) ---
  useEffect(() => {
    const errorParam = searchParams.get('error')
    const errorMsg = searchParams.get('error_msg')
    const duplicateLevels = searchParams.get('duplicate_levels')

    if (errorParam === 'duplicate') {
      if (errorMsg) {
        const decodedMsg = decodeURIComponent(errorMsg)
        setValidationError(decodedMsg)
        toast.error(decodedMsg, { duration: 6000 })
      } else {
        let levelNames = ''
        if (duplicateLevels) {
          const dupIds = duplicateLevels.split(',')
          const names = initialCourse.levels
            ?.filter((l) => dupIds.includes(l.level_id))
            .map((l) => l.level_title)
          if (names && names.length > 0) {
            levelNames = names.join(', ')
          }
        }
        const fallbackMsg = `You have already enrolled in: ${levelNames || 'one or more selected levels'}. Please choose different levels.`
        setValidationError(fallbackMsg)
        toast.error(fallbackMsg, { duration: 6000 })
      }
      
      // Clean up the URL
      const currentUrl = new URL(window.location.href)
      currentUrl.searchParams.delete('error')
      currentUrl.searchParams.delete('error_msg')
      currentUrl.searchParams.delete('duplicate_levels')
      window.history.replaceState({}, '', currentUrl.toString())
    }
  }, [searchParams, initialCourse])

  // --- Pricing ---
  const calculatePricing = () => {
    // Sort levels by level number (no) to ensure level 1 is first
    const levels = [...(activeCourse.levels || [])].sort((a, b) => a.no - b.no)
    let basePrice = 0

    if (selectedTrack === 'Expert') {
      basePrice = levels.reduce((sum, lvl) => sum + lvl.price, 0) * 0.85
    } else if (selectedTrack === 'Fast') {
      const selected = levels.filter((lvl) => selectedLevelIds.includes(lvl.level_id))
      basePrice = selected.reduce((sum, lvl) => sum + lvl.price, 0)
    } else if (selectedTrack === 'Progressive') {
      basePrice = levels.length > 0 ? levels[0].price : 15000
    } else if (selectedTrack === 'Premium') {
      basePrice = levels.reduce((sum, lvl) => sum + lvl.price, 0) + 25000
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
      toast.success('Coupon applied successfully! 10% discount.')
    } else if (couponCode.trim().toUpperCase() === 'CPDP20') {
      setDiscountPercent(20)
      toast.success('Coupon applied successfully! 20% discount.')
    } else {
      toast.error('Invalid Coupon Code. Try "ITVATE10" or "CPDP20"')
    }
  }

  const pricing = calculatePricing()

  const handleCheckoutRedirect = async () => {
    setValidationError(null)
    setIsCheckingAuth(true)

    const sortedLevels = [...(activeCourse.levels || [])].sort((a, b) => a.no - b.no)
    let finalLevelIds = selectedLevelIds
    if (selectedTrack === 'Progressive' && sortedLevels.length > 0) {
      finalLevelIds = [sortedLevels[0].level_id]
    } else if (selectedTrack === 'Expert' || selectedTrack === 'Premium') {
      finalLevelIds = sortedLevels.map((l) => l.level_id)
    }

    const checkoutParams = new URLSearchParams({
      course_id: activeCourse.course_id,
      slug: activeCourse.slug,
      track: selectedTrack,
      amount: pricing.finalPrice.toString(),
      discount: pricing.discountAmount.toString(),
      levels: finalLevelIds.join(','),
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

      // --- Pre-Checkout Validation (Mutual Exclusivity, Duplicates & Fast Track Consecutive) ---
      // Fetch all enrollments for this specific course by joining with levels
      const { data: existingEnrollments, error } = await supabase
        .from('enrollments')
        .select('level_id, track_type, status, levels!inner(course_id, level_title)')
        .eq('user_id', user.id)
        .eq('levels.course_id', activeCourse.course_id)
        .neq('status', 'Rejected') // Allow re-enrolling if previously rejected
        
      if (error) console.error("Supabase Error:", error)

      const validation = validateTrackSelection(
        (existingEnrollments as any) || [], 
        selectedTrack, 
        finalLevelIds, 
        activeCourse.levels || []
      )
      
      if (!validation.isValid) {
        const errMsg = validation.errorMessage || 'Invalid track selection.'
        setValidationError(errMsg)
        toast.error(errMsg, { duration: 6000 })
        setIsCheckingAuth(false)
        return
      }

      // Logged in & validation passed — proceed to checkout
      router.push(checkoutUrl)
    } catch {
      // On error, just go to signup
      router.push(`/signup?redirect=${encodeURIComponent(checkoutUrl)}`)
    } finally {
      // setIsCheckingAuth(false) will be handled by the next page or if we error out
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

      {/* ── 3. Enrollment Track Selection (col-span-8, 2×2 grid) ── */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Premium Error Banner */}
        {validationError && (
          <div className="animate-in fade-in slide-in-from-top-4 flex items-start gap-4 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-5 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-sm font-bold text-red-900">Track Selection Blocked</h3>
              <p className="text-xs font-medium text-red-700 leading-relaxed">
                {validationError}
              </p>
            </div>
            <button
              onClick={() => setValidationError(null)}
              className="rounded-lg p-1.5 text-red-400 hover:bg-red-100/50 hover:text-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">
            Custom Enrollment
          </span>
          <h2 className="text-xl font-bold text-[#0F172A]">Select Your Enrollment Track</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Choose the pathway that matches your pace. Your selection dictates level access and mentorship.
          </p>
        </div>

        {/* 2×2 Grid of Track Selection Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TRACK_OPTIONS.map((track) => {
            const isSelected = selectedTrack === track.id
            return (
              <div
                key={track.id}
                onClick={() => setSelectedTrack(track.id)}
                className={`relative flex flex-col justify-between rounded-xl p-5 cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-2 border-[#F18231] ring-2 ring-[#F18231]/20 bg-[#F18231]/5'
                    : 'border border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isSelected ? 'text-[#F18231]' : 'text-slate-700'}`}>
                      {track.name}
                    </span>
                    {track.badge && (
                      <span className="rounded-full bg-[#F18231] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                        {track.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A]">{track.tagline}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{track.description}</p>
                </div>

                {/* Bottom-right filled orange checkmark when selected */}
                <div className="mt-4 flex items-center justify-end">
                  <div
                    className={`h-5 w-5 rounded-full flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#F18231] text-white'
                        : 'border border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Fast Track: Dynamic level checkboxes */}
        {selectedTrack === 'Fast' && (
          <div className="rounded-xl border border-[#F18231]/30 bg-orange-50/30 p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">
              Fast Track: Pick Specific Levels to Unlock
            </h3>
            <div className="space-y-2.5">
              {activeCourse.levels?.map((lvl) => {
                const isChecked = selectedLevelIds.includes(lvl.level_id)
                return (
                  <div
                    key={lvl.level_id}
                    onClick={() => toggleLevelSelection(lvl.level_id)}
                    className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${
                      isChecked
                        ? 'border-[#F18231]/50 bg-white'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-4 w-4 rounded items-center justify-center border transition-colors ${
                          isChecked ? 'bg-[#F18231] border-[#F18231]' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
                      </div>
                      <span className="text-xs font-semibold text-[#0F172A]">{lvl.level_title}</span>
                    </div>
                    <span className="text-xs font-bold text-[#0F172A] shrink-0 ml-2">
                      PKR {lvl.price.toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── 4. Sticky Enrollment Summary Sidebar (col-span-4) ── */}
      <div className="lg:col-span-4">
        <div className="sticky top-6 h-fit self-start rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-[#0F172A] border-b border-slate-100 pb-3">
            Enrollment Summary
          </h3>

          {/* Summary Details */}
          <div className="space-y-3 text-xs">
            {/* Course with Change link */}
            <div className="flex justify-between items-start gap-2">
              <span className="text-slate-500 shrink-0">Course:</span>
              <div className="flex flex-col items-end gap-1 text-right">
                <span className="font-bold text-[#0F172A] leading-snug">{activeCourse.name}</span>
                <button
                  onClick={() => setShowCourseModal(true)}
                  className="inline-flex items-center gap-1 text-[#F18231] font-semibold hover:text-[#d96f21] transition-colors"
                >
                  Change Course
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="flex justify-between text-slate-500">
              <span>Track:</span>
              <span className="font-bold text-[#F18231]">{selectedTrack} Track</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Base Tuition:</span>
              <span className="font-semibold text-[#0F172A]">PKR {pricing.basePrice.toLocaleString()}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount ({discountPercent}%):</span>
                <span>-PKR {pricing.discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-[#0F172A] border-t border-slate-100 pt-3">
              <span>Total Investment:</span>
              <span className="text-[#F18231]">PKR {pricing.finalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Coupon Code Area */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Coupon Code (Try: ITVATE10)
            </label>
            <div className="flex gap-2 w-full">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="ENTER CODE"
                className="flex-1 min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono uppercase focus:border-[#F18231] focus:outline-none"
              />
              <button
                onClick={applyCoupon}
                className="shrink-0 rounded-lg bg-[#0b1120] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1e293b] transition-colors"
              >
                Apply
              </button>
            </div>
          </div>

          {/* CTA Button - Full Width, No Scale */}
          <button
            onClick={handleCheckoutRedirect}
            disabled={isCheckingAuth}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#F18231] py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#d96f21] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isCheckingAuth ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                Continue to Payment
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1 border-t border-slate-100">
            <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>256-Bit Encrypted &amp; Secure Checkout</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0" />
            <span>Guaranteed CPDP Enrollment Verification</span>
          </div>
        </div>
      </div>

      {/* ── Course Change Modal ── */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#0b1120] px-5 py-4">
              <div>
                <h4 className="text-sm font-bold text-white">Switch Course</h4>
                <p className="text-xs text-slate-400 mt-0.5">Select a different course to enroll in</p>
              </div>
              <button
                onClick={() => setShowCourseModal(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Course List */}
            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {MOCK_COURSES.filter((c) => c.is_active).map((c) => {
                const isActive = c.course_id === activeCourse.course_id
                return (
                  <button
                    key={c.course_id}
                    onClick={() => {
                      setActiveCourse(c)
                      setSelectedTrack('Expert')
                      setShowCourseModal(false)
                    }}
                    className={`w-full text-left rounded-xl border p-4 transition-colors ${
                      isActive
                        ? 'border-[#F18231] bg-orange-50/40 ring-2 ring-[#F18231]/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#F18231]">
                          {c.category}
                        </span>
                        <p className="text-sm font-bold text-[#0F172A] leading-snug">{c.name}</p>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{c.description}</p>
                        <p className="text-[11px] font-semibold text-slate-400 mt-1">
                          {c.levels?.length ?? 0} Levels
                        </p>
                      </div>
                      {isActive && (
                        <div className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#F18231] text-white">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
