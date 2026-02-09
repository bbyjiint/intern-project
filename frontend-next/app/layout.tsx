import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CompanyHub - Recruiting Platform',
  description: 'Find and connect with interns across the company. Build the future of finance.',
  openGraph: {
    title: 'CompanyHub - Recruiting Platform',
    description: 'Find and connect with interns across the company.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

