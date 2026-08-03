'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Cpu, BookOpen, User } from 'lucide-react'

export function PortfolioNavbar() {
  const pathname = usePathname()

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
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center group">
          <Image src="/logo_h_c.png" alt="IT-vate Solutions" width={130} height={40} className="object-contain" />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
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

        {/* Auth / LMS Portal Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-[#0F172A] hover:text-[#F18231] transition-colors"
          >
            <User className="h-4 w-4" />
            Sign In
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F18231] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#d96f21] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F18231]"
          >
            <BookOpen className="h-4 w-4" />
            LMS Portal
          </Link>
        </div>
      </div>
    </header>
  )
}
