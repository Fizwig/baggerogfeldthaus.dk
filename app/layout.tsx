import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Strik & Drik',
  description: 'En unik oplevelse med strik, drinks og god stemning',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="da">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}
