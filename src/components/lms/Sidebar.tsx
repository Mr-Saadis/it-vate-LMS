'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Award, Compass, ShieldCheck, Cpu, LogOut, ExternalLink } from 'lucide-react'

export function LMSSidebar() {
  const pathname = usePathname()

  const navItems = [
    { label: 'Dashboard Main', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Certificates', href: '/certificates', icon: Award },
    { label: 'Discover Courses', href: '/discover', icon: Compass },
    { label: 'Admin Panel', href: '/admin', icon: ShieldCheck },
  ]

  return (
    <aside className="w-64 shrink-0 bg-[#0F172A] text-slate-300 min-h-screen flex flex-col justify-between p-6 border-r border-slate-800">
      <div className="space-y-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-[#F18231]">
            <Cpu className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-white tracking-tight">
              IT-vate <span className="text-[#F18231]">LMS</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Student Secured Portal
            </span>
          </div>
        </Link>

        {/* Menu Navigation */}
        <nav className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3">
            Menu Navigation
          </span>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#F18231] text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer Info / Logout */}
      <div className="border-t border-slate-800 pt-4 space-y-3">
        <div className="rounded-lg bg-slate-800/60 p-3 space-y-1">
          <span className="text-[10px] font-bold text-[#F18231] uppercase">CPDP ID</span>
          <p className="text-xs font-mono font-bold text-white">CPDP202607001</p>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Exit to Public Portfolio
        </Link>
      </div>
    </aside>
  )
}
