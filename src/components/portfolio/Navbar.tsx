'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Cpu, BookOpen, User, Menu, X } from 'lucide-react'

export function PortfolioNavbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Sustainability', href: '/sustainability' },
    { label: 'Courses & Tracks', href: '/courses' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">

        {/* Brand Logo */}
        <Link href="/" className="flex items-center group shrink-0">
          <Image src="/logo_h_c.png" alt="PDAT Academy" width={120} height={36} className="object-contain" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-[#F18231] font-semibold'
                    : 'text-slate-700 hover:text-[#0F172A]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Auth Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0F172A] hover:text-[#F18231] transition-colors"
          >
            <User className="h-4 w-4" />
            Sign In
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F18231] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#d96f21]"
          >
            <BookOpen className="h-4 w-4" />
            LMS Portal
          </Link>
        </div>

        {/* Mobile: LMS button + Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#F18231] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#d96f21] transition-colors"
          >
            <Cpu className="h-3.5 w-3.5" />
            LMS
          </Link>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white/98 backdrop-blur-sm px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-[#F18231] bg-[#F18231]/5 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-[#0F172A]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}

          {/* Mobile auth divider */}
          <div className="h-px bg-slate-100 my-2" />
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#F18231] transition-colors"
          >
            <User className="h-4 w-4" />
            Sign In
          </Link>
        </div>
      )}
    </header>
  )
}
