'use client'

import { useState, useTransition } from 'react'
import { Plus, Tag, Calculator, Percent, Infinity, Clock, Search, Trash2, PowerOff, Power } from 'lucide-react'
import { toast } from 'sonner'
import { createCoupon, toggleCouponStatus, deleteCoupon } from '@/lib/actions/coupons'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CouponsClient({ coupons, courses }: { coupons: any[], courses: any[] }) {
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Form State
  const [code, setCode] = useState('')
  const [calcMode, setCalcMode] = useState<'direct' | 'calculator'>('direct')
  const [discountPercent, setDiscountPercent] = useState<string>('')
  
  // Calculator State
  const [originalPrice, setOriginalPrice] = useState<string>('')
  const [finalPrice, setFinalPrice] = useState<string>('')

  // Other fields
  const [usageLimit, setUsageLimit] = useState<string>('') // empty = unlimited, 1 = one-time
  const [courseId, setCourseId] = useState<string>('all')
  const [trackType, setTrackType] = useState<string>('all')

  const handleCalculate = () => {
    const orig = parseFloat(originalPrice)
    const fin = parseFloat(finalPrice)
    if (orig > 0 && fin >= 0 && fin <= orig) {
      const pct = ((orig - fin) / orig) * 100
      setDiscountPercent(pct.toFixed(2))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || !discountPercent) {
      toast.error('Code and Discount Percentage are required')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('code', code)
      formData.append('discount_percentage', discountPercent)
      
      if (usageLimit) formData.append('usage_limit', usageLimit)
      if (courseId && courseId !== 'all') formData.append('applicable_course_id', courseId)
      if (trackType && trackType !== 'all') formData.append('applicable_track_type', trackType)
      
      const res = await createCoupon(formData)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success('Coupon created successfully')
        setIsModalOpen(false)
        resetForm()
      }
    })
  }

  const resetForm = () => {
    setCode('')
    setDiscountPercent('')
    setOriginalPrice('')
    setFinalPrice('')
    setUsageLimit('')
    setCourseId('all')
    setTrackType('all')
  }

  const handleToggle = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleCouponStatus(id, !currentStatus)
      if (res?.error) toast.error(res.error)
      else toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'}`)
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon? This might affect records.')) return
    startTransition(async () => {
      const res = await deleteCoupon(id)
      if (res?.error) toast.error(res.error)
      else toast.success('Coupon deleted')
    })
  }

  const filteredCoupons = coupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded bg-[#0F172A] px-2 py-0.5 text-[10px] font-bold tracking-widest text-white uppercase">Admin</span>
            <span className="text-xs text-slate-400 font-medium">/ Coupons</span>
          </div>
          <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">Discount Coupons</h1>
          <p className="text-[11px] text-slate-500 mt-1">Manage promotional codes and discounts.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#F18231] hover:bg-[#d96f21] text-white">
          <Plus className="h-4 w-4 mr-2" /> Create Coupon
        </Button>
      </div>

      {/* Main Area */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coupon codes..."
            className="pl-10 rounded-xl"
          />
        </div>

        {/* Coupons Grid */}
        {filteredCoupons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
            <Tag className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">No coupons found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCoupons.map((coupon) => (
              <div key={coupon.coupon_id} className={`rounded-xl border bg-white p-5 shadow-sm transition-all ${coupon.is_active ? 'border-slate-200' : 'border-slate-200 opacity-60'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-black text-[#0F172A] tracking-wider">{coupon.code}</h3>
                    <p className="text-[10px] font-bold text-[#F18231] uppercase tracking-widest">
                      {coupon.discount_percentage}% OFF
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleToggle(coupon.coupon_id, coupon.is_active)} className={`p-1.5 rounded-md border ${coupon.is_active ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'}`} title={coupon.is_active ? "Deactivate" : "Activate"}>
                      {coupon.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                    </button>
                    <button onClick={() => handleDelete(coupon.coupon_id)} className="p-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-400 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400"><Infinity className="h-3.5 w-3.5" /> Usage</span>
                    <span className="font-semibold text-[#0F172A]">
                      {coupon.used_count} / {coupon.usage_limit ? coupon.usage_limit : 'Unlimited'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400"><Tag className="h-3.5 w-3.5" /> Course Scope</span>
                    <span className="font-semibold text-[#0F172A] max-w-[120px] truncate">
                      {coupon.applicable_course_id ? coupon.courses?.name : 'All Courses'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400"><Tag className="h-3.5 w-3.5" /> Track Scope</span>
                    <span className="font-semibold text-[#0F172A]">
                      {coupon.applicable_track_type || 'All Tracks'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-[#0F172A]">Create New Coupon</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><Plus className="h-5 w-5 rotate-45" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Coupon Code</label>
                <Input required value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. SUMMER20" className="uppercase font-bold" />
              </div>

              {/* Discount Setup */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Discount Setup</label>
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                    <button type="button" onClick={() => setCalcMode('direct')} className={`px-2 py-1 text-[10px] font-bold rounded-md ${calcMode === 'direct' ? 'bg-[#0F172A] text-white' : 'text-slate-500'}`}>Direct %</button>
                    <button type="button" onClick={() => setCalcMode('calculator')} className={`px-2 py-1 text-[10px] font-bold rounded-md flex items-center gap-1 ${calcMode === 'calculator' ? 'bg-[#F18231] text-white' : 'text-slate-500'}`}><Calculator className="h-3 w-3" /> Calculator</button>
                  </div>
                </div>

                {calcMode === 'direct' ? (
                  <div className="relative">
                    <Input required type="number" step="0.01" min="0" max="100" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} placeholder="Enter percentage (e.g. 20)" className="pl-9" />
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">Original Price</label>
                        <Input type="number" value={originalPrice} onChange={e => {setOriginalPrice(e.target.value); handleCalculate();}} onBlur={handleCalculate} placeholder="e.g. 5000" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">Target Sale Price</label>
                        <Input type="number" value={finalPrice} onChange={e => {setFinalPrice(e.target.value); handleCalculate();}} onBlur={handleCalculate} placeholder="e.g. 4000" />
                      </div>
                    </div>
                    {discountPercent && (
                      <div className="bg-emerald-50 text-emerald-700 p-2 rounded-lg text-xs font-semibold flex items-center justify-between border border-emerald-100">
                        <span>Calculated Discount:</span>
                        <span className="text-lg font-black">{discountPercent}%</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Usage Limit</label>
                  <Input type="number" min="1" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} placeholder="Leave blank for unlimited" />
                  <p className="text-[9px] text-slate-400 mt-1">Enter 1 for one-time coupon.</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Track Scope</label>
                  <Select value={trackType} onValueChange={val => setTrackType(val || 'all')}>
                    <SelectTrigger className="w-full rounded-xl border border-slate-200 bg-white py-5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F18231]/30">
                      <SelectValue placeholder="Select Track" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tracks</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                      <SelectItem value="Progressive">Progressive</SelectItem>
                      <SelectItem value="Fast">Fast</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Course Scope</label>
                <Select value={courseId} onValueChange={val => setCourseId(val || 'all')}>
                  <SelectTrigger className="w-full rounded-xl border border-slate-200 bg-white py-5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F18231]/30">
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map(c => <SelectItem key={c.course_id} value={c.course_id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isPending} className="flex-1 bg-[#F18231] hover:bg-[#d96f21] text-white">
                  {isPending ? 'Creating...' : 'Create Coupon'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
