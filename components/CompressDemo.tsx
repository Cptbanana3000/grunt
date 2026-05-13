'use client'

import React, { useState, useEffect, useRef } from 'react'

type Segment = {
  text: string
  strike: boolean
}

type Template = {
  label: string
  total: number
  final: number
  after: string
  segments: Segment[]
}

const TEMPLATES: Template[] = [
  {
    label: 'verbose',
    total: 45,
    final: 11,
    after: '"write fn: check number prime. include comments explain logic."',
    segments: [
      { text: '"Could you please help me ', strike: true },
      { text: 'write ', strike: false },
      { text: 'a function that ', strike: true },
      { text: 'checks whether a given number is prime? ', strike: false },
      { text: 'I would really appreciate it if you could also ', strike: true },
      { text: 'include some comments explaining how it works."', strike: false },
    ]
  },
  {
    label: 'rambling',
    total: 58,
    final: 14,
    after: '"explain react hooks useEffect vs useLayoutEffect. give examples."',
    segments: [
      { text: '"I was just wondering if ', strike: true },
      { text: 'you could possibly ', strike: true },
      { text: 'explain ', strike: false },
      { text: 'to me the main differences between ', strike: true },
      { text: 'react hooks useEffect vs useLayoutEffect', strike: false },
      { text: '. It would be super helpful if you could ', strike: true },
      { text: 'give ', strike: false },
      { text: 'me some practical ', strike: true },
      { text: 'examples', strike: false },
      { text: '."', strike: true },
    ]
  },
  {
    label: 'over-polite',
    total: 36,
    final: 8,
    after: '"fix cors error express nodejs."',
    segments: [
      { text: '"Hi there! ', strike: true },
      { text: 'I am so sorry to bother you, but ', strike: true },
      { text: 'could you please ', strike: true },
      { text: 'fix ', strike: false },
      { text: 'this annoying ', strike: true },
      { text: 'cors error ', strike: false },
      { text: 'I am getting in my ', strike: true },
      { text: 'express nodejs', strike: false },
      { text: ' app? Thanks!"', strike: true },
    ]
  }
]

const TIMING = {
  initialPause: 1000,
  highlightDuration: 340,
  gapBetweenStrikes: 160,
  typewriterCharInterval: 38,
  pauseAfterTyping: 4000,
}

const COST_PER_TOKEN = 0.000003

export default function CompressDemo() {
  const [templateIdx, setTemplateIdx] = useState(0)
  const [struckSegments, setStruckSegments] = useState<Set<number>>(new Set())
  const [activeSegment, setActiveSegment] = useState<number | null>(null)
  const [tokens, setTokens] = useState(TEMPLATES[0].total)
  const [typedAfter, setTypedAfter] = useState('')
  const [phase, setPhase] = useState<'striking' | 'typing' | 'done'>('striking')

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function schedule(fn: () => void, delay: number) {
    timerRef.current = setTimeout(fn, delay)
  }

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    
    const tpl = TEMPLATES[templateIdx]
    const strikeableIndices = tpl.segments
      .map((s, i) => s.strike ? i : -1)
      .filter(i => i !== -1)

    function startTyping(text: string) {
      let i = 0

      function tick() {
        if (i < text.length) {
          setTypedAfter(text.slice(0, i + 1))
          i++
          schedule(tick, TIMING.typewriterCharInterval)
        } else {
          setPhase('done')
          schedule(nextTemplate, TIMING.pauseAfterTyping)
        }
      }

      tick()
    }

    function nextTemplate() {
      const next = (templateIdx + 1) % TEMPLATES.length
      setTemplateIdx(next)
      setStruckSegments(new Set())
      setActiveSegment(null)
      setTypedAfter('')
      setTokens(TEMPLATES[next].total)
      setPhase('striking')
    }

    function strikeStep(si: number) {
      if (si >= strikeableIndices.length) {
        setPhase('typing')
        startTyping(tpl.after)
        return
      }

      const segIdx = strikeableIndices[si]
      setActiveSegment(segIdx)

      schedule(() => {
        setStruckSegments(prev => new Set(prev).add(segIdx))
        setActiveSegment(null)
        setTokens(prev => Math.max(
          tpl.final,
          Math.round(prev - (tpl.total - tpl.final) / strikeableIndices.length)
        ))

        schedule(() => strikeStep(si + 1), TIMING.gapBetweenStrikes)
      }, TIMING.highlightDuration)
    }

    schedule(() => strikeStep(0), TIMING.initialPause)
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateIdx])

  const tpl = TEMPLATES[templateIdx]
  const savedPct = Math.round((tpl.total - tokens) / tpl.total * 100)

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      background: 'rgba(14,13,11,0.5)',
      backdropFilter: 'blur(12px)',
      overflow: 'hidden',
      fontFamily: 'var(--mono)',
      width: '100%',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    }}>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
      
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        fontSize: '11px',
        color: 'var(--text-faint)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase'
      }}>
        {/* Window controls */}
        <div style={{ display: 'flex', gap: '8px', marginRight: '24px' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
        </div>
        
        <div style={{ flex: 1 }}>grunt.compress(prompt) SAMPLE:</div>
        
        {/* Template indicators / Labels */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {TEMPLATES.map((t, i) => (
            <span key={i} style={{
              color: i === templateIdx ? 'var(--stone)' : 'var(--text-faint)',
              border: i === templateIdx ? '1px solid var(--border2)' : '1px solid transparent',
              padding: '4px 10px',
              borderRadius: '20px',
              transition: 'all 0.3s'
            }}>
              {t.label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Before Panel */}
        <div style={{ flex: 1, padding: '24px', borderRight: '1px solid var(--border)', maxWidth: '50%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <span>Before</span>
            <span>{tokens} tok</span>
          </div>
          <div style={{ fontSize: '13px', lineHeight: 1.8, color: 'var(--text)', minHeight: '200px' }}>
            {tpl.segments.map((seg, i) => {
              if (!seg.strike) return <span key={i}>{seg.text}</span>

              const isActive = activeSegment === i
              const isStruck = struckSegments.has(i)

              return (
                <span
                  key={i}
                  style={{
                    textDecoration: isStruck ? 'line-through' : 'none',
                    textDecorationColor: 'var(--border)',
                    color: isStruck ? 'var(--text-faint)' : isActive ? 'var(--text)' : 'inherit',
                    background: isActive ? 'rgba(158,90,90,0.22)' : 'transparent',
                    outline: isActive ? '1px solid rgba(158,90,90,0.5)' : 'none',
                    borderRadius: 3,
                    transition: 'all 0.15s',
                  }}
                >
                  {seg.text}
                </span>
              )
            })}
          </div>
        </div>

        {/* After Panel */}
        <div style={{ flex: 1, padding: '24px', maxWidth: '50%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <span style={{ color: 'var(--green)' }}>After • Full</span>
            <span style={{ color: 'var(--green)' }}>{tpl.final} tok</span>
          </div>
          <div style={{ opacity: phase === 'striking' ? 0.25 : 1, transition: 'opacity 0.6s', minHeight: '200px' }}>
            <span style={{ color: 'var(--green)', fontSize: '13px', lineHeight: 1.8 }}>
              {typedAfter}
              {phase === 'typing' && <span style={{ animation: 'blink 1s step-end infinite' }}>▎</span>}
            </span>

            {phase === 'done' && (
              <div style={{ marginTop: 16, fontSize: 11, color: 'var(--green)' }}>
                ↓ -{savedPct}% tokens
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {TEMPLATES.map((_, i) => (
            <div
              key={i}
              style={{
                width: 5, height: 5, borderRadius: '50%',
                background: i === templateIdx
                  ? 'var(--text-dim)'
                  : 'var(--border2)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
