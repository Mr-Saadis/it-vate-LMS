'use client'

import { useState, useMemo, useTransition } from 'react'
import Link from 'next/link'
import {
  Users,
  Search,
  GraduationCap,
  BookOpen,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  SlidersHorizontal,
  ArrowUpRight,
  Layers,
  X,
} from 'lucide-react'
import { toggleEnrollmentCompletionAction } from '@/lib/actions/admin'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

interface Enrollment {
  enroll_id: string
  course: string
  level?: string
  track: string
  status: string
  is_completed: boolean
  enrollment_date: string
}

interface Student {
  id: string
  name: string
  email: string
  phone?: string
  education?: string
  joined_at?: string
  enrollments: Enrollment[]
}

interface StudentsClientProps {
  students: Student[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function getAvatarHue(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  // Constrain to a palette of warm/cool tones, avoiding generic primaries
  const hues = [215, 262, 172, 31, 340, 197, 148, 25]
  return hues[Math.abs(hash) % hues.length]
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'Active')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
        <CheckCircle2 className="h-2.5 w-2.5" /> Active
      </span>
    )
  if (status === 'Pending')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
        <Clock className="h-2.5 w-2.5" /> Pending
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
      <XCircle className="h-2.5 w-2.5" /> {status}
    </span>
  )
}

function TrackBadge({ track }: { track: string }) {
  const styles: Record<string, string> = {
    Expert: 'bg-violet-50 border-violet-200 text-violet-700',
    Progressive: 'bg-blue-50 border-blue-200 text-blue-700',
    Fast: 'bg-orange-50 border-orange-200 text-orange-700',
    Premium: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  }
  const cls = styles[track] ?? 'bg-slate-50 border-slate-200 text-slate-600'
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${cls}`}>
      {track}
    </span>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function StudentsClient({ students }: StudentsClientProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleToggleCompletion = (enrollId: string, newStatus: boolean) => {
    startTransition(async () => {
      try {
        const res = await toggleEnrollmentCompletionAction(enrollId, newStatus)
        if (res.error) throw new Error(res.error)
        toast.success(newStatus ? 'Marked as completed' : 'Marked as incomplete')
        router.refresh()
      } catch (err: any) {
        toast.error(err.message || 'Failed to toggle completion status')
      }
    })
  }

  const totalEnrollments = students.reduce((s, st) => s + st.enrollments.length, 0)
  const activeCount = students.filter((s) => s.enrollments.some((e) => e.status === 'Active')).length
  const pendingCount = students.filter((s) => s.enrollments.some((e) => e.status === 'Pending')).length

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const q = search.toLowerCase()
      const matchSearch =
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.enrollments.some((e) => e.course.toLowerCase().includes(q))

      if (!matchSearch) return false
      if (filter === 'active') return s.enrollments.some((e) => e.status === 'Active')
      if (filter === 'pending') return s.enrollments.some((e) => e.status === 'Pending')
      if (filter === 'inactive') return s.enrollments.every((e) => e.status !== 'Active' && e.status !== 'Pending')
      return true
    })
  }, [students, search, filter])

  const selected = selectedId ? students.find((s) => s.id === selectedId) ?? null : null

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded bg-[#0F172A] px-2 py-0.5 text-[10px] font-bold tracking-widest text-white uppercase">Admin</span>
            <span className="text-xs text-slate-400 font-medium">/ Students</span>
          </div>
          <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">Enrolled Students</h1>
          <p className="text-[11px] text-slate-500 mt-1">Only students with active enrollments are shown.</p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-3 flex-wrap">
            {[
              { label: 'Total Enrolled', value: students.length, icon: <Users className="h-4 w-4" />, color: 'text-slate-700' },
              { label: 'Active', value: activeCount, icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-emerald-600' },
              { label: 'Pending', value: pendingCount, icon: <Clock className="h-4 w-4" />, color: 'text-amber-600' },
              { label: 'Enrollments', value: totalEnrollments, icon: <Layers className="h-4 w-4" />, color: 'text-blue-600' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm shrink-0">
                <span className={stat.color}>{stat.icon}</span>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                  <p className={`text-sm font-extrabold ${stat.color} leading-tight`}>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      {/* ── Body ── */}
      <div>
        <div className="flex flex-col lg:flex-row gap-6 transition-all duration-300">

          {/* ── Left: Table Panel ── */}
          <div className={`flex-1 min-w-0 flex flex-col gap-4 ${selected ? 'lg:max-w-[55%]' : ''}`}>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search name, email or course…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-5 pl-10 pr-4 text-xs text-[#0F172A] placeholder:text-slate-400 shadow-sm focus-visible:ring-2 focus-visible:ring-[#F18231]/30 focus-visible:border-[#F18231] transition-all"
                />
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2 py-1.5 shadow-sm overflow-x-auto scrollbar-hide">
                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400 ml-1 shrink-0" />
                {(['all', 'active', 'pending', 'inactive'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold capitalize transition-all ${
                      filter === f
                        ? 'bg-[#0F172A] text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Result count */}
            <p className="text-[11px] text-slate-400 font-medium">
              {filtered.length} student{filtered.length !== 1 ? 's' : ''} found
              {search && ` for "${search}"`}
            </p>

            {/* Students List */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 mb-3">
                  <Users className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-600">No students found</p>
                <p className="text-xs text-slate-400 mt-1">
                  {search ? 'Try a different search term or clear the filter.' : 'No enrolled students yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((student) => {
                  const hue = getAvatarHue(student.name)
                  const initials = getInitials(student.name)
                  const isActive = student.enrollments.some((e) => e.status === 'Active')
                  const isPending = !isActive && student.enrollments.some((e) => e.status === 'Pending')
                  const isSelected = selectedId === student.id

                  return (
                    <button
                      key={student.id}
                      onClick={() => setSelectedId(isSelected ? null : student.id)}
                      className={`group w-full text-left rounded-xl border bg-white px-4 py-3.5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-px ${
                        isSelected
                          ? 'border-[#F18231] ring-1 ring-[#F18231]/20 shadow-md'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                          style={{ background: `hsl(${hue}, 60%, 50%)` }}
                        >
                          {initials}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-[#0F172A] truncate">
                              {student.name}
                            </span>
                            {isActive && (
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" title="Has active enrollment" />
                            )}
                            {isPending && (
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" title="Has pending enrollment" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{student.email}</p>
                        </div>

                        {/* Right: enrollments count + courses preview */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* First course name (desktop only) */}
                          {student.enrollments[0] && (
                            <span className="hidden md:inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-200 px-2 py-1 text-[10px] font-medium text-slate-600 max-w-[160px] truncate">
                              <BookOpen className="h-3 w-3 text-[#F18231] shrink-0" />
                              <span className="truncate">{student.enrollments[0].course} {student.enrollments[0].level ? `- ${student.enrollments[0].level}` : ''}</span>
                            </span>
                          )}
                          {student.enrollments.length > 1 && (
                            <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                              +{student.enrollments.length - 1}
                            </span>
                          )}
                          <ChevronRight className={`h-4 w-4 text-slate-300 transition-transform duration-200 group-hover:text-[#F18231] ${isSelected ? 'rotate-90 text-[#F18231]' : ''}`} />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Right: Detail Panel ── */}
          {selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm lg:static lg:p-0 lg:bg-transparent lg:backdrop-blur-none lg:w-[42%] lg:shrink-0 lg:block">
              <div className="w-full max-w-lg lg:max-w-none max-h-[90vh] lg:max-h-none overflow-y-auto lg:overflow-visible lg:sticky lg:top-6 rounded-2xl border border-slate-200 bg-white shadow-2xl lg:shadow-sm">
                {/* Panel Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
                      style={{ background: `hsl(${getAvatarHue(selected.name)}, 60%, 50%)` }}
                    >
                      {getInitials(selected.name)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-[#0F172A] truncate">{selected.name}</h2>
                      <p className="text-[11px] text-slate-400 truncate">{selected.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/admin/students/${selected.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#F18231] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#d96f21] transition-colors"
                    >
                      Full Profile
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                    <button
                      onClick={() => setSelectedId(null)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-px bg-slate-100 border-b border-slate-100">
                  {[
                    { label: 'Phone', value: selected.phone || '—' },
                    { label: 'Education', value: selected.education || '—' },
                    {
                      label: 'Member Since',
                      value: selected.joined_at
                        ? new Date(selected.joined_at).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—',
                    },
                    { label: 'Enrollments', value: `${selected.enrollments.length} course${selected.enrollments.length !== 1 ? 's' : ''}` },
                  ].map((item) => (
                    <div key={item.label} className="bg-white px-4 py-3">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
                      <p className="text-xs font-semibold text-[#0F172A] mt-0.5 truncate">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Enrollments List */}
                <div className="p-5 space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrollments</p>
                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {selected.enrollments.map((enr, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-[#0F172A] leading-snug flex-1 min-w-0">
                            {enr.course} {enr.level && <span className="text-slate-400 font-normal ml-1">— {enr.level}</span>}
                          </p>
                          <StatusBadge status={enr.status} />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <TrackBadge track={enr.track} />
                            <span className="text-[10px] text-slate-400">
                              {new Date(enr.enrollment_date).toLocaleDateString('en-PK', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })}
                            </span>
                          </div>
                          
                          <label className="flex items-center gap-1.5 cursor-pointer bg-white border border-slate-200 px-2 py-1 rounded-md shadow-sm">
                            <Checkbox
                              checked={enr.is_completed}
                              onCheckedChange={(checked) => handleToggleCompletion(enr.enroll_id, !!checked)}
                              disabled={isPending}
                              className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white disabled:opacity-50"
                            />
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Completed</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 px-5 py-3">
                  <Link
                    href={`/admin/students/${selected.id}`}
                    className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1e293b] transition-colors"
                  >
                    View Full Student Profile
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
