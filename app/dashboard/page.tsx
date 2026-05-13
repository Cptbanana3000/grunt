import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/DashboardClient'
import { stripe } from '@/lib/stripe'

export default async function Dashboard({ searchParams }: { searchParams: { upgraded?: string; session_id?: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const admin = createAdminSupabaseClient()
  let { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()

  // Create profile if doesn't exist (first login)
  if (!profile) {
    const { data: newProfile } = await admin.from('profiles').insert({
      id: user.id,
      email: user.email,
      plan: 'free',
      daily_compressions: 0,
      total_compressions: 0,
      last_compression_date: null,
    }).select().single()
    profile = newProfile
  }

  // Verify Stripe session immediately on redirect — don't wait for webhook
  if (searchParams.session_id && profile?.plan !== 'pro') {
    try {
      const session = await stripe.checkout.sessions.retrieve(searchParams.session_id)
      if (session.payment_status === 'paid') {
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id ?? null
        const { error } = await admin.from('profiles').update({
          plan: 'pro',
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
        }).eq('id', user.id)
        if (!error) {
          profile = { ...profile!, plan: 'pro' }
        } else {
          console.error('Plan upgrade failed:', error)
        }
      }
    } catch (e) {
      console.error('Stripe session verification failed:', e)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const usedToday = profile?.last_compression_date === today ? profile.daily_compressions : 0

  const { data: history } = await admin
    .from('compression_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return <DashboardClient
    user={{ email: user.email! }}
    profile={{ ...profile, usedToday }}
    history={history || []}
    upgraded={searchParams.upgraded === 'true'}
  />
}
