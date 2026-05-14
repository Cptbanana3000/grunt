import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPolicy() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', paddingTop: '4rem', paddingBottom: '6rem' }}>
        <Link href="/" style={{ fontSize: '13px', color: 'var(--text-faint)', display: 'inline-block', marginBottom: '3rem' }}>← back</Link>

        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '36px', marginBottom: '8px', color: 'var(--text)' }}>Privacy Policy</h1>
        <p style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '3rem' }}>Last updated: May 2026</p>

        <Section title="1. What we collect">
          <p>When you create an account, we collect your email address and, if you sign in with Google, your Google profile information (name, email, profile picture). We do not collect payment card details — those are handled directly by Stripe.</p>
          <p>We store the prompts you submit for compression and their compressed outputs in order to display your compression history. We also store usage counts (compressions per day, total compressions) to enforce plan limits.</p>
        </Section>

        <Section title="2. How we use your data">
          <p>We use your data solely to operate Grunt:</p>
          <ul>
            <li>To authenticate your account and maintain your session</li>
            <li>To process your prompt compressions via the Anthropic API</li>
            <li>To enforce free-tier limits and pro-plan access</li>
            <li>To display your compression history</li>
            <li>To manage billing via Stripe</li>
          </ul>
          <p>We do not sell your data. We do not use your prompts to train AI models.</p>
        </Section>

        <Section title="3. Third-party services">
          <p>Grunt uses the following third-party services:</p>
          <ul>
            <li><strong>Supabase</strong> — database and authentication</li>
            <li><strong>Anthropic</strong> — AI compression (prompts are sent to Anthropic's API)</li>
            <li><strong>Stripe</strong> — payment processing for Pro subscriptions</li>
            <li><strong>Google</strong> — optional OAuth sign-in</li>
          </ul>
          <p>Each service operates under its own privacy policy. Prompts you submit are transmitted to Anthropic for processing and are subject to Anthropic's data usage policies.</p>
        </Section>

        <Section title="4. Data retention">
          <p>Your compression history is stored until you delete your account. Usage counts reset daily. You can request deletion of your account and associated data by emailing us.</p>
        </Section>

        <Section title="5. Cookies and sessions">
          <p>We use cookies to maintain your authenticated session. We do not use tracking cookies or third-party advertising cookies.</p>
        </Section>

        <Section title="6. Your rights">
          <p>You may request access to, correction of, or deletion of your personal data at any time. To do so, contact us at the email below.</p>
        </Section>

        <Section title="7. Contact">
          <p>For privacy-related questions, email: <a href="mailto:dondakirme@gmail.com" style={{ color: 'var(--stone-dim)' }}>dondakirme@gmail.com</a></p>
        </Section>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--text)', marginBottom: '12px' }}>{title}</h2>
      <div style={{ fontSize: '14px', lineHeight: 1.8, color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {children}
      </div>
    </div>
  )
}
