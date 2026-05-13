import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function LandingPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Grain texture overlay */}
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.04, pointerEvents: 'none',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        backgroundRepeat: 'repeat', backgroundSize: '128px',
      }} />

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        padding: '1.25rem 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(8px)',
        background: 'rgba(14,13,11,0.8)',
        zIndex: 100,
      }}>
        <span style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: 'var(--stone)' }}>
          🪨 grunt
        </span>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <Link href="/dashboard" style={{
              fontSize: '13px', color: 'var(--bg)',
              padding: '6px 14px',
              background: 'var(--stone)',
              borderRadius: 'var(--radius)',
              fontWeight: 500,
            }}>compress →</Link>
          ) : (
            <>
              <Link href="/sign-in" style={{
                fontSize: '13px', color: 'var(--text-dim)',
                padding: '6px 14px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                transition: 'all 0.15s',
              }}>sign in</Link>
              <Link href="/sign-up" style={{
                fontSize: '13px', color: 'var(--bg)',
                padding: '6px 14px',
                background: 'var(--stone)',
                borderRadius: 'var(--radius)',
                fontWeight: 500,
              }}>try free</Link>
            </>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: '640px', width: '100%', textAlign: 'center', marginTop: '4rem' }}>
        <div style={{
          display: 'inline-block',
          fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--stone-dim)', marginBottom: '1.5rem',
          padding: '4px 12px', border: '1px solid var(--border)',
          borderRadius: '20px',
        }}>
          prompt compression utility
        </div>

        <h1 style={{
          fontFamily: 'var(--serif)', fontSize: 'clamp(42px, 8vw, 72px)',
          lineHeight: 1.05, marginBottom: '1.5rem',
          color: 'var(--text)',
        }}>
          why use many token<br />
          <em style={{ color: 'var(--stone)' }}>when few token do trick?</em>
        </h1>

        <p style={{
          fontSize: '15px', lineHeight: 1.7,
          color: 'var(--text-dim)', marginBottom: '2.5rem',
          maxWidth: '480px', margin: '0 auto 2.5rem',
        }}>
          Paste a verbose prompt. Get a compressed fragment. Save 40–60% on tokens
          without losing a single bit of technical meaning.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/sign-up" style={{
            fontSize: '14px', fontWeight: 500,
            padding: '12px 28px',
            background: 'var(--stone)',
            color: 'var(--bg)',
            borderRadius: 'var(--radius)',
            transition: 'opacity 0.15s',
          }}>
            start compressing — free
          </Link>
          <Link href="#how" style={{
            fontSize: '14px',
            padding: '12px 28px',
            border: '1px solid var(--border2)',
            color: 'var(--text-dim)',
            borderRadius: 'var(--radius)',
          }}>
            how it works
          </Link>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: '2px', marginTop: '4rem',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          {[
            { val: '~50%', label: 'avg token reduction' },
            { val: '4', label: 'compression levels' },
            { val: '10/day', label: 'free tier' },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: '1.25rem',
              background: i % 2 === 0 ? 'var(--bg2)' : 'var(--bg3)',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--stone)', marginBottom: '4px' }}>{s.val}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Example */}
        <div id="how" style={{ marginTop: '5rem', textAlign: 'left' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.12em', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '1rem' }}>
            compression example
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>before</div>
              <p style={{ fontSize: '12px', lineHeight: 1.7, color: 'var(--text-dim)' }}>
                "Could you please help me write a function that checks whether a given number is prime? I would really appreciate it if you could also include some comments explaining how it works."
              </p>
            </div>
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
              <div style={{ fontSize: '10px', color: 'var(--stone-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>after (full)</div>
              <p style={{ fontSize: '12px', lineHeight: 1.7, color: 'var(--text)' }}>
                "write fn: check number prime. include comments explain logic."
              </p>
              <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--green)' }}>↓ 68% tokens</div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div style={{ marginTop: '5rem' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.12em', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            pricing
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              {
                name: 'Free', price: '$0', sub: 'forever',
                features: ['10 compressions / day', 'lite + full levels', 'token savings counter'],
                cta: 'get started', href: '/sign-up', highlight: false,
              },
              {
                name: 'Pro', price: '$9', sub: 'per month',
                features: ['unlimited compressions', 'all 4 levels incl. wenyan', 'prompt history library', 'context shrinker (coming soon)'],
                cta: 'upgrade to pro', href: '/sign-up', highlight: true,
              },
            ].map((plan) => (
              <div key={plan.name} style={{
                background: plan.highlight ? 'var(--bg3)' : 'var(--bg2)',
                border: `1px solid ${plan.highlight ? 'var(--stone-dim)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                textAlign: 'left',
              }}>
                <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '6px' }}>{plan.name}</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '32px', color: 'var(--text)', marginBottom: '2px' }}>{plan.price}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginBottom: '1.25rem' }}>{plan.sub}</div>
                <ul style={{ listStyle: 'none', marginBottom: '1.5rem' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--stone)', fontSize: '10px' }}>◆</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} style={{
                  display: 'block', textAlign: 'center',
                  fontSize: '12px', padding: '9px',
                  background: plan.highlight ? 'var(--stone)' : 'transparent',
                  color: plan.highlight ? 'var(--bg)' : 'var(--text-dim)',
                  border: plan.highlight ? 'none' : '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontWeight: plan.highlight ? 500 : 400,
                }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <footer style={{ marginTop: '4rem', fontSize: '12px', color: 'var(--text-faint)' }}>
          🪨 grunt — inspired by <a href="https://github.com/JuliusBrussee/caveman" style={{ color: 'var(--stone-dim)', textDecoration: 'underline' }}>JuliusBrussee/caveman</a>
        </footer>
      </div>
    </main>
  )
}
