import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'A minimal blog powered by Supabase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-[#fafafa] text-[#111111]">
        {children}
      </body>
    </html>
  )
}
