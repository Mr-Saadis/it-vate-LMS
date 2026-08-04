import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

import { ThemeProvider } from "@/components/ThemeProvider";
import { RealtimeProvider } from "@/components/RealtimeProvider";

export const metadata: Metadata = {
  title: "IT-vate Solutions | Engineering R&D & LMS Platform",
  description: "IT-vate Solutions - Leading Embedded Systems R&D, Industrial IoT Engineering, and CPDP Accredited Technical LMS Platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} font-sans h-full antialiased`} suppressHydrationWarning>
      <body className="font-sans min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <RealtimeProvider />
          {children}
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
