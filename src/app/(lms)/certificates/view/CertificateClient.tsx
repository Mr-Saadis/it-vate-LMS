'use client'

import { useRef, useState } from 'react'
import { ArrowLeft, Download, Award, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface CertificateClientProps {
  type: 'level' | 'course'
  studentName: string
  courseName: string
  levelName?: string
  issueDate: string
  certificateId: string
}

export function CertificateClient({ 
  type, 
  studentName, 
  courseName, 
  levelName, 
  issueDate, 
  certificateId 
}: CertificateClientProps) {
  const certificateRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!certificateRef.current) return
    setIsDownloading(true)
    
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // High resolution
        backgroundColor: '#ffffff',
      })
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0)
      
      // A4 Landscape: 297mm x 210mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })
      
      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210)
      pdf.save(`${studentName.replace(/\s+/g, '_')}_${type === 'course' ? 'Course' : 'Level'}_Certificate.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const formattedDate = new Date(issueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-20">
      <div className="mx-auto max-w-[1123px] space-y-6">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link 
            href="/certificates"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Certificates
          </Link>
          
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F18231] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#d96f21] transition-colors shadow-sm disabled:opacity-70"
          >
            {isDownloading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Generating PDF...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </span>
            )}
          </button>
        </div>

        {/* Certificate Container (A4 Landscape Aspect Ratio) */}
        <div className="overflow-x-auto pb-8 hide-scrollbar flex justify-center">
          <div 
            ref={certificateRef}
            className="shrink-0 w-[1123px] h-[794px] bg-white relative overflow-hidden"
            style={{ 
              boxShadow: '0 0 20px rgba(0,0,0,0.05)',
              // Scale down visually for smaller screens while keeping exact pixel dimensions for html2canvas
              transformOrigin: 'top center',
            }}
          >
            {/* Elegant Borders */}
            <div className="absolute inset-4 border-[3px] border-[#0F172A]"></div>
            <div className="absolute inset-5 border border-slate-200"></div>
            
            {/* Decorative Corners */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-[6px] border-l-[6px] border-[#F18231]"></div>
            <div className="absolute top-4 right-4 w-12 h-12 border-t-[6px] border-r-[6px] border-[#F18231]"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-[6px] border-l-[6px] border-[#F18231]"></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-[6px] border-r-[6px] border-[#F18231]"></div>

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0F172A 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center z-10">
              {/* Header */}
              <div className="mb-8 flex flex-col items-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0F172A] shadow-xl mb-6">
                  <span className="text-3xl font-black text-[#F18231]">IT</span>
                </div>
                <h1 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#0F172A]">
                  IT-vate Learning Management System
                </h1>
              </div>

              {/* Title */}
              <div className="mb-12">
                <h2 className="text-6xl font-black text-[#0F172A] uppercase tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  Certificate of Completion
                </h2>
                <div className="mt-4 flex items-center justify-center gap-4">
                  <div className="h-px w-24 bg-slate-300"></div>
                  <Award className="h-6 w-6 text-[#F18231]" />
                  <div className="h-px w-24 bg-slate-300"></div>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-6 max-w-3xl">
                <p className="text-lg font-medium text-slate-500 uppercase tracking-widest">
                  This is to certify that
                </p>
                <h3 className="text-5xl font-extrabold text-[#F18231] tracking-tight">
                  {studentName}
                </h3>
                <p className="text-lg font-medium text-slate-500 leading-relaxed max-w-2xl mx-auto">
                  has successfully completed the requirements for the 
                  <br />
                  <strong className="text-2xl text-[#0F172A] mt-2 block font-black">
                    {type === 'course' ? `${courseName} - Complete Course` : `${courseName}: ${levelName}`}
                  </strong>
                </p>
              </div>

              {/* Footer */}
              <div className="absolute bottom-24 left-24 right-24 flex items-end justify-between">
                {/* Date/ID Info */}
                <div className="text-left space-y-1">
                  <div className="border-b-2 border-slate-300 pb-2 mb-2 w-48">
                    <p className="text-lg font-bold text-[#0F172A]">{formattedDate}</p>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Date of Issue</p>
                  <p className="text-[10px] font-bold text-slate-300 mt-2">ID: {certificateId}</p>
                </div>

                {/* Seal */}
                <div className="flex flex-col items-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-[4px] border-dashed border-[#F18231] bg-orange-50">
                    <ShieldCheck className="h-10 w-10 text-[#F18231]" />
                  </div>
                  <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Official Seal</p>
                </div>

                {/* Signature */}
                <div className="text-center space-y-1">
                  <div className="border-b-2 border-slate-300 pb-2 mb-2 w-48 flex justify-center">
                    <span className="text-3xl font-black text-[#0F172A]" style={{ fontFamily: 'Brush Script MT, cursive' }}>Director</span>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Course Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CSS for scaling the certificate preview on smaller screens without affecting html2canvas */}
        <style dangerouslySetInnerHTML={{__html: `
          @media (max-width: 1200px) {
            .overflow-x-auto > div {
              transform: scale(0.8);
              margin-bottom: -150px;
            }
          }
          @media (max-width: 900px) {
            .overflow-x-auto > div {
              transform: scale(0.6);
              margin-bottom: -300px;
            }
          }
          @media (max-width: 600px) {
            .overflow-x-auto > div {
              transform: scale(0.4);
              margin-bottom: -450px;
              margin-left: -100px;
            }
          }
        `}} />
      </div>
    </div>
  )
}
