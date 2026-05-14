'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import logo from '@/app/icon1.png'

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

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return <AuthLayout title="welcome back" sub="me remember you">
    <button onClick={signInWithGoogle} style={googleBtnStyle}>
      <GoogleIcon />
      continue with google
    </button>
    <Divider />
    <input placeholder="email" type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
    <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} onKeyDown={e => e.key === 'Enter' && handleSignIn()} />
    {error && <p style={{ fontSize: '12px', color: 'var(--red)' }}>{error}</p>}
    <button onClick={handleSignIn} disabled={loading} style={btnStyle}>{loading ? 'grunting...' : 'grunt in →'}</button>
    <p style={{ fontSize: '12px', color: 'var(--text-faint)', textAlign: 'center' }}>
      new here? <Link href="/sign-up" style={{ color: 'var(--stone-dim)' }}>grunt up</Link>
    </p>
  </AuthLayout>
}

function AuthLayout({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--stone)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem', textDecoration: 'none' }}>
          <Image src={logo} alt="grunt" width={24} height={24} style={{ borderRadius: '4px', imageRendering: 'pixelated' }} />
          grunt
        </Link>
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
const googleBtnStyle: React.CSSProperties = {
  width: '100%', padding: '11px', background: 'var(--bg2)', color: 'var(--text)',
  border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '13px',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer',
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>or</span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}
