'use client'

import { useState, useEffect } from 'react'
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

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(false)
  const [hashError, setHashError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    // Supabase sends a hash with access_token — exchange it for a session
    const hash = window.location.hash
    if (!hash) { setHashError('Invalid reset link. Request a new one.'); return }

    const params = new URLSearchParams(hash.substring(1))
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (!accessToken || !refreshToken) { setHashError('Invalid reset link. Request a new one.'); return }

    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    }).then(({ error }) => {
      if (error) { setHashError('Link expired or invalid. Request a new one.'); return }
      setReady(true)
    })
  }, [])

  async function handleReset() {
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) { setError(err.message); return }
    setDone(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 24 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ color: MUTED, fontSize: 11, fontFamily: MONO, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>
            DSA Master
          </div>
          <h1 style={{ color: TEXT, fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>Set new password</h1>
        </div>

        {hashError ? (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>❌</div>
            <div style={{ color: RED, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Link invalid</div>
            <p style={{ color: SUBTEXT, fontSize: 13, margin: '0 0 20px', lineHeight: 1.6 }}>{hashError}</p>
            <a href="/forgot-password" style={{ color: BLUE, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Request a new link</a>
          </div>
        ) : done ? (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
            <div style={{ color: GREEN, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Password updated</div>
            <p style={{ color: SUBTEXT, fontSize: 13, margin: '0 0 20px', lineHeight: 1.6 }}>Your password has been reset successfully.</p>
            <a href="/login" style={{ color: BLUE, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Sign in →</a>
          </div>
        ) : !ready ? (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 28, textAlign: 'center' }}>
            <div style={{ color: SUBTEXT, fontSize: 13 }}>Verifying link...</div>
          </div>
        ) : (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 28 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ color: SUBTEXT, fontSize: 11, fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>New password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%', background: BG, border: `1px solid ${BORDER}`, borderRadius: 10,
                    padding: '12px 14px', color: TEXT, fontSize: 14, outline: 'none',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = BLUE)}
                  onBlur={e => (e.currentTarget.style.borderColor = BORDER)}
                />
              </div>
              <div>
                <label style={{ color: SUBTEXT, fontSize: 11, fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Confirm password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReset()}
                  style={{
                    width: '100%', background: BG, border: `1px solid ${BORDER}`, borderRadius: 10,
                    padding: '12px 14px', color: TEXT, fontSize: 14, outline: 'none',
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
                {loading ? 'Updating...' : 'Update password'}
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
