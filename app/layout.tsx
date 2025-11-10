import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

export const metadata: Metadata = {
  title: "Duke's Storage Portal",
  description: 'Professional storage unit management system for Duke\'s Storage facility',
  generator: 'Duke\'s Storage Portal',
  keywords: ['storage units', 'facility management', 'rental management', 'Duke\'s Storage'],
  authors: [{ name: 'Duke\'s Storage' }],
  creator: 'Duke\'s Storage',
  publisher: 'Duke\'s Storage',
  openGraph: {
    title: "Duke's Storage Portal",
    description: 'Professional storage unit management system',
    siteName: "Duke's Storage Portal",
    type: 'website',
  },
  twitter: {
    title: "Duke's Storage Portal",
    description: 'Professional storage unit management system',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
