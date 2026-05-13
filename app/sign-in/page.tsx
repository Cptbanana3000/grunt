'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSignIn() {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return <AuthLayout title="welcome back" sub="me remember you">
    <input placeholder="email" type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
    <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} onKeyDown={e => e.key === 'Enter' && handleSignIn()} />
    {error && <p style={{ fontSize: '12px', color: 'var(--red)' }}>{error}</p>}
    <button onClick={handleSignIn} disabled={loading} style={btnStyle}>{loading ? 'entering cave...' : 'enter cave →'}</button>
    <p style={{ fontSize: '12px', color: 'var(--text-faint)', textAlign: 'center' }}>
      no cave yet? <Link href="/sign-up" style={{ color: 'var(--stone-dim)' }}>make cave</Link>
    </p>
  </AuthLayout>
}

function AuthLayout({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--stone)', display: 'block', marginBottom: '2rem' }}>🪨 grunt</Link>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '28px', marginBottom: '4px' }}>{title}</h1>
        <p style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '2rem' }}>{sub}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{children}</div>
      </div>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', background: 'var(--bg2)',
  border: '1px solid var(--border)', borderRadius: 'var(--radius)',
  color: 'var(--text)', fontSize: '13px', outline: 'none',
}
const btnStyle: React.CSSProperties = {
  width: '100%', padding: '11px', background: 'var(--stone)', color: 'var(--bg)',
  border: 'none', borderRadius: 'var(--radius)', fontSize: '13px', fontWeight: 500,
}
