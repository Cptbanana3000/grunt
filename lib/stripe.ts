import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export async function createCheckoutSession(userId: string, email: string) {
  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    line_items: [
      {
        price: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,
    metadata: { userId },
  })
  return session
}

export async function createPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })
  return session
}
