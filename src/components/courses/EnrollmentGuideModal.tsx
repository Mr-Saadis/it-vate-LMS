'use client'

import React, { useState, useEffect } from 'react'
import { BookOpen, CheckCircle2, FileText, X, ChevronRight } from 'lucide-react'

interface EnrollmentGuideModalProps {
  children: React.ReactNode
}

export function EnrollmentGuideModal({ children }: EnrollmentGuideModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="inline-block cursor-pointer">
        {children}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="fixed inset-0" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          <div 
            className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header section */}
            <div className="bg-slate-900 p-6 sm:p-8 relative shrink-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F18231]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 pr-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
                  PDAT LMS Account Creation & <br className="hidden sm:block" />
                  <span className="text-[#F18231]">Course Enrollment Guide</span>
                </h2>
                <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                  Welcome to the PDAT Academy learning environment. This guide explains the process from creating your LMS account to receiving your confirmed enrollment.
                </p>
              </div>
            </div>

            {/* Content section */}
            <div className="p-6 sm:p-8 space-y-8 bg-slate-50 overflow-y-auto">
              
              {/* Section 1 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F18231] text-white font-bold shrink-0 shadow-md">1</span>
                  <h3 className="text-lg font-bold text-slate-900">Create Your PDAT LMS Account</h3>
                </div>
                <div className="pl-11 space-y-4">
                  <p className="text-sm text-slate-600">Before enrolling in a course, you need to create a personal account on the PDAT LMS.</p>
                  
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-[#F18231]/30">
                      <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-[#F18231]" /> Step 1 — Open the Sign-Up Page
                      </h4>
                      <p className="text-xs text-slate-600 mb-1 ml-6">Visit the PDAT LMS registration page.</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-[#F18231]/30">
                      <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-[#F18231]" /> Step 2 — Complete Your Profile
                      </h4>
                      <p className="text-xs text-slate-600 mb-2 ml-6">On the <strong className="text-slate-900">Your Profile</strong> page, provide the requested information:</p>
                      <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-10 marker:text-[#F18231]">
                        <li><strong>Full Name:</strong> Enter your complete name.</li>
                        <li><strong>Phone:</strong> Enter an active phone number that can be used to contact you.</li>
                        <li><strong>Academic Background:</strong> Enter or select your educational level and relevant academic background.</li>
                        <li><strong>Work Experience:</strong> This section is optional. You may add one or more work experiences if applicable.</li>
                      </ul>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-[#F18231]/30">
                      <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-[#F18231]" /> Step 3 — Choose Your Sign-In Method
                      </h4>
                      <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-10 marker:text-[#F18231]">
                        <li><strong>Continue with Google:</strong> Sign in using your Google account.</li>
                        <li><strong>Email and Password:</strong> Enter your email address and create a password.</li>
                      </ul>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-[#F18231]/30">
                      <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-[#F18231]" /> Step 4 — Create Your Account
                      </h4>
                      <p className="text-xs text-slate-600 ml-6">Complete the required account setup information and click <strong className="text-slate-900">Create Account</strong>.</p>
                      
                      <div className="mt-3 ml-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                        <BookOpen className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-red-900">Important</p>
                          <p className="text-[11px] text-red-700 mt-0.5">Creating an LMS account does not mean that you have enrolled in a course. After creating your account, you must complete the enrollment process.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="space-y-4 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F18231] text-white font-bold shrink-0 shadow-md">2</span>
                  <h3 className="text-lg font-bold text-slate-900">Enroll in a PDAT Academy Course</h3>
                </div>
                <div className="pl-11 space-y-4">
                  <p className="text-sm text-slate-600">Once you have created your LMS account, you can proceed with enrollment in your selected PDAT Academy course.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <span className="text-[#F18231]">1.</span> Open PDAT LMS
                      </h4>
                      <p className="text-[11px] text-slate-600 ml-4">Visit the LMS homepage.</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <span className="text-[#F18231]">2.</span> Select Course
                      </h4>
                      <p className="text-[11px] text-slate-600 ml-4">Click Configure Enrollment Track.</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <span className="text-[#F18231]">3.</span> Select Track
                      </h4>
                      <p className="text-[11px] text-slate-600 ml-4">Expert, Progressive, Fast, or Premium.</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <span className="text-[#F18231]">4.</span> Confirm Batch
                      </h4>
                      <p className="text-[11px] text-slate-600 ml-4">Select batch and review details.</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm text-white mt-4">
                    <h4 className="text-sm font-bold text-[#F18231] mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Final Steps — Payment Proof
                    </h4>
                    <div className="space-y-2">
                      <p className="text-xs text-slate-300"><strong className="text-white">Step 9:</strong> Enter your Transaction Reference / Deposit ID and upload a clear screenshot of your payment.</p>
                      <p className="text-xs text-slate-300"><strong className="text-white">Step 10:</strong> Submit the <strong className="text-white">Payment Verification Request</strong>.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="space-y-4 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F18231] text-white font-bold shrink-0 shadow-md">3</span>
                  <h3 className="text-lg font-bold text-slate-900">What Happens Next?</h3>
                </div>
                <div className="pl-11">
                  <p className="text-xs text-slate-600 mb-4">Submitting your payment information starts the payment verification process. The PDAT team will review your proof.</p>
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5">
                    <h4 className="text-sm font-bold text-emerald-900 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" /> After Successful Verification
                    </h4>
                    <ul className="text-xs text-emerald-800 space-y-2 list-disc pl-5 marker:text-emerald-500 leading-relaxed">
                      <li>Your enrollment in the selected course and batch will be confirmed.</li>
                      <li>A unique <strong className="text-emerald-900">Enrollment ID</strong> will be generated.</li>
                      <li>You will receive access to the relevant LMS Dashboard and learning materials.</li>
                      <li>You will receive an invitation to the Google Classroom, where applicable.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-6 pb-2 text-center">
                 <button onClick={() => setIsOpen(false)} className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
                   I understand, close guide
                 </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  )
}
