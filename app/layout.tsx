import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Grunt — Less Word, More Correct',
  description: 'Compress verbose AI prompts into token-efficient fragments. Save up to 60% on LLM costs.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
