import { Globe, Leaf, Zap, ShieldCheck } from 'lucide-react'

export default function SustainabilityPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 space-y-16">
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">Sustainability Commitments</span>
        <h1 className="text-3xl font-extrabold text-[#0F172A] sm:text-4xl">
          Sustainable Hardware Engineering & UN SDGs Alignment
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          At IT-vate Solutions, we incorporate energy-efficient electronics, eco-friendly component sourcing, and UN Sustainable Development Goals into every R&D project.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <Leaf className="h-6 w-6 text-green-600" />
          <h3 className="text-base font-bold text-[#0F172A]">SDG 9: Industry & Innovation</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Building resilient industrial infrastructure and upgrading technological capabilities with sustainable IoT sensors.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <Zap className="h-6 w-6 text-[#F18231]" />
          <h3 className="text-base font-bold text-[#0F172A]">SDG 7: Affordable & Clean Energy</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Designing low-power ultra-deep-sleep microcontroller firmware to minimize energy usage in remote deployments.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <Globe className="h-6 w-6 text-blue-600" />
          <h3 className="text-base font-bold text-[#0F172A]">SDG 4: Quality Education</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ensuring accessible, practical engineering training to bridge the technical skills gap across developing regions.
          </p>
        </div>
      </div>
    </div>
  )
}
