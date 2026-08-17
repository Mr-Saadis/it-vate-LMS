'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Course, TrackType } from '@/lib/types'
import { TRACK_OPTIONS } from '@/lib/mockData'
import { createClient } from '@/lib/supabase/client'
import { Check, CheckCircle2, ShieldCheck, ArrowRight, Lock, ChevronDown, X, Loader2, AlertTriangle, Calendar, Info } from 'lucide-react'
import { toast } from 'sonner'
import { validateTrackSelection } from '@/lib/validations'
import { validateCoupon } from '@/lib/actions/coupons'
import { BatchSelectionDialog, BatchInfo } from './BatchSelectionDialog'
import { format, parseISO } from 'date-fns'

interface TrackSelectorProps {
  course: Course
  allCourses?: Course[]
  ownedLevelIds?: string[]
  initialHighestCompletedNo?: number
}

export function TrackSelector({ course: initialCourse, allCourses = [], ownedLevelIds = [], initialHighestCompletedNo = 0 }: TrackSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // --- State ---
  const [activeCourse, setActiveCourse] = useState<Course>(initialCourse)
  // No default track — user must explicitly choose
  const [selectedTrack, setSelectedTrack] = useState<TrackType | null>(null)
  const [selectedLevelIds, setSelectedLevelIds] = useState<string[]>([])
  const [couponCode, setCouponCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [appliedCouponId, setAppliedCouponId] = useState<string | null>(null)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Batch dialog state
  const [batchDialogOpen, setBatchDialogOpen] = useState(false)
  const [pendingTrack, setPendingTrack] = useState<TrackType | null>(null)
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [selectedBatchTitle, setSelectedBatchTitle] = useState<string | null>(null)
  const [selectedBatchDates, setSelectedBatchDates] = useState<string | null>(null)
  // True once user has confirmed the dialog (even with no batch) — allows canProceed
  const [batchConfirmed, setBatchConfirmed] = useState(false)
  // Batches available for the dialog's target level
  const [dialogBatches, setDialogBatches] = useState<BatchInfo[]>([])
  const [dialogLevelTitle, setDialogLevelTitle] = useState('')
  const [dialogLevelNo, setDialogLevelNo] = useState(1)
  // Temp batch selection inside the dialog (not committed until Confirm)
  const [tempBatchId, setTempBatchId] = useState<string | null>(null)

  // Dynamic owned levels state (starts with prop, updates via client fetch)
  const [clientOwnedLevelIds, setClientOwnedLevelIds] = useState<string[]>(ownedLevelIds)
  const [clientHighestCompletedNo, setClientHighestCompletedNo] = useState<number>(initialHighestCompletedNo)

  // Fetch owned levels on client side as a fallback/sync
  useEffect(() => {
    async function fetchClientEnrollments() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const courseLevelIds = (initialCourse.levels || []).map(l => l.level_id)
        if (courseLevelIds.length === 0) return

        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('level_id, status, is_completed')
          .eq('user_id', user.id)
          .in('level_id', courseLevelIds)
          .neq('status', 'Rejected')

        if (enrollments) {
          setClientOwnedLevelIds(enrollments.map(e => e.level_id))
          
          let highest = 0
          for (const enrollment of enrollments) {
            const isCompleted = enrollment.status === 'Completed' || enrollment.is_completed === true
            if (isCompleted) {
              const l = (initialCourse.levels || []).find(lvl => lvl.level_id === enrollment.level_id)
              if (l && l.no > highest) {
                highest = l.no
              }
            }
          }
          setClientHighestCompletedNo(highest)
        }
      } catch (err) {
        console.error("Failed to sync client enrollments:", err)
      }
    }
    fetchClientEnrollments()
  }, [initialCourse])

  // Reset level & batch selection when course changes
  useEffect(() => {
    setSelectedLevelIds([])
    setDiscountPercent(0)
    setCouponCode('')
    setAppliedCouponId(null)
    setSelectedTrack(null)
    setSelectedBatchId(null)
    setSelectedBatchTitle(null)
    setSelectedBatchDates(null)
    setBatchConfirmed(false)
  }, [activeCourse])

  // Close course modal on outside click
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

  // Duplicate error handling (from checkout redirect)
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
      const currentUrl = new URL(window.location.href)
      currentUrl.searchParams.delete('error')
      currentUrl.searchParams.delete('error_msg')
      currentUrl.searchParams.delete('duplicate_levels')
      window.history.replaceState({}, '', currentUrl.toString())
    }
  }, [searchParams, initialCourse])

  // --- Helper: Get batches (link-type content_items with dates) for a given level ---
  function getBatchesForLevel(levelId: string): BatchInfo[] {
    const level = activeCourse.levels?.find(l => l.level_id === levelId)
    if (!level?.content_items) return []
    return level.content_items
      .filter(item => item.start_date && item.end_date)
      .map(item => ({
        content_items_id: item.content_items_id,
        title: item.title,
        start_date: item.start_date!,
        end_date: item.end_date!,
      }))
  }

  // --- Open batch dialog (used for Expert/Progressive/Premium card click, and Fast's "Select Batch" button) ---
  function openBatchDialog(trackId: TrackType) {
    const sortedLevels = [...(activeCourse.levels || [])].sort((a, b) => a.no - b.no)

    // Determine which level's batches to show
    let targetLevel = sortedLevels[0] // default: Level 1
    
    // Check if a specific level was requested via URL params (from dashboard "Buy More Levels" specific level click)
    const urlLevelId = searchParams.get('level')
    if (urlLevelId && trackId === 'Progressive') {
      const urlLevel = sortedLevels.find(l => l.level_id === urlLevelId)
      if (urlLevel) {
        targetLevel = urlLevel
      }
    } else if (trackId === 'Progressive') {
      // Find the exact next unlockable level based on completion
      const targetNo = clientHighestCompletedNo + 1
      const nextLvl = sortedLevels.find(l => l.no === targetNo)

      if (!nextLvl) {
        toast.info("You already own all levels for this course.", { duration: 4000 })
        return
      }

      // If they already own this next level (e.g. it's Active or Pending), they cannot proceed
      if (clientOwnedLevelIds.includes(nextLvl.level_id)) {
        toast.error("You must complete your current active level before purchasing the next one.", { duration: 4000 })
        return
      }
      
      targetLevel = nextLvl
    } else if (trackId === 'Fast' && selectedLevelIds.length > 0) {
      // Show batches for the lowest selected level
      const lowestSelected = sortedLevels.find(l => selectedLevelIds.includes(l.level_id))
      if (lowestSelected) targetLevel = lowestSelected
    }

    if (!targetLevel) return

    const batches = getBatchesForLevel(targetLevel.level_id)
    setDialogBatches(batches)
    setDialogLevelTitle(targetLevel.level_title)
    setDialogLevelNo(targetLevel.no)
    setPendingTrack(trackId)
    setTempBatchId(null)
    setBatchDialogOpen(true)
  }

  // --- Track card click handler ---
  function handleTrackCardClick(trackId: TrackType) {
    if (trackId === 'Fast') {
      // Fast track: just select the track — levels panel appears, user picks levels first
      // Reset batch state since track changed
      setSelectedTrack('Fast')
      setSelectedLevelIds([])
      setSelectedBatchId(null)
      setSelectedBatchTitle(null)
      setSelectedBatchDates(null)
      setBatchConfirmed(false)
      return
    }
    // All other tracks: open batch dialog immediately
    openBatchDialog(trackId)
  }

  // --- When dialog is confirmed ---
  function handleBatchConfirm(batchId: string | null, batchTitle: string | null) {
    if (!pendingTrack) return

    // Commit track selection
    setSelectedTrack(pendingTrack)

    // Set default level selection based on track
    const sortedLevels = [...(activeCourse.levels || [])].sort((a, b) => a.no - b.no)
    if (pendingTrack === 'Expert' || pendingTrack === 'Premium') {
      setSelectedLevelIds(sortedLevels.map(l => l.level_id))
    } else if (pendingTrack === 'Progressive') {
      const urlLevelId = searchParams.get('level')
      if (urlLevelId) {
        const urlLevel = sortedLevels.find(l => l.level_id === urlLevelId)
        setSelectedLevelIds(urlLevel ? [urlLevel.level_id] : (sortedLevels.length > 0 ? [sortedLevels[0].level_id] : []))
      } else {
        const targetNo = clientHighestCompletedNo + 1
        const nextLvl = sortedLevels.find(l => l.no === targetNo)
        if (nextLvl && !clientOwnedLevelIds.includes(nextLvl.level_id)) {
          setSelectedLevelIds([nextLvl.level_id])
        } else if (sortedLevels.length > 0) {
          setSelectedLevelIds([sortedLevels[sortedLevels.length - 1].level_id])
        } else {
          setSelectedLevelIds([])
        }
      }
    }
    // Fast: keep existing selectedLevelIds (user already chose)

    // Store batch info
    setSelectedBatchId(batchId)
    setSelectedBatchTitle(batchTitle)
    // Mark dialog as confirmed — allows canProceed even when batchId is null (no batches case)
    setBatchConfirmed(true)

    // Build date string for display
    if (batchId) {
      const batch = dialogBatches.find(b => b.content_items_id === batchId)
      if (batch) {
        try {
          const s = parseISO(batch.start_date)
          const e = parseISO(batch.end_date)
          const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()
          setSelectedBatchDates(sameMonth
            ? `${format(s, 'MMM d')} – ${format(e, 'd')}`
            : `${format(s, 'MMM d')} – ${format(e, 'MMM d')}`
          )
        } catch {
          setSelectedBatchDates(null)
        }
      }
    } else {
      setSelectedBatchDates(null)
    }

    setBatchDialogOpen(false)
    setPendingTrack(null)
  }

  // --- Pricing ---
  const calculatePricing = () => {
    const levels = [...(activeCourse.levels || [])].sort((a, b) => a.no - b.no)
    let basePrice = 0

    if (selectedTrack === 'Expert') {
      basePrice = levels.reduce((sum, lvl) => sum + lvl.price, 0) * 0.85
    } else if (selectedTrack === 'Fast') {
      const selected = levels.filter((lvl) => selectedLevelIds.includes(lvl.level_id))
      basePrice = selected.reduce((sum, lvl) => sum + lvl.price, 0)
    } else if (selectedTrack === 'Progressive') {
      const selectedLevel = levels.find((lvl) => selectedLevelIds.includes(lvl.level_id))
      basePrice = selectedLevel ? selectedLevel.price : (levels.length > 0 ? levels[0].price : 15000)
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
        // Reset batch since level selection changed
        setSelectedBatchId(null)
        setSelectedBatchTitle(null)
        setSelectedBatchDates(null)
        setBatchConfirmed(false)
      }
    } else {
      setSelectedLevelIds([...selectedLevelIds, levelId])
      // Reset batch since level selection changed
      setSelectedBatchId(null)
      setSelectedBatchTitle(null)
      setSelectedBatchDates(null)
      setBatchConfirmed(false)
    }
  }

  const applyCoupon = async () => {
    if (!couponCode.trim() || !selectedTrack) {
      setDiscountPercent(0)
      setAppliedCouponId(null)
      return
    }

    setIsApplyingCoupon(true)
    const res = await validateCoupon(couponCode, activeCourse.course_id, selectedTrack)
    setIsApplyingCoupon(false)

    if (res.error) {
      toast.error(res.error)
      setDiscountPercent(0)
      setAppliedCouponId(null)
    } else if (res.success && res.discount_percentage && res.coupon_id) {
      setDiscountPercent(res.discount_percentage)
      setAppliedCouponId(res.coupon_id)
      toast.success(`Coupon applied successfully! ${res.discount_percentage}% discount.`)
    }
  }

  const pricing = selectedTrack ? calculatePricing() : { basePrice: 0, discountAmount: 0, finalPrice: 0 }

  // canProceed: track selected + user has gone through batch dialog (batchConfirmed)
  // batchConfirmed is true even when user clicks "Continue Without Batch" (no batches available)
  // Fast track additionally needs at least 1 level selected before batch step
  const canProceed = !!selectedTrack && (
    selectedTrack === 'Premium' ||  // No batch dialog needed
    batchConfirmed                   // User confirmed dialog (with or without a batch)
  )

  const handleCheckoutRedirect = async () => {
    if (!selectedTrack) {
      toast.error('Please select an enrollment track first.')
      return
    }

    setValidationError(null)
    setIsCheckingAuth(true)

    const sortedLevels = [...(activeCourse.levels || [])].sort((a, b) => a.no - b.no)
    let finalLevelIds = selectedLevelIds
    if (selectedTrack === 'Expert' || selectedTrack === 'Premium') {
      finalLevelIds = sortedLevels.map((l) => l.level_id)
    }

    const checkoutParams = new URLSearchParams({
      course_id: activeCourse.course_id,
      slug: activeCourse.slug,
      track: selectedTrack,
      amount: pricing.basePrice.toString(),
      discount: pricing.discountAmount.toString(),
      levels: finalLevelIds.join(','),
    })
    if (appliedCouponId) {
      checkoutParams.append('coupon_id', appliedCouponId)
    }
    // Pass selected batch
    if (selectedBatchId) {
      checkoutParams.append('batch_id', selectedBatchId)
      if (selectedBatchTitle) {
        checkoutParams.append('batch_title', selectedBatchTitle)
      }
    } else if (selectedTrack !== 'Premium') {
      // User clicked "Continue Without Batch" or similar
      checkoutParams.append('batch_title', 'Pending Assignment')
    }

    const checkoutUrl = `/checkout?${checkoutParams.toString()}`

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push(`/signup?redirect=${encodeURIComponent(checkoutUrl)}`)
        return
      }

      const { data: existingEnrollments, error } = await supabase
        .from('enrollments')
        .select('level_id, track_type, status, levels!inner(course_id, level_title)')
        .eq('user_id', user.id)
        .eq('levels.course_id', activeCourse.course_id)
        .neq('status', 'Rejected')

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

      router.push(checkoutUrl)
    } catch {
      router.push(`/signup?redirect=${encodeURIComponent(checkoutUrl)}`)
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
            Click a track to choose your batch and confirm enrollment details.
          </p>
        </div>

        {/* No track selected — info hint */}
        {!selectedTrack && (
          <div className="flex items-center gap-3 rounded-xl border border-[#1e3a5f]/15 bg-[#1e3a5f]/[0.04] px-4 py-3">
            <Info className="h-4 w-4 text-[#1e3a5f] shrink-0" />
            <p className="text-xs text-[#1e3a5f]/70 font-medium">
              Select a track below to see available batches and configure your enrollment.
            </p>
          </div>
        )}

        {/* 2×2 Grid of Track Selection Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TRACK_OPTIONS.map((track) => {
            const isSelected = selectedTrack === track.id
            const hasBatch = isSelected && selectedBatchId !== null
            const isPremium = track.id === 'Premium'

            return (
              <div
                key={track.id}
                onClick={() => handleTrackCardClick(track.id)}
                className={`relative flex flex-col justify-between rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-2 border-[#F18231] ring-2 ring-[#F18231]/20 bg-[#F18231]/5'
                    : 'border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
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

                {/* Selected batch info shown inside card */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-[#F18231]/20">
                    {isPremium ? (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#F18231]" />
                        <span className="text-[11px] font-semibold text-[#F18231]">1-on-1 — no batch required</span>
                      </div>
                    ) : hasBatch ? (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#F18231] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-[#0F172A] truncate">{selectedBatchTitle}</p>
                          {selectedBatchDates && (
                            <p className="text-[10px] text-slate-500">{selectedBatchDates}</p>
                          )}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleTrackCardClick(track.id) }}
                          className="ml-auto shrink-0 text-[10px] font-semibold text-[#F18231] hover:text-[#d96f21] transition-colors"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="text-[11px] font-semibold text-amber-600">No batch selected — click to pick</span>
                      </div>
                    )}
                  </div>
                )}

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
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                Fast Track: Pick Specific Levels to Unlock
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select the levels you want, then click "Select Batch" to choose your start date.
              </p>
            </div>
            <div className="space-y-2.5">
              {activeCourse.levels?.filter((lvl) => lvl.no !== 1).map((lvl) => {
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

            {/* Select Batch button — shown after at least 1 level is chosen */}
            <div className="pt-1 border-t border-[#F18231]/15">
              {selectedLevelIds.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-1">
                  Select at least one level to choose a batch
                </p>
              ) : batchConfirmed ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#F18231] shrink-0" />
                    <div>
                      {selectedBatchId ? (
                        <>
                          <p className="text-[11px] font-bold text-[#0F172A]">{selectedBatchTitle}</p>
                          {selectedBatchDates && <p className="text-[10px] text-slate-500">{selectedBatchDates}</p>}
                        </>
                      ) : (
                        <p className="text-[11px] font-semibold text-slate-500">No batch assigned (admin will assign)</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => openBatchDialog('Fast')}
                    className="text-[10px] font-semibold text-[#F18231] hover:text-[#d96f21] transition-colors shrink-0 ml-3"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => openBatchDialog('Fast')}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-[#F18231] bg-white px-4 py-2.5 text-xs font-bold text-[#F18231] hover:bg-[#F18231]/5 transition-colors"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Select Batch for Selected Level{selectedLevelIds.length > 1 ? 's' : ''}
                </button>
              )}
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
              <span className={`font-bold ${selectedTrack ? 'text-[#F18231]' : 'text-slate-400 italic'}`}>
                {selectedTrack ? `${selectedTrack} Track` : 'Not selected'}
              </span>
            </div>

            {/* Selected batch in summary */}
            {selectedTrack && selectedTrack !== 'Premium' && (
              <div className="flex justify-between text-slate-500">
                <span>Batch:</span>
                <span className={`font-bold text-right max-w-[160px] ${
                  batchConfirmed
                    ? (selectedBatchId ? 'text-[#0F172A]' : 'text-slate-500 italic')
                    : 'text-amber-500 italic'
                }`}>
                  {batchConfirmed
                    ? (selectedBatchId ? (selectedBatchDates || selectedBatchTitle || 'Selected') : 'No batch (admin assigns)')
                    : (selectedTrack === 'Fast' && selectedLevelIds.length === 0 ? 'Select levels first' : 'Not selected')}
                </span>
              </div>
            )}

            {selectedTrack && (
              <>
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
              </>
            )}

            {!selectedTrack && (
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-center">
                <p className="text-[11px] text-slate-400">Select a track to see pricing</p>
              </div>
            )}
          </div>

          {/* Coupon Code Area — only shown when track is selected */}
          {selectedTrack && (
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
                  disabled={isApplyingCoupon || !couponCode.trim()}
                  className="shrink-0 rounded-lg bg-[#0F172A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1e293b] transition-colors disabled:opacity-50"
                >
                  {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                </button>
              </div>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={handleCheckoutRedirect}
            disabled={!canProceed || isCheckingAuth}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#F18231] py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#d96f21] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isCheckingAuth ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : !selectedTrack ? (
              <>Select a Track First</>
            ) : selectedTrack === 'Fast' && selectedLevelIds.length === 0 ? (
              <>Select Your Levels First</>
            ) : selectedTrack !== 'Premium' && !batchConfirmed ? (
              <>Select a Batch to Continue</>
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

      {/* ── Batch Selection Dialog ── */}
      {pendingTrack && (
        <BatchSelectionDialog
          isOpen={batchDialogOpen}
          onClose={() => { setBatchDialogOpen(false); setPendingTrack(null) }}
          onConfirm={handleBatchConfirm}
          trackType={pendingTrack}
          levelTitle={dialogLevelTitle}
          levelNo={dialogLevelNo}
          batches={dialogBatches}
          selectedBatchId={tempBatchId}
          onSelectBatch={setTempBatchId}
        />
      )}

      {/* ── Course Change Modal ── */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-[#0F172A] to-[#1e3a5f] px-5 py-4">
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
              {allCourses.map((c) => {
                const isActive = c.course_id === activeCourse.course_id
                return (
                  <button
                    key={c.course_id}
                    onClick={() => {
                      if (!isActive) {
                        router.push(`/courses/${c.slug}`)
                      }
                    }}
                    className={`w-full text-left rounded-xl border p-4 transition-all ${
                      isActive
                        ? 'border-[#0F172A] bg-[#0F172A]/5 ring-1 ring-[#0F172A]'
                        : 'border-slate-200 bg-white hover:border-[#F18231] hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#F18231]">
                        {c.category}
                      </span>
                      {isActive && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#0F172A]">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Selected
                        </span>
                      )}
                    </div>
                    <h5 className="text-[15px] font-extrabold text-[#0F172A] leading-snug mb-1.5">
                      {c.name}
                    </h5>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">
                      {c.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#1e3a5f] bg-blue-50 px-2 py-1 rounded">
                        {c.levels?.length || 0} Levels
                      </span>
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
