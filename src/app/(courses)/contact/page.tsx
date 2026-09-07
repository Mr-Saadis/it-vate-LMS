import { Mail, MapPin, Phone, Clock, Globe } from 'lucide-react'

export const metadata = {
  title: 'Contact Us | PDAT Academy',
  description: 'Get in touch with PDAT Academy for inquiries about our engineering courses.',
}

const contactCards = [
  {
    icon: Mail,
    label: 'Email',
    value: 'info@it-vate.com',
    sub: 'We reply within 24 hours',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+92 (XXX) XXXXXXX',
    sub: 'Mon – Fri, 9am – 6pm PKT',
  },
  {
    icon: MapPin,
    label: 'Office',
    value: 'PDAT Academy Hub',
    sub: 'Pakistan',
  },
  {
    icon: Clock,
    label: 'Working Hours',
    value: 'Mon – Fri',
    sub: '9:00 AM – 6:00 PM PKT',
  },
  {
    icon: Globe,
    label: 'Social Media',
    value: '@itvate',
    sub: 'LinkedIn · YouTube',
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-12 text-center space-y-3">
          <span className="inline-flex items-center rounded-full bg-orange-50 border border-orange-200 px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-[#F18231]">
            Contact Us
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl">
            Get in Touch
          </h1>
          <p className="text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
            Have questions about our programs or need guidance on picking the right track? We&apos;re here to help.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contactCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.label}
                className="group rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-[#F18231]/30 transition-all duration-200"
              >
                {/* Icon */}
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-orange-50 group-hover:text-[#F18231] transition-colors duration-200">
                  <Icon className="h-5 w-5" />
                </div>

                {/* Label */}
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  {card.label}
                </p>

                {/* Value */}
                <p className="text-sm font-bold text-[#0F172A]">{card.value}</p>

                {/* Sub */}
                <p className="mt-1 text-xs text-slate-500">{card.sub}</p>
              </div>
            )
          })}
        </div>

        {/* CTA Banner */}
        <div className="mt-10 rounded-[20px] bg-[#0F172A] p-8 md:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Still have questions?</p>
            <h2 className="text-lg font-extrabold text-white">
              Browse our FAQ for quick answers
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Find answers about tracks, certificates, payments, and more.
            </p>
          </div>
          <a
            href="/faq"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#F18231] px-6 py-3 text-sm font-bold text-white hover:bg-orange-500 transition-colors"
          >
            View FAQ
            <span aria-hidden="true">→</span>
          </a>
        </div>

      </div>
    </div>
  )
}
