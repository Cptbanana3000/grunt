'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CompressionLevel, PLANS } from '@/lib/limits'
import logo from '@/app/icon1.png'

type Props = {
  user: { email: string }
  profile: { plan: string; usedToday: number; total_compressions: number }
  history: Array<{ id: string; original: string; compressed: string; level: string; saved_percent: number; saved_tokens: number; created_at: string }>
  upgraded: boolean
}

const LEVELS: { id: CompressionLevel; label: string; desc: string; pro: boolean }[] = [
  { id: 'lite', label: 'lite', desc: 'drop filler only', pro: false },
  { id: 'full', label: 'full', desc: 'terse fragments', pro: false },
  { id: 'ultra', label: 'ultra', desc: 'telegraphic', pro: true },
  { id: 'wenyan', label: '文言', desc: 'classical chinese', pro: true },
]

export default function DashboardClient({ user, profile, history: initialHistory, upgraded }: Props) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [level, setLevel] = useState<CompressionLevel>('full')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savings, setSavings] = useState<any>(null)
  const [usedToday, setUsedToday] = useState(profile.usedToday)
  const [totalCompressions, setTotalCompressions] = useState(profile.total_compressions || 0)
  const [history, setHistory] = useState(initialHistory)
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<'compress' | 'history'>('compress')
  const plan = profile.plan as 'free' | 'pro'
  const dailyLimit = PLANS[plan].dailyCompressions
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (upgraded) setTimeout(() => router.replace('/dashboard'), 3000)
  }, [upgraded])

  async function compress() {
    if (!input.trim() || loading) return
    setLoading(true); setError(''); setOutput(''); setSavings(null)
    const res = await fetch('/api/compress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input, level }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.upgrade ? (res.status === 429 ? 'daily limit reached. upgrade for unlimited.' : 'pro feature. upgrade to unlock.') : (data.error || 'compression failed'))
    } else {
      setOutput(data.compressed)
      setSavings(data.savings)
      setUsedToday(data.usedToday)
      setTotalCompressions(data.totalCompressions)
      setHistory(prev => [{ id: Date.now().toString(), original: input, compressed: data.compressed, level, saved_percent: data.savings.savedPercent, saved_tokens: data.savings.savedTokens, created_at: new Date().toISOString() }, ...prev.slice(0, 19)])
    }
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  async function handleUpgrade() {
    const res = await fetch('/api/checkout', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setError(data.error ?? 'checkout failed')
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ padding: '0 1.5rem', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--stone)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Image src={logo} alt="grunt" width={24} height={24} style={{ borderRadius: '4px', imageRendering: 'pixelated' }} />
          grunt
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {plan === 'free' && <button onClick={handleUpgrade} style={{ fontSize: '11px', padding: '5px 12px', background: 'var(--stone)', color: 'var(--bg)', border: 'none', borderRadius: 'var(--radius)', fontWeight: 500 }}>upgrade → pro</button>}
          <span className="nav-email" style={{ fontSize: '11px', color: 'var(--text-faint)' }}>{user.email}</span>
          <button onClick={signOut} style={{ fontSize: '11px', color: 'var(--text-faint)', background: 'none', border: 'none', padding: 0 }}>sign out</button>
        </div>
      </nav>

      {upgraded && <div style={{ background: 'var(--green)', color: '#fff', fontSize: '13px', textAlign: 'center', padding: '10px' }}>pro unlocked. all levels available. unlimited compressions.</div>}

      <div style={{ flex: 1, maxWidth: '900px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Usage bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '12px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Stat val={plan === 'pro' ? '∞' : `${usedToday}/${dailyLimit}`} label="today" />
            <Stat val={String(totalCompressions)} label="total" />
          </div>
          <div style={{ fontSize: '11px', padding: '3px 10px', background: plan === 'pro' ? 'var(--stone)' : 'var(--bg3)', color: plan === 'pro' ? 'var(--bg)' : 'var(--text-faint)', borderRadius: '20px', fontWeight: 500 }}>{plan}</div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '2px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          {(['compress', 'history'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ fontSize: '12px', padding: '8px 16px', background: 'none', border: 'none', color: tab === t ? 'var(--text)' : 'var(--text-faint)', borderBottom: tab === t ? '2px solid var(--stone)' : '2px solid transparent', marginBottom: '-1px', letterSpacing: '0.05em' }}>{t}</button>
          ))}
        </div>

        {tab === 'compress' && (
          <>
            {/* Level selector */}
            <div className="level-row" style={{ display: 'flex', gap: '6px', marginBottom: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-faint)', marginRight: '4px', letterSpacing: '0.08em' }}>LEVEL:</span>
              {LEVELS.map(l => {
                const locked = l.pro && plan === 'free'
                const active = level === l.id
                return (
                  <button key={l.id} onClick={() => !locked && setLevel(l.id)} style={{ fontSize: '11px', padding: '5px 12px', background: active ? 'var(--stone)' : 'var(--bg2)', color: active ? 'var(--bg)' : locked ? 'var(--text-faint)' : 'var(--text-dim)', border: `1px solid ${active ? 'var(--stone)' : 'var(--border)'}`, borderRadius: 'var(--radius)', opacity: locked ? 0.5 : 1, cursor: locked ? 'not-allowed' : 'pointer' }} title={l.desc}>
                    {l.label}{locked ? ' 🔒' : ''}
                  </button>
                )
              })}
              <span style={{ fontSize: '11px', color: 'var(--text-faint)', marginLeft: '4px' }}>— {LEVELS.find(l => l.id === level)?.desc}</span>
            </div>

            {/* Panels */}
            <div className="panels-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <Panel label="source prompt" count={input.length}>
                <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={'Paste verbose prompt here...\n\n"Could you please help me write a function that checks whether a number is prime?"'} onKeyDown={e => { if (e.metaKey && e.key === 'Enter') compress() }} style={{ width: '100%', flex: 1, minHeight: '220px', background: 'transparent', border: 'none', outline: 'none', resize: 'none', color: 'var(--text)', fontSize: '12px', lineHeight: 1.7 }} />
              </Panel>
              <Panel label="compressed output" count={output.length} accent>
                {loading ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-faint)', fontStyle: 'italic' }}>compressing...</div>
                ) : output ? (
                  <>
                    <div style={{ fontSize: '12px', lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap', flex: 1 }}>{output}</div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button onClick={copyOutput} style={{ fontSize: '11px', padding: '4px 10px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)', borderRadius: 'var(--radius)' }}>{copied ? '✓ copied' : 'copy'}</button>
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--text-faint)', fontStyle: 'italic' }}>result appears here...</div>
                )}
              </Panel>
            </div>

            {/* Action row */}
            <div className="action-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={compress} disabled={loading || !input.trim()} style={{ fontSize: '13px', fontWeight: 500, padding: '10px 24px', background: 'var(--stone)', color: 'var(--bg)', border: 'none', borderRadius: 'var(--radius)', opacity: loading || !input.trim() ? 0.5 : 1 }}>
                {loading ? 'ugh...' : 'ugh. compress. →'}
              </button>
              {savings && (
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <Stat val={`${savings.savedPercent}%`} label="saved" color={savings.savedPercent > 30 ? 'var(--green)' : 'var(--text)'} />
                  <Stat val={`~${savings.savedTokens}`} label="tokens" />
                  <Stat val={`$${savings.costPer1kCalls}`} label="per 1k calls" color="var(--green)" />
                </div>
              )}
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--red)' }}>{error}</span>
                  {error.includes('upgrade') && <button onClick={handleUpgrade} style={{ fontSize: '11px', padding: '4px 12px', background: 'var(--stone)', color: 'var(--bg)', border: 'none', borderRadius: 'var(--radius)' }}>upgrade</button>}
                </div>
              )}
            </div>
            <div className="desktop-hint" style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '6px' }}>⌘ + Enter to compress</div>
          </>
        )}

        {tab === 'history' && (
          <div>
            {history.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-faint)' }}>no compressions yet. go compress something.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {history.map(h => (
                  <div key={h.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '10px', padding: '2px 8px', background: 'var(--bg3)', color: 'var(--stone-dim)', borderRadius: '20px' }}>{h.level}</span>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <span style={{ fontSize: '11px', color: 'var(--green)' }}>↓ {h.saved_percent}%</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>{new Date(h.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-faint)', lineHeight: 1.6 }}>{h.original.slice(0, 120)}{h.original.length > 120 ? '...' : ''}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.6 }}>{h.compressed.slice(0, 120)}{h.compressed.length > 120 ? '...' : ''}</div>
                    </div>
                    <button onClick={() => { setInput(h.original); setLevel(h.level as CompressionLevel); setTab('compress') }} style={{ marginTop: '10px', fontSize: '11px', padding: '4px 10px', background: 'none', border: '1px solid var(--border)', color: 'var(--text-faint)', borderRadius: 'var(--radius)' }}>reuse</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ val, label, color }: { val: string; label: string; color?: string }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: color || 'var(--text)', lineHeight: 1 }}>{val}</div>
      <div style={{ fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
    </div>
  )
}

function Panel({ label, count, children, accent }: { label: string; count: number; children: React.ReactNode; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>{count} chars</span>
      </div>
      <div style={{ background: accent ? 'var(--bg3)' : 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '260px' }}>
        {children}
      </div>
    </div>
  )
}
