import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const session = await createCheckoutSession(user.id, user.email!)
    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message ?? 'checkout failed' }, { status: 500 })
  }
}
