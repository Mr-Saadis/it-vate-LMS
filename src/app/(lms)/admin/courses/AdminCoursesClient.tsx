'use client'

import { useState } from 'react'
import { Course, Level } from '@/lib/types'
import { Plus, Edit2, ShieldCheck, ChevronDown, ChevronUp, Layers, Save, X, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { createCourseAction, updateCourseAction, createLevelAction, updateLevelAction, deleteCourseAction, deleteLevelAction } from '@/lib/actions/courses'

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
  
  // Expanded courses for showing levels
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({})

  // Modals state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false)
  const [editingLevel, setEditingLevel] = useState<{ level: Level | null, courseId: string } | null>(null)

  // Toggle levels view
  const toggleCourseExpanded = (courseId: string) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }))
  }

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
        if (res.success) {
          toast.success('Course deleted successfully')
        } else {
          toast.error(res.error || 'Failed to delete course')
        }
      } else {
        const res = await deleteLevelAction(deletingItem.id)
        if (res.success) {
          toast.success('Level deleted successfully')
        } else {
          toast.error(res.error || 'Failed to delete level')
        }
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {courses.map((course) => (
              <div key={course.course_id} className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md">
                <div className="p-4 flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A] leading-tight pr-2">
                        {course.name}
                      </h3>
                      <span className="mt-1 block text-[10px] font-bold uppercase text-[#F18231]">
                        {course.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => openEditCourse(course)} className="h-7 w-7 text-slate-400 hover:text-[#F18231]">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setDeletingItem({ type: 'course', id: course.course_id, name: course.name }); setDeleteInput(''); }} className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{course.description}</p>
                  
                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider pt-1">
                    <div className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-[#F18231]" />
                      {course.levels?.length || 0} Levels
                    </div>
                    {!course.is_active && (
                      <span className="text-red-500">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 bg-slate-50/50">
                  <button 
                    onClick={() => toggleCourseExpanded(course.course_id)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-bold text-slate-500 hover:text-[#F18231] hover:bg-[#F18231]/5 transition-colors"
                  >
                    <span>Manage Levels</span>
                    {expandedCourses[course.course_id] ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                  
                  {expandedCourses[course.course_id] && (
                    <div className="px-4 pb-4 space-y-2 animate-in slide-in-from-top-1 duration-200">
                      <div className="space-y-1.5">
                        {course.levels?.sort((a, b) => a.no - b.no).map((level) => (
                          <div key={level.level_id} className="flex items-center justify-between rounded-md border border-slate-100 bg-white px-3 py-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-extrabold uppercase text-slate-400">LVL {level.no}</span>
                                <span className="text-xs font-semibold text-[#0F172A]">{level.level_title}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                                <span>{level.code}</span>
                                <span>•</span>
                                <span>PKR {level.price}</span>
                                {!level.is_active && <span className="text-red-400 font-semibold">(Inactive)</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button variant="ghost" size="sm" onClick={() => openEditLevel(level, course.course_id)} className="h-6 px-2 text-[10px] text-slate-400 hover:text-[#F18231]">
                                Edit
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => { setDeletingItem({ type: 'level', id: level.level_id, name: level.level_title }); setDeleteInput(''); }} className="h-6 px-2 text-[10px] text-slate-400 hover:text-red-500 hover:bg-red-50">
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Button variant="ghost" size="sm" onClick={() => openAddLevel(course.course_id)} className="w-full h-7 text-[10px] text-[#F18231] border border-[#F18231]/20 border-dashed hover:bg-[#F18231]/10 hover:text-[#d96f21] mt-1">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Level
                      </Button>
                    </div>
                  )}
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
