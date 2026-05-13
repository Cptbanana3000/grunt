# 🪨 Grunt - Prompt Optimizer

> why use many token when few token do trick

A micro-SaaS for compressing verbose AI prompts into token-efficient fragments. Inspired by [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman).

## Stack
- **Next.js 14** (App Router)
- **Supabase** (auth + Postgres)
- **Stripe** (freemium billing)
- **Anthropic Claude** (compression engine)

## Setup

### 1. Clone & install
```bash
npm install
```

### 2. Environment variables
```bash
cp .env.local.example .env.local
```
Fill in all values (see below).

### 3. Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → run the contents of `supabase-schema.sql`
3. Copy your project URL and anon key into `.env.local`
4. Copy your service role key (Settings → API) into `.env.local`

### 4. Stripe
1. Create a product in Stripe: "Caveman Pro" — $9/month recurring
2. Copy the Price ID into `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`
3. Set up webhook endpoint: `https://yourdomain.com/api/webhook`
   - Events to listen for: `checkout.session.completed`, `customer.subscription.deleted`
4. Copy webhook secret into `STRIPE_WEBHOOK_SECRET`

### 5. Anthropic
Get your API key from [console.anthropic.com](https://console.anthropic.com)

### 6. Run
```bash
npm run dev
```

## Compression Levels

| Level | Description | Plan |
|-------|-------------|------|
| `lite` | Drop filler words only | Free |
| `full` | Caveman fragments | Free |
| `ultra` | Telegraphic, max abbreviation | Pro |
| `文言` (wenyan) | Classical Chinese compression | Pro |

## Free vs Pro

| Feature | Free | Pro |
|---------|------|-----|
| Compressions/day | 10 | Unlimited |
| Levels | lite, full | All 4 incl. wenyan |
| History | Last 20 | Last 20 (expandable) |
| Price | $0 | $9/mo |

## Project Structure
```
app/
  api/
    compress/         ← compression endpoint (auth + usage limits)
    checkout/         ← Stripe checkout session
    portal/           ← Stripe billing portal
    webhook/          ← Stripe webhook handler
  dashboard/          ← main app (server component)
  sign-in/
  sign-up/
  (marketing)/        ← landing page
components/
  DashboardClient.tsx ← main UI (client component)
lib/
  supabase.ts         ← browser client
  supabase-server.ts  ← server client + admin client
  compression-prompts.ts ← system prompts + token estimation
  limits.ts           ← plan limits + level access control
  stripe.ts           ← Stripe helpers
middleware.ts         ← auth guard for protected routes
supabase-schema.sql   ← run this in Supabase SQL editor
```
