'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Cpu, Mail, Phone, MapPin } from 'lucide-react'

export function PortfolioFooter() {
  const pathname = usePathname()

  if (pathname === '/login' || pathname === '/signup') {
    return null
  }

  return (
    <footer className="border-t border-slate-200 bg-[#0F172A] text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white text-[#F18231]">
                <Image src="/logo1.jpg" alt="IT-vate Icon" width={40} height={40} className="object-cover" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                IT-vate <span className="text-[#F18231]">Solutions</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Engineering excellence in Embedded Systems, Industrial IoT, and Hardware R&D. Empowering next-generation engineers through industry-aligned technical education.
            </p>
          </div>

          {/* Col 2: Engineering Services */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Engineering Services</h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li><Link href="/services" className="hover:text-white transition-colors">Embedded Firmware (C/C++)</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Industrial IoT Gateways</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">High-Speed PCB Design</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Edge AI & Microcontrollers</Link></li>
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Platform & LMS</h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li><Link href="/courses" className="hover:text-white transition-colors">Browse Courses & Tracks</Link></li>
              <li><Link href="/sustainability" className="hover:text-white transition-colors">SDGs & Sustainability</Link></li>
              <li><Link href="/signup" className="hover:text-white transition-colors">Student Onboarding</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Student LMS Dashboard</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Admin Verification Portal</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Contact Us</h3>
            <Link href="/contact" className="flex items-center gap-2 text-xs hover:text-white transition-colors">
              <Mail className="h-4 w-4 text-[#F18231]" />
              <span>info@itvatesolutions.com</span>
            </Link>
            <div className="flex items-center gap-2 text-xs">
              <Phone className="h-4 w-4 text-[#F18231]" />
              <span>+92 300 0000000</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="h-4 w-4 text-[#F18231]" />
              <span>IT-vate R&D Center, Technology Park</span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} IT-vate Solutions. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="hover:text-slate-400">Contact Us</Link>
            <span className="hover:text-slate-400">Privacy Policy</span>
            <span className="hover:text-slate-400">Terms of Service</span>
            <span className="hover:text-slate-400">CPDP Accreditation</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
