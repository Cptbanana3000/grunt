import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import CompressDemo from '@/components/CompressDemo'
import BenchmarkCarousel from '@/components/BenchmarkCarousel'
import logo from '@/app/icon1.png'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Grunt',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  description: 'Compress verbose AI prompts into token-efficient fragments. Save 40–70% on LLM API costs with zero loss of technical meaning.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://grunt.sh',
  offers: [
    { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free' },
    { '@type': 'Offer', price: '5', priceCurrency: 'USD', name: 'Pro', description: 'per month' },
  ],
}

export default async function LandingPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <main className="landing-main" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--serif)', fontSize: '20px', color: 'var(--stone)' }}>
          <Image src={logo} alt="grunt" width={24} height={24} style={{ borderRadius: '4px', imageRendering: 'pixelated' }} />
          grunt
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

      {/* Hero Section */}
      <div className="hero-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.3fr',
        gap: '4rem',
        maxWidth: '1200px',
        width: '100%',
        marginTop: '6rem',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'left' }}>
          <div style={{
            fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'var(--stone-dim)', marginBottom: '2.5rem',
            fontWeight: 500
          }}>
            PROMPT COMPRESSION
          </div>

          <h1 style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(48px, 6vw, 84px)',
            lineHeight: 1, marginBottom: '2rem',
            color: 'var(--text)',
            letterSpacing: '-0.02em'
          }}>
            big prompt bad.<br />
            <em style={{ color: 'var(--stone)' }}>small prompt good.</em>
          </h1>

          <p style={{
            fontSize: '15px', lineHeight: 1.7,
            color: 'var(--text-dim)', marginBottom: '3rem',
            maxWidth: '420px',
          }}>
            grunt rewrites bloated prompts into the smallest<br className="hero-br" />
            fragment that<br className="hero-br" />
            still means the same thing. <span style={{color: 'var(--green)'}}>40-60% fewer tokens,</span><br className="hero-br" />
            zero<br className="hero-br" />
            loss of technical meaning.
          </p>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link href="/sign-up" style={{
              fontSize: '14px', fontWeight: 500,
              padding: '14px 28px',
              background: 'var(--stone)',
              color: 'var(--bg)',
              borderRadius: 'var(--radius)',
              transition: 'opacity 0.15s',
            }}>
              paste your prompt →
            </Link>
          </div>
        </div>

        <div className="hero-demo" style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
          <CompressDemo />
        </div>
      </div>

      <div style={{ maxWidth: '640px', width: '100%', textAlign: 'center' }}>

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

        {/* Benchmarks */}
        <div style={{ marginTop: '5rem', textAlign: 'left' }} id="benchmarks">
          <div style={{ fontSize: '11px', letterSpacing: '0.12em', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '4px' }}>
            real compression. real numbers.
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            same tool, same level (full), three different input types.
          </p>
          <BenchmarkCarousel />
        </div>

        {/* Pricing */}
        <div style={{ marginTop: '5rem' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.12em', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            pricing
          </div>
          <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              {
                name: 'Free', price: '$0', sub: 'forever',
                features: ['10 compressions / day', 'lite + full levels', 'token savings counter'],
                cta: 'get started', href: '/sign-up', highlight: false,
              },
              {
                name: 'Pro', price: '$5', sub: 'per month',
                features: ['unlimited compressions', 'all 4 levels incl. wenyan', 'prompt history library'],
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{plan.name}</span>
                  {plan.highlight && <span style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--stone)', background: 'var(--bg2)', border: '1px solid var(--stone-dim)', borderRadius: '999px', padding: '2px 8px' }}>recommended</span>}
                </div>
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

        <footer style={{ marginTop: '4rem', fontSize: '12px', color: 'var(--text-faint)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', paddingBottom: '2rem' }}>
          <span>
            <Image src={logo} alt="" width={14} height={14} style={{ borderRadius: '2px', imageRendering: 'pixelated', verticalAlign: 'middle' }} /> grunt — inspired by <a href="https://github.com/JuliusBrussee/caveman" style={{ color: 'var(--stone-dim)', textDecoration: 'underline' }}>JuliusBrussee/caveman</a>
          </span>
          <span style={{ display: 'flex', gap: '1.25rem' }}>
            <Link href="/privacy" style={{ color: 'var(--text-faint)' }}>privacy policy</Link>
            <Link href="/terms" style={{ color: 'var(--text-faint)' }}>terms & conditions</Link>
          </span>
        </footer>
      </div>
    </main>
  )
}
