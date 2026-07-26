import { Cpu, ShieldCheck, Target, Award } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">About IT-vate Solutions</span>
        <h1 className="text-3xl font-extrabold text-[#0F172A] sm:text-4xl">
          Pioneering Hardware R&D & High-Impact Engineering Education
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          IT-vate Solutions is an engineering hardware firm and technical learning provider specializing in Embedded Systems, Industrial Internet of Things (IoT), and high-speed electronic design.
        </p>
      </div>

      {/* Vision & Values Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <div className="h-10 w-10 rounded-lg bg-slate-100 text-[#0F172A] flex items-center justify-center">
            <Target className="h-5 w-5 text-[#F18231]" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">Engineering Precision</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We operate at the intersection of physical hardware and firmware, ensuring reliability and industrial compliance.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <div className="h-10 w-10 rounded-lg bg-slate-100 text-[#0F172A] flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-[#F18231]" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">CPDP Accreditation</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Our course curricula align with professional engineering development standards, issuing unique CPDP IDs upon verification.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <div className="h-10 w-10 rounded-lg bg-slate-100 text-[#0F172A] flex items-center justify-center">
            <Award className="h-5 w-5 text-[#F18231]" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">Practical Mastery</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Students solve industry problems using actual hardware platforms, logic analyzers, oscilloscopes, and real-time operating systems.
          </p>
        </div>
      </div>
    </div>
  )
}
