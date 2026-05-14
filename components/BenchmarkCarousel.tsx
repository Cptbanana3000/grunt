'use client'
import { useState } from 'react'

function ic(text: string, bg = 'var(--bg3)') {
  return (
    <code style={{ fontFamily: 'monospace', background: bg, padding: '2px 6px', borderRadius: '3px', fontSize: '12px' }}>
      {text}
    </code>
  )
}

function codeBlk(content: string, bg: string) {
  return (
    <pre style={{
      fontFamily: 'monospace', fontSize: '11px', lineHeight: 1.6,
      color: 'var(--text-faint)', background: bg, borderRadius: '6px',
      padding: '12px', margin: '10px 0', overflow: 'auto',
      whiteSpace: 'pre-wrap', wordBreak: 'break-all',
    }}>
      {content}
    </pre>
  )
}

const CODE = `async function fetchUserData(userId) {
  const response = await fetch(\`/api/users/\${userId}\`)
  const data = await response.json()
  return data
}`

interface Benchmark {
  type: string
  saved: string
  tokens: string
  cost: string
  before: { chars: number; body: React.ReactNode }
  after: { chars: number; body: React.ReactNode }
}

const BENCHMARKS: Benchmark[] = [
  {
    type: 'Pure prose',
    saved: '71%',
    tokens: '~52 tokens saved',
    cost: '$0.156 / 1k calls',
    before: {
      chars: 292,
      body: (
        <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text-dim)', margin: 0 }}>
          I wanted to reach out to ask whether you would be able to help me understand the best approach to take when it comes to building a content strategy for a new product that is just getting started and does not yet have an established audience or any significant brand recognition in the market.
        </p>
      ),
    },
    after: {
      chars: 81,
      body: (
        <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text)', margin: 0 }}>
          How to build content strategy for new product with no audience/brand recognition?
        </p>
      ),
    },
  },
  {
    type: 'Mixed — prose + inline code',
    saved: '53%',
    tokens: '~40 tokens saved',
    cost: '$0.120 / 1k calls',
    before: {
      chars: 303,
      body: (
        <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text-dim)', margin: 0 }}>
          I am getting an error when I try to call the {ic('getUserProfile')} function and I am not sure what is causing it. The error message says {ic('TypeError: Cannot read properties of undefined')} and it seems to be happening somewhere inside the function but I cannot figure out where exactly the problem is occurring.
        </p>
      ),
    },
    after: {
      chars: 143,
      body: (
        <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text)', margin: 0 }}>
          Getting error calling {ic('getUserProfile', 'var(--bg2)')} function. Error msg: {ic('TypeError: Cannot read properties of undefined', 'var(--bg2)')}. Origin unknown, occurs inside fn.
        </p>
      ),
    },
  },
  {
    type: 'Code-heavy',
    saved: '22%',
    tokens: '~17 tokens saved',
    cost: '$0.051 / 1k calls',
    before: {
      chars: 310,
      body: (
        <>
          <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text-dim)', margin: '0 0 4px' }}>I need you to refactor this function so it handles errors properly:</p>
          {codeBlk(CODE, 'var(--bg3)')}
          <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text-dim)', margin: '4px 0 0' }}>Make sure it handles network errors, non-200 responses, and malformed JSON.</p>
        </>
      ),
    },
    after: {
      chars: 243,
      body: (
        <>
          <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text)', margin: '0 0 4px' }}>Refactor fn to handle errors:</p>
          {codeBlk(CODE, 'var(--bg2)')}
          <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text)', margin: '4px 0 0' }}>Network errs, non-200 responses, malformed JSON.</p>
        </>
      ),
    },
  },
]

const btnStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid var(--border)',
  color: 'var(--text-dim)',
  borderRadius: 'var(--radius)',
  width: '34px',
  height: '34px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontSize: '18px',
  flexShrink: 0,
}

export default function BenchmarkCarousel() {
  const [active, setActive] = useState(0)
  const b = BENCHMARKS[active]
  const prev = () => setActive(i => (i - 1 + BENCHMARKS.length) % BENCHMARKS.length)
  const next = () => setActive(i => (i + 1) % BENCHMARKS.length)

  return (
    <div style={{ width: '100%' }}>
      {/* Card */}
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            {b.type}
          </span>
          <span style={{ fontFamily: 'var(--serif)', fontSize: '22px', color: 'var(--green)' }}>
            {b.saved} saved
          </span>
        </div>

        {/* Before / After panels */}
        <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div className="bench-before" style={{
            padding: '1.5rem',
            borderRight: '1px solid var(--border)',
            minHeight: '240px',
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
              before · {b.before.chars} chars
            </div>
            {b.before.body}
          </div>
          <div style={{ padding: '1.5rem', background: 'var(--bg3)', minHeight: '240px' }}>
            <div style={{ fontSize: '10px', color: 'var(--stone-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
              after · {b.after.chars} chars
            </div>
            {b.after.body}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: '1.5rem',
          fontSize: '11px', color: 'var(--text-faint)',
        }}>
          <span>{b.tokens}</span>
          <span>{b.cost}</span>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.25rem' }}>
        <button onClick={prev} style={btnStyle} aria-label="Previous">‹</button>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {BENCHMARKS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                width: i === active ? '22px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i === active ? 'var(--stone)' : 'var(--border2)',
                border: 'none',
                cursor: 'pointer',
                transition: 'width 0.25s ease, background 0.2s',
                padding: 0,
              }}
            />
          ))}
        </div>

        <button onClick={next} style={btnStyle} aria-label="Next">›</button>
      </div>

      <p style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '1.25rem', lineHeight: 1.6, textAlign: 'left' }}>
        Code blocks, URLs, and file paths are preserved byte-for-byte — they can't be compressed without breaking them. Savings are highest on pure prose, lower when technical regions dominate the input.
      </p>
    </div>
  )
}
