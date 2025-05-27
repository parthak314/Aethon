"use client"

import type React from "react"

import "./globals.css"
import { Open_Sans } from "next/font/google"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ArrowLeft, Home, FileText, MessageSquare } from "lucide-react"

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  weight: ["400", "600", "700"],
})

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const currentPath = usePathname()
  let nextPath = "/"

  if (currentPath === "/verify") {
    nextPath = "/"
  }
  if (currentPath === "/verify/analyse") {
    nextPath = "/verify"
  }

  return (
    <html lang="en" className={openSans.variable}>
      <body>
        <header className="w-full bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 shadow-lg">
          <nav className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <Link
                  href={nextPath}
                  className="flex items-center gap-2 text-white hover:text-purple-200 transition-colors duration-200 font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Link>

                <Link
                  href="/"
                  className="flex items-center gap-2 text-white hover:text-purple-200 transition-colors duration-200 font-semibold"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Link>

                <div className="relative group">
                  <Link
                    href="/verify"
                    className="flex items-center gap-1 text-white hover:text-purple-200 transition-colors duration-200 font-semibold"
                  >
                    <FileText className="w-4 h-4" />
                    Prescription
                  </Link>
                </div>

                <Link
                  href="/verify"
                  className="flex items-center gap-2 text-white hover:text-purple-200 transition-colors duration-200 font-semibold"
                >
                  <MessageSquare className="w-4 h-4" />
                  Online Review
                </Link>
              </div>
            </div>
          </nav>
        </header>

        <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>

        {children}
      </body>
    </html>
  )
}
