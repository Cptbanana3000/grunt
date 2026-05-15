'use client'
import { useState } from 'react'
import Link from 'next/link'

type Props = {
  isLoggedIn: boolean
  label: string
  style: React.CSSProperties
}

export default function CheckoutButton({ isLoggedIn, label, style }: Props) {
  const [loading, setLoading] = useState(false)

  if (!isLoggedIn) {
    return <Link href="/sign-up" style={style}>{label}</Link>
  }

  async function handleClick() {
    setLoading(true)
    const res = await fetch('/api/checkout', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(false)
  }

  return (
    <button onClick={handleClick} disabled={loading} style={{ ...style, border: 'none', cursor: loading ? 'wait' : 'pointer' }}>
      {loading ? 'redirecting...' : label}
    </button>
  )
}
