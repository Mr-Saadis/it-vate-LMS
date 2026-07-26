import { LMSSidebar } from '@/components/lms/Sidebar'

export default function LMSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-[#0F172A]">
      <LMSSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
