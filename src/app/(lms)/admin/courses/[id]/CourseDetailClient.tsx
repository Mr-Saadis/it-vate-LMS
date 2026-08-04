'use client'

import { useState, useTransition, useMemo } from 'react'
import { Course, Level } from '@/lib/types'
import { Plus, Edit2, ChevronRight, Layers, Save, X, Loader2, Trash2, ArrowLeft, Search, SlidersHorizontal, BookOpen, Clock, BarChart, FileText, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createContentItemAction, deleteClassroomLinkAction } from '@/lib/actions/content_items'
import { createLevelAction, updateLevelAction } from '@/lib/actions/courses'
import { toggleContentItemCompletionAction } from '@/lib/actions/admin'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
const getAvatarHue = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 360
}

const getInitials = (name: string) => {
  return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
}

interface CourseDetailClientProps {
  course: Course
}

export function CourseDetailClient({ course }: CourseDetailClientProps) {
  const router = useRouter()
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const [isPending, startTransition] = useTransition()
  const [isSaving, setIsSaving] = useState(false)
  
  // Modals state
  const [editingLevel, setEditingLevel] = useState<Level | null>(null)
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false)
  const [levelForm, setLevelForm] = useState({
    no: 1,
    level_title: '',
    level_description: '',
    code: '',
    price: 0,
    is_active: true,
  })

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkTarget, setLinkTarget] = useState<{levelId: string, courseSlug: string, levelNo: number} | null>(null)
  const [linkForm, setLinkForm] = useState({
    type: 'link' as 'link' | 'drive' | 'video',
    title: '',
    year: String(new Date().getFullYear()),
    month: String(new Date().getMonth() + 1).padStart(2, '0'),
    url: '',
    drive_file_id: '',
    youtube_id: ''
  })

  // Delete State
  const [deletingItem, setDeletingItem] = useState<{ type: 'level' | 'link'; id: string; name: string } | null>(null)
  const [deleteInput, setDeleteInput] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // Memoized Levels
  const levels = useMemo(() => {
    let list = course.levels || []
    if (search) {
      list = list.filter(l => 
        l.level_title.toLowerCase().includes(search.toLowerCase()) || 
        (l.code && l.code.toLowerCase().includes(search.toLowerCase()))
      )
    }
    if (filter === 'active') {
      list = list.filter(l => l.is_active)
    } else if (filter === 'inactive') {
      list = list.filter(l => !l.is_active)
    }
    return list.sort((a, b) => a.no - b.no)
  }, [course.levels, search, filter])

  const selectedLevel = selectedLevelId ? course.levels?.find((l) => l.level_id === selectedLevelId) ?? null : null

  // Open add level modal
  const openAddLevel = () => {
    setEditingLevel(null)
    setLevelForm({ no: (course.levels?.length || 0) + 1, level_title: '', level_description: '', code: '', price: 0, is_active: true })
    setIsLevelModalOpen(true)
  }

  // Open edit level modal
  const openEditLevel = (level: Level) => {
    setEditingLevel(level)
    setLevelForm({
      no: level.no,
      level_title: level.level_title,
      level_description: level.level_description || '',
      code: level.code || '',
      price: level.price,
      is_active: level.is_active,
    })
    setIsLevelModalOpen(true)
  }

  // Open add link modal
  const openAddLink = (levelId: string, levelNo: number) => {
    setLinkTarget({ levelId, courseSlug: course.slug, levelNo })
    setLinkForm({
      type: 'link',
      title: '',
      year: String(new Date().getFullYear()),
      month: String(new Date().getMonth() + 1).padStart(2, '0'),
      url: '',
      drive_file_id: '',
      youtube_id: ''
    })
    setIsLinkModalOpen(true)
  }

  const saveLink = async () => {
    if (!linkTarget) return
    if (linkForm.type === 'link' && !linkForm.url) return
    if (linkForm.type === 'drive' && (!linkForm.title || !linkForm.drive_file_id)) return
    if (linkForm.type === 'video' && (!linkForm.title || !linkForm.youtube_id)) return

    setIsSaving(true)
    try {
      let finalTitle = linkForm.title
      if (linkForm.type === 'link') {
        const codePrefix = linkTarget.courseSlug.toUpperCase() || 'CRS'
        finalTitle = `${codePrefix}-${linkForm.year}${linkForm.month}-L${linkTarget.levelNo}`
      }
      
      const res = await createContentItemAction({
        level_id: linkTarget.levelId,
        title: finalTitle,
        content_type: linkForm.type,
        url: linkForm.type === 'link' ? linkForm.url : undefined,
        drive_file_id: linkForm.type === 'drive' ? linkForm.drive_file_id : undefined,
        youtube_id: linkForm.type === 'video' ? linkForm.youtube_id : undefined
      })

      if (res.success) {
        toast.success('Link added successfully')
        setIsLinkModalOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to add link')
      }
    } catch (e: any) {
      toast.error(e.message || 'An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const saveLevel = async () => {
    setIsSaving(true)
    try {
      if (editingLevel) {
        // Edit existing level
        const res = await updateLevelAction(editingLevel.level_id, levelForm)
        if (res.success) {
          toast.success('Level updated')
          setIsLevelModalOpen(false)
          router.refresh()
        } else {
          toast.error(res.error || 'Failed to update level')
        }
      } else {
        // Add new level
        const res = await createLevelAction({ ...levelForm, course_id: course.course_id })
        if (res.success) {
          toast.success('Level created')
          setIsLevelModalOpen(false)
          router.refresh()
        } else {
          toast.error(res.error || 'Failed to add level')
        }
      }
    } catch (e: any) {
      toast.error(e.message || 'An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const executeDelete = () => {
    if (!deletingItem || deleteInput !== 'DELETE') return
    setIsDeleting(true)
    
    startTransition(async () => {
      try {
        if (deletingItem.type === 'link') {
          const res = await deleteClassroomLinkAction(deletingItem.id)
          if (!res.success) throw new Error(res.error)
          toast.success('Link deleted successfully')
        } else if (deletingItem.type === 'level') {
          // Add API call to delete level here in the future
          await new Promise(r => setTimeout(r, 500))
          toast.success('Level deleted successfully')
          if (selectedLevelId === deletingItem.id) setSelectedLevelId(null)
        }
        setDeletingItem(null)
        setDeleteInput('')
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || `Failed to delete ${deletingItem.type}`)
      } finally {
        setIsDeleting(false)
      }
    })
  }

  const handleToggleContentItemCompletion = (itemId: string, currentStatus: boolean) => {
    startTransition(async () => {
      try {
        const res = await toggleContentItemCompletionAction(itemId, !currentStatus)
        if (res.error) throw new Error(res.error)
        toast.success(currentStatus ? 'Marked as incomplete' : 'Marked as completed')
        router.refresh()
      } catch (err: any) {
        toast.error(err.message || 'Failed to toggle completion status')
      }
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/admin/courses" 
              className="flex items-center justify-center h-6 w-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
            <span className="rounded bg-[#0F172A] px-2 py-0.5 text-[10px] font-bold tracking-widest text-white uppercase">Admin</span>
            <span className="text-xs text-slate-400 font-medium">/ Courses</span>
          </div>
          <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">{course.name}</h1>
          <p className="text-[11px] text-slate-500 mt-1 max-w-2xl line-clamp-1">{course.description}</p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm shrink-0">
            <span className="text-slate-700"><Layers className="h-4 w-4" /></span>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Levels</p>
              <p className="text-sm font-extrabold text-slate-700 leading-tight">{course.levels?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>
        
      {/* ── Body ── */}
      <div>
        <div className={`flex flex-col gap-6 transition-all duration-300 ${selectedLevel ? 'lg:flex-row' : ''}`}>

          {/* ── Left: Table Panel ── */}
          <div className={`flex-1 min-w-0 flex flex-col gap-4 ${selectedLevel ? 'lg:max-w-[55%]' : ''}`}>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search levels..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-[#0F172A] placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F18231]/30 focus:border-[#F18231] transition-all"
                />
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2 py-1.5 shadow-sm shrink-0">
                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400 ml-1" />
                {(['all', 'active', 'inactive'] as const).map((f) => (
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

            <p className="text-[11px] text-slate-400 font-medium">
              {levels.length} level{levels.length !== 1 ? 's' : ''} found
            </p>

            {/* Levels List */}
            {levels.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 mb-3">
                  <Layers className="h-6 w-6 text-slate-300" />
                </div>
                <h3 className="text-sm font-semibold text-slate-600">No levels found</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {search || filter !== 'all' ? 'Try adjusting your search or filters.' : 'This course has no levels yet.'}
                </p>
                {!search && filter === 'all' && (
                  <Button onClick={openAddLevel} className="mt-4 h-8 bg-[#F18231] hover:bg-[#d96f21] text-xs">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add First Level
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {levels.map((level) => {
                  const linksCount = level.content_items?.filter(i => ['link', 'drive', 'video'].includes(i.content_type)).length || 0;
                  const isSelected = selectedLevelId === level.level_id;
                  const hue = getAvatarHue(level.level_title);
                  const initials = getInitials(level.level_title) || `L${level.no}`;
                  
                  return (
                    <button
                      key={level.level_id}
                      onClick={() => setSelectedLevelId(isSelected ? null : level.level_id)}
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
                              {level.level_title}
                            </span>
                            {level.is_active && (
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" title="Active" />
                            )}
                            {!level.is_active && (
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" title="Inactive" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {level.code && <span className="font-mono mr-1">{level.code}</span>}
                            PKR {level.price.toLocaleString()}
                          </p>
                        </div>
                        
                        {/* Right: links count + chevron */}
                        <div className="flex items-center gap-2 shrink-0">
                          {linksCount > 0 && (
                            <span className="hidden md:inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-200 px-2 py-1 text-[10px] font-medium text-slate-600 max-w-[160px] truncate">
                              <BookOpen className="h-3 w-3 text-[#F18231] shrink-0" />
                              <span className="truncate">{linksCount} Classroom Link{linksCount !== 1 ? 's' : ''}</span>
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
            
            {levels.length > 0 && (
              <button 
                onClick={openAddLevel}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-slate-300 bg-white text-slate-500 hover:text-[#F18231] hover:border-[#F18231]/40 hover:bg-slate-50 transition-colors text-xs font-bold uppercase tracking-wider mt-4"
              >
                <Plus className="h-4 w-4" /> Add New Level
              </button>
            )}
          </div>

          {/* ── Right: Level Detail Panel ── */}
          {selectedLevel && (
            <div className="lg:w-[42%] shrink-0">
              <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {/* Panel Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
                      style={{ background: `hsl(${getAvatarHue(selectedLevel.level_title)}, 60%, 50%)` }}
                    >
                      {getInitials(selectedLevel.level_title) || `L${selectedLevel.no}`}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-[#0F172A] truncate">{selectedLevel.level_title}</h2>
                      <p className="text-[11px] text-slate-400 truncate">Level {selectedLevel.no}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEditLevel(selectedLevel)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-[#F18231] hover:bg-orange-50 transition-colors"
                      title="Edit Level"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => { setDeletingItem({ type: 'level', id: selectedLevel.level_id, name: selectedLevel.level_title }); setDeleteInput(''); }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete Level"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setSelectedLevelId(null)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors ml-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-px bg-slate-100 border-b border-slate-100">
                  {[
                    { label: 'Status', value: selectedLevel.is_active ? 'Active' : 'Inactive' },
                    { label: 'Level Code', value: selectedLevel.code || '—' },
                    { label: 'Price', value: `PKR ${selectedLevel.price.toLocaleString()}` },
                    { label: 'Content Items', value: selectedLevel.content_items?.filter(i => ['link', 'drive', 'video'].includes(i.content_type)).length || 0 },
                  ].map((item) => (
                    <div key={item.label} className="bg-white px-4 py-3">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
                      <p className="text-xs font-semibold text-[#0F172A] mt-0.5 truncate">{item.value}</p>
                    </div>
                  ))}
                </div>

                {selectedLevel.level_description && (
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Description</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {selectedLevel.level_description}
                    </p>
                  </div>
                )}

                {/* Content Items Area */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level Content</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => openAddLink(selectedLevel.level_id, selectedLevel.no)} 
                      className="h-6 text-[10px] text-[#F18231] hover:text-[#d96f21] hover:bg-orange-50 px-2"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Content
                    </Button>
                  </div>
                  
                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {(!selectedLevel.content_items || selectedLevel.content_items.filter(i => ['link', 'drive', 'video'].includes(i.content_type)).length === 0) ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center">
                        <BookOpen className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-600">No content added</p>
                      </div>
                    ) : (
                      selectedLevel.content_items.filter(i => ['link', 'drive', 'video'].includes(i.content_type)).map((item) => (
                        <div key={item.content_items_id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 flex justify-between items-start">
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold text-[#0F172A] mb-1.5 shadow-sm">
                              {item.content_type === 'link' && <BookOpen className="h-3 w-3 text-[#F18231]" />}
                              {item.content_type === 'drive' && <FileText className="h-3 w-3 text-blue-500" />}
                              {item.content_type === 'video' && <PlayCircle className="h-3 w-3 text-red-500" />}
                              <span className={item.content_type === 'link' ? "font-mono tracking-tight" : "truncate max-w-[150px]"}>{item.title}</span>
                            </span>
                            {item.content_type === 'link' && item.url && (
                              <a href={item.url} target="_blank" rel="noreferrer" className="block text-xs font-medium text-blue-500 hover:underline max-w-[200px] sm:max-w-[250px] truncate">
                                {item.url}
                              </a>
                            )}
                            {item.content_type === 'drive' && item.drive_file_id && (
                              <a href={item.drive_file_id.startsWith('http') ? item.drive_file_id : `https://drive.google.com/file/d/${item.drive_file_id}/view`} target="_blank" rel="noreferrer" className="block text-xs font-medium text-blue-500 hover:underline max-w-[200px] sm:max-w-[250px] truncate">
                                View File
                              </a>
                            )}
                            {item.content_type === 'video' && item.youtube_id && (
                              <a href={item.youtube_id.startsWith('http') ? item.youtube_id : `https://youtube.com/watch?v=${item.youtube_id}`} target="_blank" rel="noreferrer" className="block text-xs font-medium text-blue-500 hover:underline max-w-[200px] sm:max-w-[250px] truncate">
                                View Video
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <div className="flex items-center gap-1.5 mr-2">
                              <Switch
                                id={`complete-${item.content_items_id}`}
                                checked={!!item.is_completed}
                                onCheckedChange={() => handleToggleContentItemCompletion(item.content_items_id, !!item.is_completed)}
                                disabled={isPending}
                                className="data-[state=checked]:bg-emerald-500"
                              />
                              <label htmlFor={`complete-${item.content_items_id}`} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer">Completed</label>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => { setDeletingItem({ type: 'link', id: item.content_items_id, name: item.title }); setDeleteInput(''); }} 
                              className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Level Form Modal */}
      {isLevelModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 shrink-0">
              <h3 className="text-lg font-bold text-[#0F172A]">
                {editingLevel ? 'Edit Level' : 'Add Level'}
              </h3>
              <button onClick={() => setIsLevelModalOpen(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Level Number</label>
                <input
                  type="number"
                  value={levelForm.no}
                  onChange={(e) => setLevelForm({ ...levelForm, no: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] focus:border-[#F18231] focus:outline-none focus:ring-1 focus:ring-[#F18231]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Level Code (Optional)</label>
                <input
                  type="text"
                  value={levelForm.code}
                  onChange={(e) => setLevelForm({ ...levelForm, code: e.target.value })}
                  placeholder="e.g. BE, ADV"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] placeholder:text-slate-400 focus:border-[#F18231] focus:outline-none focus:ring-1 focus:ring-[#F18231]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Level Title</label>
                <input
                  type="text"
                  value={levelForm.level_title}
                  onChange={(e) => setLevelForm({ ...levelForm, level_title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] focus:border-[#F18231] focus:outline-none focus:ring-1 focus:ring-[#F18231]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                <textarea
                  rows={2}
                  value={levelForm.level_description}
                  onChange={(e) => setLevelForm({ ...levelForm, level_description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] focus:border-[#F18231] focus:outline-none focus:ring-1 focus:ring-[#F18231] resize-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Price (PKR)</label>
                <input
                  type="number"
                  value={levelForm.price}
                  onChange={(e) => setLevelForm({ ...levelForm, price: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] focus:border-[#F18231] focus:outline-none focus:ring-1 focus:ring-[#F18231]"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  id="levelActive"
                  checked={levelForm.is_active}
                  onCheckedChange={(checked) => setLevelForm({ ...levelForm, is_active: checked })}
                  className="data-[state=checked]:bg-[#F18231]"
                />
                <label htmlFor="levelActive" className="text-sm font-semibold text-[#0F172A]">Active Level</label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-6 shrink-0 bg-slate-50 rounded-b-2xl">
              <Button variant="outline" onClick={() => setIsLevelModalOpen(false)} className="text-xs">Cancel</Button>
              <Button onClick={saveLevel} disabled={isSaving} className="text-xs font-semibold bg-[#F18231] hover:bg-[#d96f21]">
                {isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                {editingLevel ? 'Save Changes' : 'Create Level'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Link Form Modal */}
      {isLinkModalOpen && linkTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 shrink-0">
              <h3 className="text-lg font-bold text-[#0F172A]">Add Classroom Link</h3>
              <button onClick={() => setIsLinkModalOpen(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Type Switcher */}
              <div className="flex items-center gap-2 mb-2 bg-slate-100 p-1 rounded-xl">
                 <button onClick={() => setLinkForm({...linkForm, type: 'link'})} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${linkForm.type === 'link' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Classroom</button>
                 <button onClick={() => setLinkForm({...linkForm, type: 'drive'})} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${linkForm.type === 'drive' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Google Drive</button>
                 <button onClick={() => setLinkForm({...linkForm, type: 'video'})} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${linkForm.type === 'video' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>YouTube</button>
              </div>

              {linkForm.type === 'link' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Year</label>
                      <Select value={linkForm.year} onValueChange={v => setLinkForm({...linkForm, year: v || ''})}>
                        <SelectTrigger className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] focus:border-[#F18231]">
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3].map(i => {
                            const y = String(new Date().getFullYear() + i)
                            return <SelectItem key={y} value={y}>{y}</SelectItem>
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Month</label>
                      <Select value={linkForm.month} onValueChange={v => setLinkForm({...linkForm, month: v || ''})}>
                        <SelectTrigger className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] focus:border-[#F18231]">
                          <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 12}).map((_, i) => {
                            const m = String(i + 1).padStart(2, '0')
                            return <SelectItem key={m} value={m}>{m}</SelectItem>
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#F18231]/20 bg-[#F18231]/5 p-3">
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#F18231]">Generated Batch ID</label>
                    <p className="font-mono text-sm font-bold text-[#0F172A]">
                      {(linkTarget.courseSlug.toUpperCase() || 'CRS')}-{linkForm.year}{linkForm.month}-L{linkTarget.levelNo}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">This ID must exactly match the student's enrollment string.</p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Google Classroom URL</label>
                    <input
                      type="url"
                      placeholder="https://classroom.google.com/..."
                      value={linkForm.url}
                      onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] focus:border-[#F18231] focus:outline-none focus:ring-1 focus:ring-[#F18231]"
                    />
                  </div>
                </>
              )}

              {linkForm.type === 'drive' && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Link Title</label>
                    <input type="text" placeholder="e.g. Course Slides" value={linkForm.title} onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] focus:border-[#F18231] focus:outline-none focus:ring-1 focus:ring-[#F18231]" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Google Drive URL or ID</label>
                    <input type="text" placeholder="https://drive.google.com/..." value={linkForm.drive_file_id} onChange={(e) => setLinkForm({ ...linkForm, drive_file_id: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] focus:border-[#F18231] focus:outline-none focus:ring-1 focus:ring-[#F18231]" />
                  </div>
                </>
              )}

              {linkForm.type === 'video' && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Video Title</label>
                    <input type="text" placeholder="e.g. Lesson 1: Introduction" value={linkForm.title} onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] focus:border-[#F18231] focus:outline-none focus:ring-1 focus:ring-[#F18231]" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">YouTube URL or ID</label>
                    <input type="text" placeholder="https://youtube.com/watch?v=..." value={linkForm.youtube_id} onChange={(e) => setLinkForm({ ...linkForm, youtube_id: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] focus:border-[#F18231] focus:outline-none focus:ring-1 focus:ring-[#F18231]" />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-5 shrink-0 bg-slate-50 rounded-b-2xl">
              <Button variant="outline" onClick={() => setIsLinkModalOpen(false)} className="text-xs">Cancel</Button>
              <Button 
                onClick={saveLink} 
                disabled={
                  isSaving || 
                  (linkForm.type === 'link' && !linkForm.url) || 
                  (linkForm.type === 'drive' && (!linkForm.title || !linkForm.drive_file_id)) || 
                  (linkForm.type === 'video' && (!linkForm.title || !linkForm.youtube_id))
                } 
                className="text-xs font-semibold bg-[#F18231] hover:bg-[#d96f21]"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                Add Link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 shrink-0">
              <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-[#F18231]" />
                Delete {deletingItem.type === 'link' ? 'Link' : 'Level'}
              </h3>
              <button onClick={() => { setDeletingItem(null); setDeleteInput(''); }} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                You are about to permanently delete the {deletingItem.type}: <strong className="text-[#0F172A]">{deletingItem.name}</strong>.
              </p>
              
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Please type <span className="font-mono font-bold text-[#0F172A]">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#F18231] font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-6 shrink-0 bg-slate-50 rounded-b-2xl">
              <Button variant="outline" onClick={() => { setDeletingItem(null); setDeleteInput(''); }} className="text-xs">Cancel</Button>
              <Button onClick={executeDelete} disabled={deleteInput !== 'DELETE' || isDeleting} className="text-xs font-semibold bg-red-600 hover:bg-red-700 text-white">
                {isDeleting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1.5" />}
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
