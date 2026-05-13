import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import { createPortalSession } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const admin = createAdminSupabaseClient()
  const { data: profile } = await admin.from('profiles').select('stripe_customer_id').eq('id', user.id).single()
  if (!profile?.stripe_customer_id) return NextResponse.json({ error: 'no subscription' }, { status: 400 })

  const session = await createPortalSession(profile.stripe_customer_id)
  return NextResponse.json({ url: session.url })
}
