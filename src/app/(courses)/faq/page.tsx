'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle, BookOpen, CreditCard, Award, Users, Zap } from 'lucide-react'

const faqs = [
  {
    icon: Zap,
    category: 'Platform',
    question: 'What is the 4-Track System?',
    answer:
      'Our 4-Track System includes the Expert, Progressive, Fast, and Premium tracks. This allows you to choose an enrollment pathway tailored to your learning pace and prior experience.',
  },
  {
    icon: BookOpen,
    category: 'Courses',
    question: 'Are these courses suitable for beginners?',
    answer:
      'Yes, our programs start from the fundamentals. However, the Progressive Track is best suited for beginners as it unlocks content sequentially to ensure foundational understanding.',
  },
  {
    icon: Award,
    category: 'Certificates',
    question: 'Do you provide certificates?',
    answer:
      'Yes, all our engineering courses are CPDP accredited, and you will receive a verifiable certificate upon successful completion that you can share on LinkedIn or your portfolio.',
  },
  {
    icon: CreditCard,
    category: 'Payments',
    question: 'What payment methods are supported?',
    answer:
      'We support major credit/debit cards and local payment methods via our secure checkout gateway. All transactions are encrypted and processed securely.',
  },
  {
    icon: Users,
    category: 'Mentorship',
    question: 'Is there any mentorship available?',
    answer:
      'Yes, our Premium Track includes 1-on-1 mentorship, live code reviews, and direct debugging sessions with expert instructors to accelerate your growth.',
  },
  {
    icon: HelpCircle,
    category: 'Support',
    question: 'How do I get help if I am stuck?',
    answer:
      'You can reach our support team via the in-dashboard chat, email us at info@it-vate.com, or post in our student community forum where instructors actively participate.',
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        {/* Hero Header */}
        <div className="mb-14 text-center space-y-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F18231] to-amber-400 text-white shadow-lg shadow-orange-200 mb-3">
            <HelpCircle className="h-7 w-7" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-semibold text-[#F18231] uppercase tracking-widest">
            Got Questions?
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl">
            Frequently Asked{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#F18231]">Questions</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-orange-100 -z-0 rounded" />
            </span>
          </h1>
          <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
            Find quick answers to the most common questions about our platform, tracks, and courses.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const Icon = faq.icon
            const isOpen = openIndex === index

            return (
              <div
                key={index}
                className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'border-[#F18231]/40 bg-white shadow-md shadow-orange-100'
                    : 'border-slate-200 bg-white hover:border-[#F18231]/20 hover:shadow-sm'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  {/* Icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                      isOpen
                        ? 'bg-gradient-to-br from-[#F18231] to-amber-400 text-white shadow-sm shadow-orange-200'
                        : 'bg-slate-100 text-slate-400 group-hover:bg-orange-50 group-hover:text-[#F18231]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      {faq.category}
                    </span>
                    <p className={`mt-0.5 text-sm font-bold leading-snug transition-colors ${isOpen ? 'text-[#0F172A]' : 'text-slate-700'}`}>
                      {faq.question}
                    </p>
                  </div>

                  {/* Chevron */}
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#F18231]' : ''
                    }`}
                  />
                </button>

                {/* Answer panel */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6 ml-14">
                    <div className="h-px w-full bg-slate-100 mb-4" />
                    <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-[#0F172A] to-[#1e293b] p-8 text-center">
          <p className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-widest">Still confused?</p>
          <h2 className="text-xl font-bold text-white mb-2">We&apos;re just a message away</h2>
          <p className="text-slate-400 text-sm mb-5 max-w-xs mx-auto">
            Our support team is ready to help you pick the right track and get started.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-[#F18231] px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 transition-colors"
          >
            Contact Us <span aria-hidden="true">→</span>
          </a>
        </div>

      </div>
    </div>
  )
}
