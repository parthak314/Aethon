"use client"

import "./globals.css";
import { Open_Sans } from 'next/font/google';
import Link from "next/link"
import { usePathname } from "next/navigation";

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  weight: ['400', '600', '700'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const currentPath = usePathname();
  let nextPath = "/"

  if (currentPath === "/verify"){
    nextPath = "/"
  }
  if (currentPath === "/verify/analyse"){
    nextPath = "/verify"
  }
  return (
    <html lang="en"  className={openSans.variable}>
      <body >
        <header className="w-full bg-white py-1">
          <nav className="flex">
            <div>
              <ul className="flex items-center gap-10 text-gray-800 px-5 font-bold">
                <Link href={nextPath}>Back</Link>
                <Link href="/">Home</Link>
                <Link href="/verify">Prescription</Link>
                <Link href="/verify">Online Review</Link>
              </ul>
            </div>
          </nav>
        </header>
        <div>
          <hr className="border-2 border-black"/>
        </div>
        {children}
      </body>
    </html>
  );
}
