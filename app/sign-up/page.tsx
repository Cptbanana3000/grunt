'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const supabase = createClient()

  async function handleSignUp() {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` }
    })
    if (error) { setError(error.message); setLoading(false) }
    else setDone(true)
  }

  if (done) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '380px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '1rem' }}>🪨</div>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', marginBottom: '8px' }}>check email</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>grunt send magic link. click link. enter.</p>
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--stone)', display: 'block', marginBottom: '2rem' }}>🪨 grunt</Link>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '28px', marginBottom: '4px' }}>join grunt</h1>
        <p style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '2rem' }}>free. 10 compressions/day.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input placeholder="email" type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} onKeyDown={e => e.key === 'Enter' && handleSignUp()} />
          {error && <p style={{ fontSize: '12px', color: 'var(--red)' }}>{error}</p>}
          <button onClick={handleSignUp} disabled={loading} style={btnStyle}>{loading ? 'grunting...' : 'grunt up →'}</button>
          <p style={{ fontSize: '12px', color: 'var(--text-faint)', textAlign: 'center' }}>
            have account? <Link href="/sign-in" style={{ color: 'var(--stone-dim)' }}>grunt in</Link>
          </p>
        </div>
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
