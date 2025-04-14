import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import Navbar from '@/app/components/Navbar'
import ShaderBackground from '@/app/components/ShaderBackground'
import PageTransition from '@/app/components/PageTransition'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'STRIK & DRIK',
  description: 'Bagger & Feldthaus - STRIK & DRIK',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da" className="dark">
      <body className={`${inter.className} min-h-screen bg-black text-white relative`}>
        <Suspense fallback={null}>
          <ShaderBackground />
        </Suspense>
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <main className="pt-16 sm:pt-20 relative z-10">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </body>
    </html>
  )
} 