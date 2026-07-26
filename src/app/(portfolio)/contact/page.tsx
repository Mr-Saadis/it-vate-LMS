import { Mail, Phone, MapPin, Send, Cpu } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 space-y-12">
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">Get in Touch</span>
        <h1 className="text-3xl font-extrabold text-[#0F172A] sm:text-4xl">
          Contact IT-vate Engineering R&D Team
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Have questions about our custom hardware engineering services, Industrial IoT consulting, or CPDP accredited course enrollment? Send us a message.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Contact Info Card */}
        <div className="rounded-xl border border-slate-200 bg-[#0F172A] p-8 text-white space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-800 text-[#F18231] flex items-center justify-center">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">IT-vate Solutions</h3>
              <span className="text-xs text-slate-400">Headquarters & R&D Lab</span>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-300 border-t border-slate-800 pt-6">
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-[#F18231] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Email Consultation:</span>
                <p className="text-slate-400">info@itvatesolutions.com</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-[#F18231] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Phone / WhatsApp:</span>
                <p className="text-slate-400">+92 300 0000000</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-[#F18231] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">R&D Center Address:</span>
                <p className="text-slate-400">IT-vate R&D Center, Technology Park, Innovation District</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form className="rounded-xl border border-slate-200 bg-white p-8 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-[#0F172A]">Send an Inquiry</h3>

          <div>
            <label className="text-xs font-semibold text-[#0F172A]">Your Name</label>
            <input
              type="text"
              required
              placeholder="Engr. Saad"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#F18231] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#0F172A]">Email Address</label>
            <input
              type="email"
              required
              placeholder="saad@example.com"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#F18231] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#0F172A]">Subject</label>
            <input
              type="text"
              required
              placeholder="Course Enrollment / Hardware R&D Inquiry"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#F18231] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#0F172A]">Message</label>
            <textarea
              rows={4}
              required
              placeholder="Describe your requirements or inquiry..."
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[#F18231] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#F18231] py-3 text-xs font-semibold text-white hover:bg-[#d96f21] transition-colors"
          >
            Submit Message
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  )
}
