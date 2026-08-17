'use client'

import { useRef, useEffect } from 'react'
import { X, Calendar, CheckCircle2, Clock, AlertCircle, Crown, ArrowRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { TrackType } from '@/lib/types'

export interface BatchInfo {
  content_items_id: string
  title: string
  start_date: string
  end_date: string
}

interface BatchSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (batchId: string | null, batchTitle: string | null) => void
  trackType: TrackType
  /** The level whose batches we're showing */
  levelTitle: string
  levelNo: number
  /** All available batches for the target level */
  batches: BatchInfo[]
  selectedBatchId: string | null
  onSelectBatch: (id: string) => void
}

function formatDateRange(start: string, end: string): string {
  try {
    const s = parseISO(start)
    const e = parseISO(end)
    const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()
    if (sameMonth) {
      return `${format(s, 'MMM d')} – ${format(e, 'd')}, ${format(e, 'yyyy')}`
    }
    return `${format(s, 'MMM d')} – ${format(e, 'MMM d, yyyy')}`
  } catch {
    return `${start} – ${end}`
  }
}

const TRACK_COLORS: Record<TrackType, { accent: string; bg: string; badge: string; badgeText: string }> = {
  Expert:      { accent: 'border-l-[#F18231]', bg: 'bg-orange-50/40',    badge: 'bg-orange-100 text-[#F18231]',     badgeText: 'Expert' },
  Progressive: { accent: 'border-l-[#1e3a5f]', bg: 'bg-blue-50/30',     badge: 'bg-blue-100 text-[#1e3a5f]',       badgeText: 'Progressive' },
  Fast:        { accent: 'border-l-emerald-500', bg: 'bg-emerald-50/30', badge: 'bg-emerald-100 text-emerald-700',  badgeText: 'Fast' },
  Premium:     { accent: 'border-l-amber-500',  bg: 'bg-amber-50/30',    badge: 'bg-amber-100 text-amber-700',      badgeText: 'Premium VIP' },
}

export function BatchSelectionDialog({
  isOpen,
  onClose,
  onConfirm,
  trackType,
  levelTitle,
  levelNo,
  batches,
  selectedBatchId,
  onSelectBatch,
}: BatchSelectionDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const colors = TRACK_COLORS[trackType]

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (overlayRef.current && !dialogRef.current?.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, onClose])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isPremium = trackType === 'Premium'
  const selectedBatch = batches.find(b => b.content_items_id === selectedBatchId)

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ boxShadow: '0 25px 60px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.08)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-[#0F172A] to-[#1e3a5f]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/15">
              {isPremium
                ? <Crown className="h-5 w-5 text-amber-400" />
                : <Calendar className="h-5 w-5 text-[#F18231]" />
              }
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-0.5">
                {colors.badgeText} Track
              </p>
              <h3 className="text-sm font-bold text-white leading-tight">
                {isPremium ? '1-on-1 Mentorship Enrollment' : 'Select Your Batch'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Level Info Strip */}
        <div className={`px-6 py-3 border-b border-slate-100 ${colors.bg} flex items-center gap-3`}>
          <div className={`h-8 w-1 rounded-full ${colors.accent.replace('border-l-', 'bg-')}`} />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enrolling in</p>
            <p className="text-xs font-bold text-[#0F172A]">Level {levelNo}: {levelTitle}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[380px] overflow-y-auto">

          {/* Premium Track — No batch */}
          {isPremium && (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200">
                <Crown className="h-7 w-7 text-amber-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0F172A] mb-1">No Batch Selection Required</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Your Premium (1-on-1) enrollment gives you a dedicated instructor.
                  Sessions are scheduled personally after admin approval.
                </p>
              </div>
              <div className="w-full rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-left">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    After payment approval, your instructor will contact you directly to schedule your 1-on-1 sessions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Non-Premium — Batch list */}
          {!isPremium && (
            <>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Choose a batch to join. You'll be enrolled once your payment is approved by the admin.
              </p>

              {/* No batches state */}
              {batches.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100">
                    <AlertCircle className="h-6 w-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-600">No Batches Available</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      There are no scheduled batches for this level right now.
                      You can still enroll and a batch will be assigned to you.
                    </p>
                  </div>
                </div>
              )}

              {/* Batch cards */}
              {batches.length > 0 && (
                <div className="space-y-2.5">
                  {batches.map((batch) => {
                    const isSelected = selectedBatchId === batch.content_items_id
                    const dateRange = formatDateRange(batch.start_date, batch.end_date)
                    const startDate = parseISO(batch.start_date)
                    const now = new Date()
                    const isUpcoming = startDate > now
                    const isOngoing = startDate <= now && parseISO(batch.end_date) >= now

                    return (
                      <div
                        key={batch.content_items_id}
                        onClick={() => onSelectBatch(batch.content_items_id)}
                        className={`relative rounded-xl border-l-[3px] border p-4 cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? `${colors.accent} border-slate-200 bg-[#F18231]/5 ring-2 ring-[#F18231]/15`
                            : 'border-l-slate-200 border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                        style={isSelected ? { boxShadow: '0 1px 8px rgba(241,130,49,0.12)' } : {}}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              {/* Status badge */}
                              <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                isOngoing
                                  ? 'bg-green-100 text-green-700'
                                  : isUpcoming
                                  ? 'bg-blue-100 text-[#1e3a5f]'
                                  : 'bg-slate-100 text-slate-500'
                              }`}>
                                <span className={`h-1 w-1 rounded-full ${isOngoing ? 'bg-green-500' : isUpcoming ? 'bg-blue-500' : 'bg-slate-400'}`} />
                                {isOngoing ? 'Ongoing' : isUpcoming ? 'Upcoming' : 'Past'}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-[#0F172A] leading-snug truncate">
                              {batch.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <Calendar className="h-3 w-3 text-[#F18231] shrink-0" />
                              <span className="text-[11px] font-semibold text-[#1e3a5f]">{dateRange}</span>
                            </div>
                          </div>

                          {/* Radio indicator */}
                          <div className={`shrink-0 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors mt-0.5 ${
                            isSelected
                              ? 'border-[#F18231] bg-[#F18231]'
                              : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && (
                              <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              if (isPremium) {
                onConfirm(null, null)
              } else if (batches.length === 0) {
                // No batches — confirm without batch
                onConfirm(null, null)
              } else {
                onConfirm(selectedBatchId, selectedBatch?.title ?? null)
              }
            }}
            disabled={!isPremium && batches.length > 0 && !selectedBatchId}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F18231] text-xs font-bold text-white hover:bg-[#d96f21] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {isPremium
              ? 'Confirm Enrollment'
              : batches.length === 0
              ? 'Continue Without Batch'
              : selectedBatchId
              ? <>Confirm Batch <ArrowRight className="h-3.5 w-3.5" /></>
              : 'Select a Batch to Continue'
            }
          </button>
        </div>

        {/* Bottom info strip */}
        {!isPremium && selectedBatchId && (
          <div className="px-6 py-2.5 bg-[#0F172A]/[0.03] border-t border-slate-100 flex items-center gap-2">
            <Clock className="h-3 w-3 text-[#F18231] shrink-0" />
            <p className="text-[10px] text-slate-500 font-medium">
              Enrollment becomes active only after admin approves your payment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
