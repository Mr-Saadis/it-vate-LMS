'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Activity } from 'lucide-react'
import { FaGithub, FaLinkedin, FaYoutube } from 'react-icons/fa'

export function DarkFooter() {
  const pathname = usePathname()

  // Hide footer on login and signup pages
  if (pathname === '/login' || pathname === '/signup' || pathname === '/complete-profile') {
    return null
  }

  return (
    <footer className="border-t border-slate-800 bg-[#0b1120] text-slate-300">
      {/* Compact Main Footer Container */}
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* Column 1: Brand & Social */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Image src="/logo2.png" alt="IT-vate Icon" width={28} height={28} className="object-cover" />
              {/* <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm">
              </div> */}
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white tracking-tight">IT-vate Solutions</span>
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Platform & LMS</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pr-2">
              Empowering hardware & firmware engineers with accredited CPDP technical education and industry-grade track systems.
            </p>

            {/* Social Media Icons horizontally aligned right below brand description */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:border-[#F18231]/50 hover:bg-[#F18231]/10 hover:text-[#F18231] transition-colors"
              >
                <FaGithub className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:border-[#F18231]/50 hover:bg-[#F18231]/10 hover:text-[#F18231] transition-colors"
              >
                <FaLinkedin className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:border-[#F18231]/50 hover:bg-[#F18231]/10 hover:text-[#F18231] transition-colors"
              >
                <FaYoutube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#catalog" className="text-slate-400 hover:text-[#F18231] transition-colors">
                  All Courses
                </a>
              </li>
              <li>
                <a href="#tracks" className="text-slate-400 hover:text-[#F18231] transition-colors">
                  Track System
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="text-slate-400 hover:text-[#F18231] transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-[#F18231] transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Engineering Domains */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Engineering Domains
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#catalog" className="text-slate-400 hover:text-[#F18231] transition-colors">
                  Embedded C/C++
                </a>
              </li>
              <li>
                <a href="#catalog" className="text-slate-400 hover:text-[#F18231] transition-colors">
                  Firmware Engineering
                </a>
              </li>
              <li>
                <a href="#catalog" className="text-slate-400 hover:text-[#F18231] transition-colors">
                  PCB Layout & Design
                </a>
              </li>
              <li>
                <a href="#catalog" className="text-slate-400 hover:text-[#F18231] transition-colors">
                  Edge AI & IoT
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Support & Legal */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Support & Legal
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#" className="text-slate-400 hover:text-[#F18231] transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-[#F18231] transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-[#F18231] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-[#F18231] transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Compact Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/80 pt-6 gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} IT-vate Solutions. All rights reserved.
          </p>


        </div>

      </div>
    </footer>
  )
}
