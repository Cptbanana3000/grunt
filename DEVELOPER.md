# Grunt — Developer Documentation

> **"why use many token when few token do trick"**

This document is for any developer joining this project, evaluating the codebase, or trying to understand the product from first principles. It covers what we are building, why it exists, what problem it solves, how the core mechanics work, what our business model is, and how the technical architecture supports all of that. Read this before touching any code.

---

## Table of Contents

1. [What Is This?](#1-what-is-this)
2. [The Problem We Are Solving](#2-the-problem-we-are-solving)
3. [Inspiration: The Caveman Repo](#3-inspiration-the-caveman-repo)
4. [What We Are Building Differently](#4-what-we-are-building-differently)
5. [The Core Mechanic: Prompt Compression](#5-the-core-mechanic-prompt-compression)
6. [Compression Levels Explained](#6-compression-levels-explained)
7. [What Makes a Good Compression?](#7-what-makes-a-good-compression)
8. [Honest Numbers: What Compression Rates Can We Claim?](#8-honest-numbers-what-compression-rates-can-we-claim)
9. [Business Model](#9-business-model)
10. [Technical Architecture](#10-technical-architecture)
11. [Data Model](#11-data-model)
12. [API Design](#12-api-design)
13. [Auth & Access Control](#13-auth--access-control)
14. [The Wenyan Mode](#14-the-wenyan-mode)
15. [What We Are NOT Building (Yet)](#15-what-we-are-not-building-yet)
16. [Roadmap](#16-roadmap)
17. [Key Engineering Decisions & Why](#17-key-engineering-decisions--why)
18. [Open Questions](#18-open-questions)

---

## 1. What Is This?

Grunt is a web-based micro-SaaS that takes a verbose, human-written AI prompt and compresses it into a token-efficient fragment that means the same thing but uses significantly fewer tokens.

A user pastes a prompt like this:

```
Could you please help me write a Python function that checks whether a given 
number is prime? I would really appreciate it if you could also include some 
comments explaining how it works. Thank you so much in advance for your help!
```

And gets back something like this:

```
write prime check fn. python. include explanatory comments.
```

The compressed version conveys 100% of the technical intent with a fraction of the tokens.

This is not a chatbot. It is not a general AI assistant. It is a single-purpose developer utility — a tool you open alongside your LLM workflow, the same way you might open a JSON formatter or a regex tester.

---

## 2. The Problem We Are Solving

### Token costs are real and cumulative

Every word in an AI prompt costs money. Most developers and power users understand this abstractly, but underestimate the compounding effect. Consider:

- A prompt that is 400 tokens instead of 200 tokens costs **2× as much per call**
- If your app makes 10,000 API calls per day, that difference is not academic — it is a real cost line on a real invoice
- For context-heavy workflows (agents, RAG pipelines, system prompts loaded on every request), the savings compound aggressively

### Human-written prompts are extremely verbose by default

Humans write prompts the way they write emails — with politeness, hedging, context-setting, and social lubrication. None of that is useful to an LLM. The model does not care that you said "please" or that you "would really appreciate" the help. It does not need the preamble. It needs the task.

The average developer prompt contains roughly 30–50% content that is pure filler:

| Category | Examples |
|----------|----------|
| Pleasantries | "Could you please", "I would appreciate it if", "Thank you in advance" |
| Hedging | "I was wondering if", "maybe", "perhaps", "sort of" |
| Filler adverbs | "basically", "actually", "really", "just", "simply", "very" |
| Redundant phrasing | "in order to" → "to", "make sure to" → "ensure" |
| Throat-clearing | "So I've been working on this project and...", "Let me explain the context..." |

Stripping all of that out — while preserving the actual technical substance — is what Grunt does.

### The problem is invisible until you measure it

Nobody notices this because each individual prompt seems fine. The cost only becomes visible when you aggregate across thousands of calls, or when you're building something where the context window matters (e.g. you have a 200k token window but your system prompt is bloated enough that you're hitting limits sooner than you should).

---

## 3. Inspiration: The Caveman Repo

This project was directly inspired by [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) — a Claude Code skill / agent plugin that makes AI coding agents *respond* in caveman-style compressed prose.

Key facts about the original repo:

- It targets **output token reduction**, not input. The agent responds in terse fragments instead of verbose explanations.
- It achieved **~65% average output token reduction** across 10 standard software engineering tasks (range: 22–87%)
- The measurement was honest: it used a three-arm eval comparing against a "be concise" control, not against a verbose baseline. The delta is real, not inflated.
- It ships as a Claude Code plugin, Codex plugin, Gemini CLI extension, and rule files for Cursor, Windsurf, Cline, and Copilot.
- It also includes `caveman-compress`, a sub-skill that rewrites memory files (CLAUDE.md, project notes) into caveman format — achieving ~46% context token reduction on those files.
- It even has a `wenyan` mode — classical Chinese literary compression — achieving 80–90% character reduction.

**What the original repo does NOT have:** a web UI. It is entirely a developer CLI/plugin tool. There is no interface for non-technical users, no account system, no freemium tier, no hosted version. That gap is what we are filling.

---

## 4. What We Are Building Differently

| Dimension | JuliusBrussee/caveman | Grunt |
|-----------|----------------------|-------|
| Target | Output compression (agent responses) | Input compression (user prompts) |
| Interface | CLI / agent plugin | Web app |
| Users | Developers with Claude Code / Codex | Any LLM power user |
| Auth | None (local tool) | Clerk (Google, GitHub, email) |
| Business model | Open source, free | Freemium SaaS ($9/mo Pro) |
| Wenyan mode | Yes | Yes (Pro only) |
| Context shrinker | Yes (CLAUDE.md) | Yes (file upload, Pro only) |

The core compression philosophy and system prompts are derived from the original repo's SKILL.md. We adapted the prompts for input compression rather than output compression, which is a different (harder) problem — see section 8 for why.

We credit the original repo on the landing page and in the codebase. This is the right thing to do.

---

## 5. The Core Mechanic: Prompt Compression

### How it works technically

The user pastes a prompt into the web UI. On submission:

1. The request hits our Next.js API route (`/api/compress`)
2. Server-side: we verify auth (Clerk), check the user's plan and daily usage (Supabase), validate the compression level is accessible on their plan
3. We call `claude-haiku-4-5-20251001` (fastest, cheapest Claude model) with a specialized system prompt that instructs it to compress the input
4. We return the compressed text + metadata (chars saved, estimated tokens saved, reduction %)
5. We log the compression event to Supabase for usage tracking and stats

### Why use an LLM to compress prompts for LLMs?

This is the obvious question. The answer is that compression at this level of nuance requires semantic understanding. You cannot do this with a regex or a keyword filter. The compressor needs to:

- Understand *which* words are filler and which carry meaning
- Understand that "the file at `/usr/local/bin/python`" cannot be shortened — the path is payload
- Understand that "I would really appreciate it if you could possibly consider..." collapses to nothing, but "consider using X instead of Y" preserves a real instruction
- Understand that code blocks, variable names, URLs, and error strings are sacred — they cannot be paraphrased

A rule-based system would either be too aggressive (breaking prompts) or too conservative (not compressing much). An LLM with a well-crafted system prompt hits the right balance.

Using Haiku specifically is intentional: it is fast (sub-second on most prompts), cheap (~$0.00025 per 1K input tokens), and more than capable for this task. We do not need Sonnet or Opus for compression.

### The meta-irony

Yes, we are using tokens to save tokens. The compression call itself costs tokens. This is fine because:

- The savings are on the *destination* model, which may be much more expensive (e.g. GPT-4o, Claude Opus)
- If you use the compressed prompt 100+ times (e.g. a system prompt loaded on every API call), you pay the compression cost once and save on every subsequent call
- For one-off prompts the ROI is smaller, but there is still value in having a tighter, cleaner prompt

---

## 6. Compression Levels Explained

We expose six compression levels, derived from the original caveman repo's level system:

### `lite` (Free)
Drop filler words and pleasantries, keep full sentences intact. Safest mode. Minimal risk of semantic loss. Good for users who want cleaner prompts without the caveman aesthetic. Expected reduction: 15–30%.

```
Before: "Could you please help me optimize this SQL query? I'm concerned it might be running slowly."
After:  "Help me optimize this SQL query. Concerned it's running slowly."
```

### `full` (Free)
Full caveman-style fragment rewriting. Drop articles, conjunctions, pleasantries. Use fragment sentences. Use arrows for causality (X → Y). Short synonyms. This is the default and the most useful level for the majority of developer prompts. Expected reduction: 35–55%.

```
Before: "Could you please help me optimize this SQL query? I'm concerned it might be running slowly."
After:  "optimize SQL query. running slow. fix."
```

### `ultra` (Pro)
Telegraphic minimum. Subject+verb only when essential. Abbreviate aggressively (DB, auth, cfg, req, res, fn, impl). Symbols over words wherever possible. For users who are maximally cost-sensitive and comfortable reading compressed output. Expected reduction: 55–70%.

```
Before: "Could you please help me optimize this SQL query? I'm concerned it might be running slowly."
After:  "SQL query perf. slow. fix."
```

### `wenyan-lite` (Pro)
Classical Chinese literary style, light application. Keeps basic grammar structure but adopts classical register. Unusual — see section 14.

### `wenyan-full` (Pro)
Full classical Chinese compression. Classical sentence patterns, subjects omitted when inferable, classical particles (之/乃/為/其). High information density.

### `wenyan-ultra` (Pro)
Maximum classical Chinese density. 80–90% character reduction target. Fully 文言文. Every character earns its place. Code, URLs, paths remain in original Latin script — never translated.

---

## 7. What Makes a Good Compression?

This is the most important thing for any contributor to understand. A compression is **good** if and only if:

### ✅ Must preserve
- 100% of technical intent — the LLM receiving the compressed prompt should produce the same output as if it received the original
- All code snippets — byte-perfect, never paraphrased
- All URLs — byte-perfect
- All file paths — byte-perfect
- All variable names, function names, class names, error strings — byte-perfect
- All version numbers, model names, API names
- The logical structure of multi-step instructions (ordering matters)
- Any constraints or negative instructions ("do NOT use X", "avoid Y")

### ❌ Safe to remove
- Pleasantries and politeness markers
- Hedging language that does not change the instruction
- Filler adverbs (basically, actually, really, just, simply)
- Redundant phrasing and tautologies
- Social context-setting ("So I've been working on...")
- Throat-clearing ("Let me explain what I'm trying to do...")
- Grammatical scaffolding that does not carry meaning (articles, many prepositions)

### ⚠️ Handle with care
- Context that seems redundant but is actually disambiguating
- Tone instructions ("be concise", "be friendly") — these are real instructions, not filler
- Ordering language ("first", "then", "finally") — these encode sequence, which matters
- Emphasis ("it is critical that", "make absolutely sure") — degraded compression here can cause the model to miss important constraints

### The cardinal sin
**Never paraphrase technical content.** If a user writes `authenticate using the Bearer token in the Authorization header`, the compressor must not turn this into `use auth token`. The word "Bearer", the word "Authorization", the concept of a header — these are all technically load-bearing. A compression that drops them has broken the prompt.

---

## 8. Honest Numbers: What Compression Rates Can We Claim?

We need to be precise here because the original caveman repo's numbers (65–75%) are **output** compression numbers, not input compression numbers.

### Why input compression is harder

When the caveman skill makes an agent respond in terse fragments, it controls the entire output. It can compress everything aggressively because there is no sacred content in a response — the model just needs to convey the same information in fewer words.

When we compress a *user's prompt*, there is often sacred content (code, paths, URLs) that cannot be compressed at all. A prompt that is 50% code blocks may only compress 10–20% because the code is untouchable.

### Realistic estimates for input compression

Based on the nature of the task:

| Prompt type | Expected reduction |
|-------------|-------------------|
| Conversational / verbose ("please help me...") | 45–65% |
| Mixed prose + code | 20–40% |
| Already-tight technical prompts | 5–20% |
| Context files (CLAUDE.md, READMEs) | 35–50% |
| Wenyan ultra on pure prose | 70–85% |

**Our honest average across a typical mix of developer prompts: ~35–50% character reduction.**

### What we should do before making public claims

We should run our own benchmark:
1. Collect 20–30 real developer prompts covering the typical range
2. Compress each at `full` level
3. Measure character reduction and token reduction (using tiktoken, not our /4 estimate)
4. Verify that a panel of LLMs produces equivalent outputs for original vs compressed versions
5. Publish the raw data, methodology, and script — the same way Julius did

This is a legitimate HN post and gives us credible numbers to put on the landing page.

---

## 9. Business Model

### Free tier
- 10 compressions per day
- Access to `lite` and `full` levels only
- Basic stats (total compressions, avg reduction)
- Enough to evaluate the product and get real value for occasional users

### Pro tier ($9/month)
- Unlimited compressions
- All 6 levels including `ultra` and all three `wenyan` modes
- Context shrinker (upload a file — README, CLAUDE.md, system prompt — and compress it)
- Full compression history
- Priority support

### Why $9/month?
- Low enough that any developer with a real use case can justify it immediately
- High enough that 100 paying users = $900 MRR, which covers infrastructure with meaningful margin
- Lifetime deal pricing ($79 or $99) is also worth considering for a Product Hunt launch — generates upfront cash and surfaces committed users

### Unit economics
- Haiku costs ~$0.00025 per 1K input tokens, ~$0.00125 per 1K output tokens
- A typical compression call: ~500 input tokens (user prompt + system prompt) + ~200 output tokens
- Cost per compression: ~$0.000125 + ~$0.00025 = ~$0.000375 per call
- At 10 compressions/day for a free user: ~$0.0038/day = ~$0.11/month — essentially free to serve
- At unlimited for a Pro user (estimating 100 compressions/day): ~$1.13/month in API costs vs $9 revenue = healthy margin

---

## 10. Technical Architecture

```
Browser (Next.js client)
    │
    ├─ /dashboard          → CompressorUI (client component)
    ├─ /upgrade            → UpgradePage (client component)
    └─ / (landing)         → Static marketing page (server component)
    
Next.js API Routes (server-side, protected by Clerk middleware)
    │
    ├─ POST /api/compress       → Auth check → Plan check → Anthropic API → Log → Return
    ├─ POST /api/checkout       → Stripe checkout session creation
    ├─ POST /api/webhook/stripe → Stripe event handling (upgrade / downgrade)
    └─ GET  /api/user           → Return plan + usage + stats
    
External Services
    ├─ Clerk           → Auth (JWT verification in middleware)
    ├─ Supabase        → Postgres (users table, compressions log)
    ├─ Anthropic       → claude-haiku-4-5-20251001 (compression)
    └─ Stripe          → Payment processing, subscription management
```

### Why Next.js App Router?
Standard choice for this stack. Server components for the marketing page (good for SEO), client components for the interactive dashboard, API routes for the backend. Clerk integrates natively. Vercel deployment is zero-config.

### Why Clerk?
Auth is not a differentiator. Clerk handles Google, GitHub, and email/password login in about 20 minutes of setup. It generates JWTs that integrate with Next.js middleware without any custom code. The alternative (NextAuth + custom session handling) adds days of work for no product benefit.

### Why Supabase?
We need a database for two things: tracking user plans (free vs pro) and logging compression events for the usage meter and stats dashboard. Supabase gives us a hosted Postgres instance with a dashboard, a free tier that covers us until we have meaningful scale, and a JS client that is straightforward to use. MongoDB would also work but is overkill for this schema — we have two simple tables.

### Why Haiku specifically?
Claude Haiku 4.5 is the fastest and cheapest Claude model. For a compression task that does not require deep reasoning, it is more than sufficient. Using Sonnet would be 5-10× more expensive with no meaningful improvement in compression quality. The system prompts we use are explicit enough that even a smaller model can follow them precisely.

---

## 11. Data Model

Two tables in Postgres via Supabase:

### `users`
```sql
id              uuid (PK)
clerk_id        text (unique) -- Clerk user ID, used as FK in compressions
email           text
plan            text          -- 'free' | 'pro'
stripe_customer_id  text      -- null until first payment
created_at      timestamptz
```

### `compressions`
```sql
id              uuid (PK)
user_id         text          -- FK → users.clerk_id
input_chars     integer
output_chars    integer
chars_saved     integer       -- computed: input_chars - output_chars
level           text          -- 'lite' | 'full' | 'ultra' | 'wenyan-lite' etc.
created_at      timestamptz
```

### Notes
- We store `chars_saved` as a denormalized computed column for query convenience — it is always `input_chars - output_chars`
- We do not store the actual prompt content. This is intentional: prompts may be sensitive (system prompts, private instructions, proprietary workflows). We only store the metadata needed for usage limiting and stats.
- The daily usage check queries `compressions` filtered by `user_id` and `created_at >= today`. This is indexed.
- Token estimates displayed in the UI use the simple `/4` heuristic (1 token ≈ 4 characters). This is good enough for display purposes. For accurate billing or benchmarking you would use tiktoken.

---

## 12. API Design

### `POST /api/compress`

**Auth:** Required (Clerk JWT via middleware)

**Request:**
```json
{
  "prompt": "string (max 10,000 chars)",
  "level": "lite | full | ultra | wenyan-lite | wenyan-full | wenyan-ultra"
}
```

**Response (200):**
```json
{
  "compressed": "string",
  "inputChars": 312,
  "outputChars": 148,
  "charsSaved": 164,
  "reduction": 53
}
```

**Error responses:**
- `401` — not authenticated
- `400` — missing prompt or prompt too long
- `403` — level not available on current plan (`upgradeRequired: true`)
- `429` — daily limit reached (`upgradeRequired: true`)
- `500` — internal error

**Side effects:** logs the compression to Supabase `compressions` table.

### `GET /api/user`

Returns the current user's plan, today's usage count, and lifetime stats. Called on dashboard mount to initialize the UI state.

### `POST /api/checkout`

Creates a Stripe Checkout session and returns the redirect URL. The client redirects to Stripe's hosted checkout page. On success, Stripe redirects to `/dashboard?upgraded=true`. On cancel, Stripe redirects to `/upgrade`.

### `POST /api/webhook/stripe`

Handles two Stripe events:
- `checkout.session.completed` — sets user plan to `pro` in Supabase, stores Stripe customer ID
- `customer.subscription.deleted` — sets user plan back to `free`

This webhook must be registered in the Stripe dashboard. The endpoint verifies the Stripe signature before processing any event.

---

## 13. Auth & Access Control

Access control happens in two places:

### Middleware (Clerk)
`middleware.ts` uses `clerkMiddleware` to protect `/dashboard` and `/upgrade` routes. Unauthenticated requests are redirected to `/sign-in`. API routes are also protected — the `/api/compress` route calls `auth()` from Clerk and returns 401 if no valid session exists.

### Business logic (Supabase)
Inside `/api/compress`, after auth verification:

1. Look up the user's plan in Supabase (`getUserPlan`)
2. Check if the requested compression level is available on that plan (`PLAN_LIMITS[plan].availableLevels.includes(level)`)
3. If plan is free, check daily usage count against the limit (`getUserUsageToday` + `PLAN_LIMITS.free.dailyCompressions`)
4. If any check fails, return 403 or 429 with `upgradeRequired: true` so the frontend can show an upgrade prompt

This means access control logic lives server-side and cannot be bypassed by modifying client-side state.

---

## 14. The Wenyan Mode

This is the most unusual feature and deserves its own section.

Classical Chinese (文言文, *wényán wén*) is an extremely information-dense written language. Classical texts routinely convey in five characters what modern Chinese or English would take thirty words to express. Subjects are routinely omitted when inferable. Verbs precede objects. Particles carry relational meaning that in English requires full prepositional phrases.

The wenyan compression modes use this property to achieve extreme character reduction on prose content while preserving technical tokens (code, URLs, paths) in their original Latin script.

Example:
```
English: "Your component re-renders because you are creating a new object reference on each render cycle."
Caveman full: "New object ref each render. Re-renders. useMemo fix."
Wenyan full: "物出新參照，致重繪。useMemo Wrap之。"
```

The wenyan-ultra level targets 80–90% character reduction — well beyond what any English-based compression can achieve.

**Who is this for?** Honestly, it is partly a party trick and partly genuinely useful for:
- Users who are maximally cost-sensitive and comfortable with dense notation
- Context file compression where the file will be read by a model, not a human
- Anyone who finds it hilarious (which is good for virality)

**Important implementation note:** The wenyan system prompts explicitly instruct the model to never translate or abbreviate code snippets, URLs, file paths, or technical identifiers. These must always pass through in original Latin script. A variable name like `authMiddleware` should appear as `authMiddleware` in the wenyan output, not transliterated or translated.

This feature is Pro-only not because it is more expensive to run (it is not) but because it is a strong differentiator that gives Pro a compelling reason to exist beyond just "more compressions per day."

---

## 15. What We Are NOT Building (Yet)

To keep scope tight, the following are explicitly out of scope for v1:

- **Prompt library / history browser** — we log compressions but do not show them in a browsable history UI yet. The data is there, the UI is not.
- **Context shrinker (file upload)** — uploading a file (README, CLAUDE.md) and compressing it is described in the roadmap but not implemented in v1. The API infrastructure exists; it needs a UI and a file parsing layer.
- **MCP middleware** — a Model Context Protocol version that wraps other MCP servers and compresses their tool descriptions. High value for AI agent developers but a significant engineering effort.
- **Browser extension** — a "Grunt" button in ChatGPT, Claude.ai, and other LLM interfaces. Phase 4 goal.
- **API access** — letting developers call our compression endpoint programmatically with an API key. Logical next step after the web app is validated.
- **Team plans** — shared usage pools, team dashboards. Not needed until we have significant B2B interest.
- **Streaming** — the current implementation waits for the full compression before returning. Streaming would make longer prompts feel faster, but adds complexity and is not needed for v1.

---

## 16. Roadmap

### Phase 1 — Core (current)
- [x] Compression engine with 6 levels
- [x] Next.js web app with auth (Clerk)
- [x] Usage limiting (10/day free, unlimited pro)
- [x] Stripe integration (freemium → $9/mo)
- [x] Token savings stats dashboard
- [x] Copy to clipboard

### Phase 2 — Utilities
- [ ] Context shrinker (file upload → compressed file download)
- [ ] Compression history browser
- [ ] `/caveman-commit` mode (paste a diff → get a Conventional Commits message)
- [ ] `/caveman-review` mode (paste a PR diff → get one-line review comments)
- [ ] Streaming compression for long prompts

### Phase 3 — Growth
- [ ] Public benchmark: run evals, publish results, write HN post
- [ ] API access with API keys (developer tier)
- [ ] Browser extension (Chrome first)
- [ ] Team plans

### Phase 4 — Ecosystem
- [ ] MCP middleware (compress tool descriptions for AI agents)
- [ ] Integrations (Raycast extension, Alfred workflow, VS Code extension)

---

## 17. Key Engineering Decisions & Why

### We use `chars_saved` not `tokens_saved` as the ground truth metric

Token counts depend on the tokenizer used (cl100k, o200k, etc.), and exposing accurate counts would require shipping tiktoken to the client or making an additional API call. Character count is always accurate, always available instantly, and is a good proxy. We convert to tokens in the UI using `/4` heuristic with an explicit label "est. tokens" so users understand it is an approximation.

### We do not store prompt content

Only metadata (chars, level, timestamp) is logged. This is a privacy decision. Developers routinely put sensitive content in prompts — API keys in examples, proprietary system prompt logic, private business context. We do not want to be responsible for storing any of that. If we later want to offer a prompt history feature, we would need to think carefully about encryption and user consent.

### We chose Haiku over a self-hosted or open-source model

The obvious alternative is running an open-source model (Llama, Mistral, Phi) on our own infrastructure. This would reduce per-call costs to near zero at scale. We chose Haiku for v1 because:
- Zero infrastructure overhead — no GPUs, no model management, no latency tuning
- Haiku is better at following nuanced compression instructions than most open-source alternatives at comparable size
- At our current scale (pre-launch), Haiku costs are negligible
- We can switch to self-hosted later if economics require it — the API route is the only place that needs to change

### We rate-limit by calendar day, not rolling 24 hours

"10 compressions per day" resets at midnight UTC, not 24 hours from your first compression. This is simpler to implement (query for `created_at >= today's midnight`) and matches user expectations ("day" means day, not "24-hour window").

### The frontend does not know the compression system prompts

The system prompts live in `lib/limits.ts` and are only used server-side in the `/api/compress` route. This is intentional — the prompts are the core IP of the product. A user inspecting network requests sees only their compressed result, not the instructions that generated it.

---

## 18. Open Questions

These are genuine open questions the team should discuss:

1. **Naming:** The product is currently called "Grunt" internally but this is not final. The domain situation and trademark status need to be verified before committing.

2. **Should we publish our system prompts?** The caveman repo is open source and publishes its SKILL.md prompts. We derived from those. Is there a community obligation to give back? Or is the web app layer sufficient differentiation to keep the prompts private?

3. **Benchmark methodology:** Before putting any compression percentage on the landing page, we need our own eval. What prompts should we use? Who decides if the compressed output is semantically equivalent to the original? Should we use an LLM judge?

4. **Pricing validation:** $9/month is a guess. We should talk to 10 potential users before we commit to it. Some signals: the caveman repo has significant GitHub stars — those are potential users. What would they pay?

5. **Context shrinker prioritization:** This is potentially the highest-value feature (the one-time-cost-forever-savings story is compelling) but it requires file parsing and download logic. Should it be v1.1 or v2?

6. **Should we credit more explicitly?** Currently the landing page says "inspired by JuliusBrussee/caveman." Should we reach out to Julius directly — either to inform him, collaborate, or explore whether he would want to be involved?

---

*Last updated: initial draft*  
*Maintainer: update this document whenever a significant architectural or product decision is made. This is a living document.*
