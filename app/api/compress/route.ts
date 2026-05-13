import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminSupabaseClient, createServerSupabaseClient } from '@/lib/supabase-server'
import { SYSTEM_PROMPTS, calculateSavings } from '@/lib/compression-prompts'
import { canUseLevel, isWithinDailyLimit, CompressionLevel } from '@/lib/limits'

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
      .select('plan, daily_compressions, last_compression_date')
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

    // Call Anthropic
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPTS[level],
      messages: [{ role: 'user', content: prompt }],
    })

    const compressed = message.content[0].type === 'text' ? message.content[0].text : ''
    const savings = calculateSavings(prompt, compressed)

    // Update usage count
    await admin.from('profiles').update({
      daily_compressions: usedToday + 1,
      last_compression_date: today,
      total_compressions: (profile as any).total_compressions + 1,
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

    return NextResponse.json({ compressed, savings, usedToday: usedToday + 1 })

  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: 'compression failed' }, { status: 500 })
  }
}
