'use client'

import { useState } from 'react'
import { Course, Level } from '@/lib/types'
import { Plus, Edit2, ShieldCheck, ChevronDown, ChevronUp, Layers, Save, X, Loader2, Trash2, BookOpen, Clock, BarChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import { createCourseAction, updateCourseAction, createLevelAction, updateLevelAction, deleteCourseAction, deleteLevelAction } from '@/lib/actions/courses'
import { createClassroomLinkAction, deleteClassroomLinkAction } from '@/lib/actions/content_items'

interface AdminCoursesClientProps {
  initialCourses: Course[]
}

export function AdminCoursesClient({ initialCourses }: AdminCoursesClientProps) {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setCourses(initialCourses)
  }, [initialCourses])
  
  // Delete Confirmation State
  const [deletingItem, setDeletingItem] = useState<{ type: 'course' | 'level', id: string, name: string } | null>(null)
  const [deleteInput, setDeleteInput] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Modals state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false)

  // Link Modal state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkTarget, setLinkTarget] = useState<{ levelId: string, courseSlug: string, levelNo: number } | null>(null)
  const [linkForm, setLinkForm] = useState({
    year: new Date().getFullYear().toString(),
    month: String(new Date().getMonth() + 1).padStart(2, '0'),
    url: ''
  })

  // Generate ID helper
  const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substring(2, 9)}`

  // Course Form State
  const [courseForm, setCourseForm] = useState({
    name: '',
    description: '',
    category: '',
    slug: '',
    is_active: true
  })

  // Level Form State
  const [levelForm, setLevelForm] = useState({
    level_title: '',
    level_description: '',
    price: 0,
    no: 1,
    code: '',
    is_active: true
  })

  const openAddCourse = () => {
    setCourseForm({ name: '', description: '', category: '', slug: '', is_active: true })
    setEditingCourse(null)
    setIsCourseModalOpen(true)
  }

  const openEditCourse = (course: Course) => {
    setCourseForm({
      name: course.name,
      description: course.description,
      category: course.category,
      slug: course.slug,
      is_active: course.is_active
    })
    setEditingCourse(course)
    setIsCourseModalOpen(true)
  }

  const openAddLevel = (courseId: string) => {
    const course = courses.find(c => c.course_id === courseId)
    const nextNo = course?.levels ? course.levels.length + 1 : 1
    setLevelForm({ level_title: '', level_description: '', price: 0, no: nextNo, code: '', is_active: true })
    setEditingLevel({ level: null, courseId })
    setIsLevelModalOpen(true)
  }

  const openEditLevel = (level: Level, courseId: string) => {
    setLevelForm({
      level_title: level.level_title,
      level_description: level.level_description || '',
      price: level.price,
      no: level.no,
      code: level.code,
      is_active: level.is_active
    })
    setEditingLevel({ level, courseId })
    setIsLevelModalOpen(true)
  }

  const saveCourse = async () => {
    setIsSaving(true)
    try {
      if (editingCourse) {
        const res = await updateCourseAction(editingCourse.course_id, courseForm)
        if (res.success) {
          toast.success('Course updated')
          setIsCourseModalOpen(false)
          router.refresh()
        } else {
          toast.error(res.error || 'Failed to update course')
        }
      } else {
        const res = await createCourseAction(courseForm)
        if (res.success) {
          toast.success('Course added')
          setIsCourseModalOpen(false)
          router.refresh()
        } else {
          toast.error(res.error || 'Failed to add course')
        }
      }
    } catch (e: any) {
      toast.error(e.message || 'An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const saveLevel = async () => {
    if (!editingLevel) return
    setIsSaving(true)
    try {
      const { level, courseId } = editingLevel
      if (level) {
        // Edit existing level
        const res = await updateLevelAction(level.level_id, levelForm)
        if (res.success) {
          toast.success('Level updated')
          setIsLevelModalOpen(false)
          router.refresh()
        } else {
          toast.error(res.error || 'Failed to update level')
        }
      } else {
        // Add new level
        const res = await createLevelAction({ ...levelForm, course_id: courseId })
        if (res.success) {
          toast.success('Level added')
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

  const executeDelete = async () => {
    if (!deletingItem || deleteInput !== 'DELETE') return
    setIsDeleting(true)
    try {
      if (deletingItem.type === 'course') {
        const res = await deleteCourseAction(deletingItem.id)
        if (res.success) toast.success('Course deleted')
        else toast.error(res.error || 'Failed to delete course')
      } else if (deletingItem.type === 'level') {
        const res = await deleteLevelAction(deletingItem.id)
        if (res.success) toast.success('Level deleted')
        else toast.error(res.error || 'Failed to delete level')
      } else if (deletingItem.type === 'link') {
        const res = await deleteClassroomLinkAction(deletingItem.id)
        if (res.success) toast.success('Link deleted')
        else toast.error(res.error || 'Failed to delete link')
      }
      setDeletingItem(null)
      setDeleteInput('')
      router.refresh()
    } catch (e: any) {
      toast.error(e.message || 'An error occurred during deletion')
    } finally {
      setIsDeleting(false)
    }
  }

  const openAddLink = (levelId: string, courseSlug: string, levelNo: number) => {
    setLinkTarget({ levelId, courseSlug, levelNo })
    setLinkForm({
      year: new Date().getFullYear().toString(),
      month: String(new Date().getMonth() + 1).padStart(2, '0'),
      url: ''
    })
    setIsLinkModalOpen(true)
  }
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded bg-[#0F172A] px-2 py-0.5 text-[10px] font-bold tracking-widest text-white uppercase">Admin</span>
            <span className="text-xs text-slate-400 font-medium">/ Courses</span>
          </div>
          <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Manage Courses & Tracks
          </h1>
          <p className="text-[11px] text-slate-500 mt-1">
            Create and edit courses, add levels, and manage curriculum configurations.
          </p>
        </div>
        <Button onClick={openAddCourse} className="h-9 px-4 bg-[#F18231] hover:bg-[#d96f21] text-[11px] font-bold shadow-sm shrink-0">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Course
        </Button>
      </div>

      {/* Courses List */}
      <div className="space-y-6">
        {courses.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <ShieldCheck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#0F172A]">No courses found</p>
            <p className="text-xs text-slate-500 mt-1">Get started by creating your first course.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.course_id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#F18231]/50 hover:shadow-xl focus-within:ring-2 focus-within:ring-[#F18231]/40 h-full"
              >
                <Link href={`/admin/courses/${course.course_id}`} className="block space-y-4">
                  {/* Category badge + level count */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#F18231]">
                      <BookOpen className="h-3.5 w-3.5 text-[#F18231]" />
                      {course.category || 'Engineering'}
                    </span>
                    <span className="rounded-full bg-slate-50 border border-slate-200/80 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                      {course.levels?.length ?? 0} Levels
                    </span>
                  </div>

                  {/* Title + description */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#F18231] transition-colors leading-snug">
                      {course.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                      {course.description}
                    </p>
                  </div>

                  {/* Micro-Badges & Course Metadata */}
                  <div className="flex items-center gap-4 text-slate-500 pt-1">
                    <div className="flex items-center gap-1 text-[11px] font-medium">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>8–12 Weeks</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-medium">
                      <BarChart className="h-3.5 w-3.5 text-slate-400" />
                      <span>Interm. to Adv.</span>
                    </div>
                  </div>

                  {/* Level list curriculum breakdown */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Curriculum Levels:
                    </span>
                    <ul className="space-y-1.5">
                      {course.levels?.sort((a, b) => a.no - b.no).map((lvl) => (
                        <li
                          key={lvl.level_id}
                          className="flex items-center justify-between text-xs text-slate-700 bg-slate-50 rounded-lg px-2.5 py-1.5 group/level"
                        >
                          <span className="truncate pr-2 font-medium">Level {lvl.no}: {lvl.level_title}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-[#0F172A]">
                              PKR {lvl.price.toLocaleString()}
                            </span>
                            <button 
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeletingItem({ type: 'level', id: lvl.level_id, name: lvl.level_title }); setDeleteInput(''); }} 
                              className="text-slate-300 hover:text-red-500 transition-colors hidden group-hover/level:block"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </li>
                      ))}
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); openAddLevel(course.course_id); }}
                        className="w-full flex items-center justify-center gap-1 text-[10px] font-bold text-[#F18231] py-1.5 rounded-lg border border-dashed border-[#F18231]/30 hover:bg-[#F18231]/5 transition-colors"
                      >
                        <Plus className="h-3 w-3" /> Add Level
                      </button>
                    </ul>
                  </div>
                </Link>

                {/* Mandatory Primary Full-Width Action Button with Focus Ring */}
                <div className="pt-5 flex items-center gap-2">
                  <Button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditCourse(course); }}
                    className="inline-flex w-full flex-1 items-center justify-center gap-2 rounded-xl bg-[#0F172A] h-[40px] text-xs font-semibold text-white transition-colors hover:bg-[#F18231] shadow-sm focus-visible:ring-2 focus-visible:ring-[#F18231] focus-visible:outline-none"
                  >
                    Edit Course
                  </Button>
                  <Button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeletingItem({ type: 'course', id: course.course_id, name: course.name }); setDeleteInput(''); }}
                    className="inline-flex items-center justify-center rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors h-[40px] px-3 shadow-sm focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course Form Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 shrink-0">
              <h3 className="text-lg font-bold text-[#0F172A]">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h3>
              <button onClick={() => setIsCourseModalOpen(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Course Name
                </label>
                <input
                  type="text"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] placeholder-slate-400 focus:border-[#F18231] focus:outline-none focus:ring-1 focus:ring-[#F18231]"
                />
              </div>
              
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Category
                </label>
                <input
                  type="text"
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  placeholder="e.g. Hardware Engineering"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] placeholder-slate-400 focus:border-[#F18231] focus:outline-none focus:ring-1 focus:ring-[#F18231]"
                />
              </div>
              
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Slug URL
                </label>
                <input
                  type="text"
                  value={courseForm.slug}
                  onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })}
                  placeholder="e.g. embedded-systems"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] placeholder-slate-400 focus:border-[#F18231] focus:outline-none focus:ring-1 focus:ring-[#F18231]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] placeholder-slate-400 focus:border-[#F18231] focus:outline-none focus:ring-1 focus:ring-[#F18231] resize-none"
                />
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="courseActive"
                  checked={courseForm.is_active}
                  onChange={(e) => setCourseForm({ ...courseForm, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-[#F18231] focus:ring-[#F18231]"
                />
                <label htmlFor="courseActive" className="text-sm font-semibold text-[#0F172A]">
                  Active (Visible to students)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-6 shrink-0 bg-slate-50 rounded-b-2xl">
              <Button variant="outline" onClick={() => setIsCourseModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button onClick={saveCourse} disabled={isSaving} className="text-xs font-semibold bg-[#F18231] hover:bg-[#d96f21]">
                {isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                {editingCourse ? 'Save Changes' : 'Create Course'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Level Form Modal */}
      {isLevelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 shrink-0">
              <h3 className="text-lg font-bold text-[#0F172A]">
                {editingLevel?.level ? 'Edit Level' : 'Add New Level'}
              </h3>
              <button onClick={() => setIsLevelModalOpen(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Level Number
                  </label>
                  <input
                    type="number"
                    value={levelForm.no}
                    onChange={(e) => setLevelForm({ ...levelForm, no: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] focus:border-[#F18231] focus:outline-none focus:ring-1 focus:ring-[#F18231]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Level Code
                  </label>
                  <input
                    type="text"
                    value={levelForm.code}
                    onChange={(e) => setLevelForm({ ...levelForm, code: e.target.value })}
                    placeholder="e.g. EMB-L1"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] focus:border-[#F18231] focus:outline-none focus:ring-1 focus:ring-[#F18231]"
                  />
                </div>
              </div>
              
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Level Title
                </label>
                <input
                  type="text"
                  value={levelForm.level_title}
                  onChange={(e) => setLevelForm({ ...levelForm, level_title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] focus:border-[#F18231] focus:outline-none focus:ring-1 focus:ring-[#F18231]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={levelForm.level_description}
                  onChange={(e) => setLevelForm({ ...levelForm, level_description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] focus:border-[#F18231] focus:outline-none focus:ring-1 focus:ring-[#F18231] resize-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Price (PKR)
                </label>
                <input
                  type="number"
                  value={levelForm.price}
                  onChange={(e) => setLevelForm({ ...levelForm, price: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] focus:border-[#F18231] focus:outline-none focus:ring-1 focus:ring-[#F18231]"
                />
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="levelActive"
                  checked={levelForm.is_active}
                  onChange={(e) => setLevelForm({ ...levelForm, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-[#F18231] focus:ring-[#F18231]"
                />
                <label htmlFor="levelActive" className="text-sm font-semibold text-[#0F172A]">
                  Active Level
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-6 shrink-0 bg-slate-50 rounded-b-2xl">
              <Button variant="outline" onClick={() => setIsLevelModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button onClick={saveLevel} disabled={isSaving} className="text-xs font-semibold bg-[#F18231] hover:bg-[#d96f21]">
                {isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                {editingLevel?.level ? 'Save Changes' : 'Create Level'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 shrink-0">
              <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-[#F18231]" />
                Delete {deletingItem.type === 'course' ? 'Course' : 'Level'}
              </h3>
              <button onClick={() => { setDeletingItem(null); setDeleteInput(''); }} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                You are about to permanently delete the {deletingItem.type}: <strong className="text-[#0F172A]">{deletingItem.name}</strong>. This action cannot be undone.
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#0F172A] placeholder:text-slate-400 focus:border-[#F18231] focus:outline-none focus:ring-1 focus:ring-[#F18231] font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-6 shrink-0 bg-slate-50 rounded-b-2xl">
              <Button variant="outline" onClick={() => { setDeletingItem(null); setDeleteInput(''); }} className="text-xs">
                Cancel
              </Button>
              <Button 
                onClick={executeDelete} 
                disabled={deleteInput !== 'DELETE' || isDeleting} 
                className="text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white"
              >
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
