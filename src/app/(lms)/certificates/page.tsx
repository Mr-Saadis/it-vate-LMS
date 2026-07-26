'use client'

import { Award, Download, ShieldCheck } from 'lucide-react'

export default function CertificatesPage() {
  const certificates = [
    {
      id: 'CERT-8812',
      course_name: 'Embedded Systems & Firmware Engineering',
      level_title: 'Level 1: C/C++ Bare Metal Programming & GPIO',
      issue_date: '2026-06-15',
      cpdp_no: 'CPDP202607001',
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">Student Accreditation</span>
        <h1 className="text-2xl font-bold text-[#0F172A]">Issued Certificates & CPDP Credentials</h1>
        <p className="text-xs text-slate-600">
          View and download your official CPDP-accredited certificates of completion.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {certificates.map((cert) => (
          <div key={cert.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#0F172A] text-[#F18231] flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Certificate of Completion</h3>
                  <span className="font-mono text-[11px] text-slate-400">ID: {cert.id}</span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-800">
                <ShieldCheck className="h-3 w-3" /> Verified
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-slate-500">Issued To: <span className="font-bold text-[#0F172A]">Saad Ali</span></div>
              <div className="text-slate-500">Course: <span className="font-bold text-[#0F172A]">{cert.course_name}</span></div>
              <div className="text-slate-500">Module: <span className="font-semibold text-[#F18231]">{cert.level_title}</span></div>
              <div className="text-slate-500">CPDP Registration: <span className="font-mono font-bold text-[#0F172A]">{cert.cpdp_no}</span></div>
              <div className="text-slate-500">Issue Date: <span>{cert.issue_date}</span></div>
            </div>

            <button
              onClick={() => alert(`Downloading CPDP Certificate ${cert.id}...`)}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#F18231] py-2.5 text-xs font-semibold text-white hover:bg-[#d96f21] transition-colors"
            >
              <Download className="h-4 w-4" /> Download PDF Certificate
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
