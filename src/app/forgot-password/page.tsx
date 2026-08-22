'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const BG = '#0d1117'
const CARD = '#161b22'
const BORDER = '#21262d'
const TEXT = '#e6edf3'
const SUBTEXT = '#8b949e'
const MUTED = '#484f58'
const BLUE = '#58a6ff'
const RED = '#f85149'
const GREEN = '#3fb950'
const MONO = "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleReset() {
    if (!email.trim()) { setError('Enter your email'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSent(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 24 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ color: MUTED, fontSize: 11, fontFamily: MONO, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>
            DSA Master
          </div>
          <h1 style={{ color: TEXT, fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>Reset password</h1>
          <p style={{ color: SUBTEXT, fontSize: 14, margin: '8px 0 0', lineHeight: 1.5 }}>
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {sent ? (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📧</div>
            <div style={{ color: GREEN, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Check your email</div>
            <p style={{ color: SUBTEXT, fontSize: 13, margin: '0 0 20px', lineHeight: 1.6 }}>
              We sent a password reset link to <span style={{ color: TEXT, fontWeight: 600 }}>{email}</span>
            </p>
            <a href="/login" style={{ color: BLUE, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>← Back to login</a>
          </div>
        ) : (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 28 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ color: SUBTEXT, fontSize: 11, fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReset()}
                  style={{
                    width: '100%', background: BG, border: `1px solid ${BORDER}`, borderRadius: 10,
                    padding: '12px 14px', color: TEXT, fontSize: 14, outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = BLUE)}
                  onBlur={e => (e.currentTarget.style.borderColor = BORDER)}
                />
              </div>

              {error && <div style={{ color: RED, fontSize: 12, fontFamily: MONO }}>{error}</div>}

              <button
                onClick={handleReset}
                disabled={loading}
                style={{
                  width: '100%', padding: '12px 0', borderRadius: 10,
                  background: BLUE, color: 'white', fontSize: 14, fontWeight: 700,
                  border: 'none', cursor: 'pointer', opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <a href="/login" style={{ color: SUBTEXT, fontSize: 12, textDecoration: 'none' }}>← Back to login</a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
