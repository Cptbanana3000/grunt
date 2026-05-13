import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId && session.customer) {
        await admin.from("profiles").update({
          plan: "pro",
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        }).eq("id", userId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await admin.from("profiles").update({ plan: "free" }).eq(
        "stripe_customer_id",
        subscription.customer as string
      );
      break;
    }
  }

  return NextResponse.json({ received: true });
}
