const BG = '#0d1117'
const CARD = '#161b22'
const BORDER = '#21262d'
const TEXT = '#e6edf3'
const SUBTEXT = '#8b949e'
const MUTED = '#484f58'
const BLUE = '#58a6ff'
const MONO = "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace"
const SANS = 'Inter, system-ui, sans-serif'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ color: TEXT, fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>{title}</h2>
      <div style={{ color: SUBTEXT, fontSize: 13.5, lineHeight: 1.65 }}>{children}</div>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: SANS }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '56px 24px 80px' }}>
        <div style={{ color: MUTED, fontSize: 11, fontFamily: MONO, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>
          DSA Master · Privacy Policy
        </div>
        <h1 style={{ color: TEXT, fontSize: 28, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.3px' }}>
          Privacy Policy
        </h1>
        <div style={{ color: MUTED, fontSize: 12.5, fontFamily: MONO, marginBottom: 40 }}>Last updated · September 2026</div>

        <Section title="What we collect">
          <p style={{ margin: '0 0 10px' }}>To function, DSA Master stores minimal data tied to your account:</p>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li><strong style={{ color: TEXT }}>Account</strong> — your email (sign-up only), display name, and review statistics.</li>
            <li><strong style={{ color: TEXT }}>Problem history</strong> — problem titles, slugs, difficulty, and first-solved dates you ask us to import from LeetCode.</li>
            <li><strong style={{ color: TEXT }}>Extension token</strong> — a random token generated for your account. It is stored only in your own browser via the extension&apos;s <code style={{ fontFamily: MONO }}>chrome.storage</code> and is required to authenticate sync requests.</li>
          </ul>
        </Section>

        <Section title="LeetCode session access">
          <p style={{ margin: 0 }}>With your explicit action (clicking “Sync LeetCode history”), the extension reads your
          LeetCode session cookie <em>solely in your browser</em> to fetch your own submission history. This data is
          never stored, logged, or transmitted anywhere other than as the problem history you import above.</p>
        </Section>

        <Section title="How it's used">
          <p style={{ margin: '0 0 10px' }}>Your data powers the core product:</p>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Scheduling spaced-repetition reviews (SM-2) and computing progress, streaks, and ranks.</li>
            <li>Letting the extension match and log new submissions to keep your history current.</li>
          </ul>
        </Section>

        <Section title="Where it's stored">
          <p style={{ margin: 0 }}>Data is stored in a PostgreSQL database hosted on <strong style={{ color: TEXT }}>Supabase</strong>.
          All traffic is served over HTTPS (TLS). The extension token is never stored on our servers after it is issued
          to your browser; it is hashed for authentication on our API.</p>
        </Section>

        <Section title="Sharing">
          <p style={{ margin: 0 }}>We do <strong style={{ color: TEXT }}>not</strong> sell, rent, or share your personal data with any third party.
          No advertising, no tracking beacons, no analytics SDKs. Data transmitted by the extension is sent only to the
          DSA Master API at <code style={{ fontFamily: MONO }}>dsa-master-bice.vercel.app</code>, which is the app itself.</p>
        </Section>

        <Section title="Your control">
          <p style={{ margin: 0 }}>You can disconnect and delete your token from the extension popup at any time, and log out or
          remove your account from Settings. To permanently delete your account and data, contact us and we&apos;ll remove
          everything within 30 days.</p>
        </Section>

        <div style={{
          marginTop: 40, padding: '18px 20px', borderRadius: 12,
          background: CARD, border: `1px solid ${BORDER}`,
        }}>
          <div style={{ color: MUTED, fontSize: 11, fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            Contact
          </div>
          <div style={{ color: SUBTEXT, fontSize: 13.5 }}>Questions about this policy? Reach out from the extension or the website
          dashboard. Developer: DSA Master · <span style={{ color: BLUE }}>rishijain</span></div>
        </div>
      </div>
    </div>
  )
}