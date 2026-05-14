import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
}

export default function Terms() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', paddingTop: '4rem', paddingBottom: '6rem' }}>
        <Link href="/" style={{ fontSize: '13px', color: 'var(--text-faint)', display: 'inline-block', marginBottom: '3rem' }}>← back</Link>

        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '36px', marginBottom: '8px', color: 'var(--text)' }}>Terms & Conditions</h1>
        <p style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '3rem' }}>Last updated: May 2026</p>

        <Section title="1. Acceptance">
          <p>By using Grunt you agree to these terms. If you do not agree, do not use the service.</p>
        </Section>

        <Section title="2. The service">
          <p>Grunt is a prompt compression tool that rewrites verbose AI prompts into shorter, token-efficient versions. We offer a free tier (10 compressions per day) and a paid Pro tier (unlimited compressions, all levels).</p>
          <p>We reserve the right to modify, suspend, or discontinue the service at any time with reasonable notice.</p>
        </Section>

        <Section title="3. Your account">
          <p>You are responsible for maintaining the confidentiality of your account credentials. You must not share your account or allow others to use it. You must provide accurate information when registering.</p>
          <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
        </Section>

        <Section title="4. Acceptable use">
          <p>You may not use Grunt to:</p>
          <ul>
            <li>Submit prompts containing illegal, harmful, or abusive content</li>
            <li>Attempt to reverse-engineer, scrape, or abuse the service</li>
            <li>Circumvent usage limits through multiple accounts or automated requests</li>
            <li>Resell or redistribute access to the service</li>
          </ul>
        </Section>

        <Section title="5. Your content">
          <p>You retain ownership of the prompts you submit. By submitting prompts, you grant us a limited licence to process them through our compression pipeline (including transmission to Anthropic's API) solely for the purpose of providing the service.</p>
          <p>We do not claim ownership of your prompts and do not use them to train models.</p>
        </Section>

        <Section title="6. Billing and refunds">
          <p>The Pro plan is billed monthly at $5/month via Stripe. You may cancel at any time from your account settings. Cancellation takes effect at the end of the current billing period. We do not offer refunds for partial months.</p>
          <p>If we discontinue the service, we will provide pro-rata refunds for any unused paid period.</p>
        </Section>

        <Section title="7. Disclaimer of warranties">
          <p>Grunt is provided "as is" without warranties of any kind. We do not guarantee that compressions will always be shorter, semantically equivalent, or error-free. You are responsible for reviewing compressed output before use.</p>
        </Section>

        <Section title="8. Limitation of liability">
          <p>To the maximum extent permitted by law, Grunt is not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability to you shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
        </Section>

        <Section title="9. Changes to these terms">
          <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the updated terms. We will notify users of material changes by email.</p>
        </Section>

        <Section title="10. Contact">
          <p>For questions about these terms, email: <a href="mailto:dondakirme@gmail.com" style={{ color: 'var(--stone-dim)' }}>dondakirme@gmail.com</a></p>
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
