import type { Metadata } from 'next'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://grunt.sh'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Grunt — AI Prompt Compressor',
    template: '%s | Grunt',
  },
  description: 'Compress verbose AI prompts into token-efficient fragments. Save 40–70% on LLM API costs with zero loss of technical meaning. Free to start.',
  keywords: [
    'prompt compression', 'AI prompt optimizer', 'LLM cost reduction',
    'token reduction', 'prompt engineering tool', 'ChatGPT prompt',
    'Claude prompt optimizer', 'reduce AI costs', 'prompt shortener',
  ],
  authors: [{ name: 'Grunt' }],
  openGraph: {
    title: 'Grunt — AI Prompt Compressor',
    description: 'Compress verbose AI prompts into token-efficient fragments. Save 40–70% on LLM API costs.',
    url: siteUrl,
    siteName: 'Grunt',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'Grunt — AI Prompt Compressor',
    description: 'Compress verbose AI prompts into token-efficient fragments. Save 40–70% on LLM API costs.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
