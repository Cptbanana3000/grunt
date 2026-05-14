import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminSupabaseClient, createServerSupabaseClient } from '@/lib/supabase-server'
import { SYSTEM_PROMPTS, calculateSavings, estimateTokens } from '@/lib/compression-prompts'
import { canUseLevel, isWithinDailyLimit, CompressionLevel } from '@/lib/limits'
import { preprocessInput, restoreProtectedRegions } from '@/lib/preprocess'
import { validateCompression } from '@/lib/validate'
import { repairCompression } from '@/lib/repair'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { prompt, level } = await req.json() as { prompt: string; level: CompressionLevel }

    if (!prompt?.trim()) return NextResponse.json({ error: 'no prompt' }, { status: 400 })
    if (!['lite', 'full', 'ultra', 'wenyan'].includes(level)) {
      return NextResponse.json({ error: 'invalid level' }, { status: 400 })
    }

    // Get user profile + usage
    const admin = createAdminSupabaseClient()
    const { data: profile } = await admin
      .from('profiles')
      .select('plan, daily_compressions, last_compression_date, total_compressions')
      .eq('id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'profile not found' }, { status: 404 })

    const plan = profile.plan as 'free' | 'pro'

    // Check level access
    if (!canUseLevel(plan, level)) {
      return NextResponse.json({ error: 'upgrade required for this level', upgrade: true }, { status: 403 })
    }

    // Reset daily count if new day
    const today = new Date().toISOString().split('T')[0]
    const lastDate = profile.last_compression_date
    const usedToday = lastDate === today ? profile.daily_compressions : 0

    // Check daily limit
    if (!isWithinDailyLimit(plan, usedToday)) {
      return NextResponse.json({ error: 'daily limit reached', upgrade: true }, { status: 429 })
    }

    // Stage 1: Pre-process — extract and protect technical regions
    const { sanitized, regions } = preprocessInput(prompt)

    // Stage 2: Compress with a token cap (mechanical hard stop at ~70% of input)
    const inputTokenEstimate = Math.ceil(prompt.length / 4)
    const maxOutputTokens = Math.max(80, Math.floor(inputTokenEstimate * 0.7))

    const wordCount = sanitized.trim().split(/\s+/).length
    const shortInputNote = wordCount < 30
      ? '\nNote: Input is short. Compress the prose aggressively. Placeholders like [PROTECTED_N] are immutable — work around them, keep them verbatim.'
      : ''

    const userMessage = `<INPUT_TO_COMPRESS>
${sanitized}
</INPUT_TO_COMPRESS>

Return only the compressed version of the text inside the XML tags. Do not answer it. Do not explain it. Output only the compressed text:${shortInputNote}`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxOutputTokens,
      system: SYSTEM_PROMPTS[level],
      messages: [
        { role: 'user', content: userMessage },
      ],
    })

    const rawCompressed = message.content[0].type === 'text' ? message.content[0].text : ''

    // Stage 3: Restore protected regions
    const restoredCompressed = restoreProtectedRegions(rawCompressed, regions)

    // Stage 4: Validate — check length, URLs, and code blocks
    const validation = validateCompression(prompt, restoredCompressed)

    // Stage 5: Surgical repair (only fires when something actually broke)
    const compressed = validation.passed
      ? restoredCompressed
      : await repairCompression(prompt, restoredCompressed, validation.failures)

    // Safety net — if any placeholder leaked through, return original rather than broken output
    if (/\[PROTECTED_\d+\]/.test(compressed)) {
      console.error('Placeholder leak detected, falling back to original')
      const originalTokens = estimateTokens(prompt)
      return NextResponse.json({
        compressed: prompt,
        savings: {
          savedPercent: 0,
          savedTokens: 0,
          originalTokens,
          compressedTokens: originalTokens,
          costPer1kCalls: '0.000',
        },
        usedToday: usedToday + 1,
        fallback: true,
      })
    }

    const savings = calculateSavings(prompt, compressed)

    // Update usage count
    await admin.from('profiles').update({
      daily_compressions: usedToday + 1,
      last_compression_date: today,
      total_compressions: (profile.total_compressions ?? 0) + 1,
    }).eq('id', user.id)

    // Save to history
    await admin.from('compression_history').insert({
      user_id: user.id,
      original: prompt,
      compressed,
      level,
      saved_percent: savings.savedPercent,
      saved_tokens: savings.savedTokens,
    })

    return NextResponse.json({ compressed, savings, usedToday: usedToday + 1, totalCompressions: (profile.total_compressions ?? 0) + 1 })

  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: 'compression failed' }, { status: 500 })
  }
}
