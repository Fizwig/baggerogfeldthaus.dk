import './globals.css'
import type { Metadata } from 'next'
import ShaderBackground from './components/ShaderBackground'
import PageTransition from './components/PageTransition'

export const metadata: Metadata = {
  title: 'Bagger & Feldthaus',
  description: 'Officiel hjemmeside for Bagger & Feldthaus',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="da" className="dark">
      <body className="bg-black">
        <ShaderBackground />
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  )
} 