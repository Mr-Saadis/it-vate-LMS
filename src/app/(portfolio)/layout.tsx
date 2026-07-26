import { PortfolioNavbar } from '@/components/portfolio/Navbar'
import { PortfolioFooter } from '@/components/portfolio/Footer'

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans antialiased text-[#0F172A]">
      <PortfolioNavbar />
      <main className="flex-1">{children}</main>
      <PortfolioFooter />
    </div>
  )
}
