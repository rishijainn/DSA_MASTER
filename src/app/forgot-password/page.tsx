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
const GREEN = '#3fb950'
const RED = '#f85149'
const MONO = "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function sendOtp() {
    if (!email.trim()) { setError('Enter your email'); return }
    setLoading(true); setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setStep('otp')
  }

  async function verifyAndReset() {
    if (otp.length !== 6) { setError('Enter the 6-digit code'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    const supabase = createClient()

    const { data, error: err1 } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: 'email',
    })
    if (err1) { setLoading(false); setError(err1.message); return }

    const { error: err2 } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err2) { setError(err2.message); return }
    setDone(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 24 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ color: MUTED, fontSize: 11, fontFamily: MONO, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>DSA Master</div>
          <h1 style={{ color: TEXT, fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>Reset password</h1>
          <p style={{ color: SUBTEXT, fontSize: 14, margin: '8px 0 0', lineHeight: 1.5 }}>
            {step === 'email' ? 'Enter your email to receive a reset code.' : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        {done ? (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>&#10003;</div>
            <div style={{ color: GREEN, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Password updated</div>
            <p style={{ color: SUBTEXT, fontSize: 13, margin: '0 0 20px', lineHeight: 1.6 }}>Your password has been reset successfully.</p>
            <a href="/login" style={{ color: BLUE, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Sign in</a>
          </div>
        ) : step === 'email' ? (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 28 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ color: SUBTEXT, fontSize: 11, fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Email</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendOtp()}
                  style={{ width: '100%', background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 14px', color: TEXT, fontSize: 14, outline: 'none' }}
                  onFocus={e => (e.currentTarget.style.borderColor = BLUE)} onBlur={e => (e.currentTarget.style.borderColor = BORDER)} />
              </div>
              {error && <div style={{ color: RED, fontSize: 12, fontFamily: MONO }}>{error}</div>}
              <button onClick={sendOtp} disabled={loading}
                style={{ width: '100%', padding: '12px 0', borderRadius: 10, background: BLUE, color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Sending...' : 'Send code'}
              </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <a href="/login" style={{ color: SUBTEXT, fontSize: 12, textDecoration: 'none' }}>Back to login</a>
            </div>
          </div>
        ) : (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 28 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ color: SUBTEXT, fontSize: 11, fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Verification code</label>
                <input type="text" placeholder="000000" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  style={{ width: '100%', background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 14px', color: TEXT, fontSize: 14, outline: 'none', fontFamily: MONO, letterSpacing: '0.3em', textAlign: 'center' }}
                  onFocus={e => (e.currentTarget.style.borderColor = BLUE)} onBlur={e => (e.currentTarget.style.borderColor = BORDER)} />
              </div>
              <div>
                <label style={{ color: SUBTEXT, fontSize: 11, fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>New password</label>
                <input type="password" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 14px', color: TEXT, fontSize: 14, outline: 'none' }}
                  onFocus={e => (e.currentTarget.style.borderColor = BLUE)} onBlur={e => (e.currentTarget.style.borderColor = BORDER)} />
              </div>
              <div>
                <label style={{ color: SUBTEXT, fontSize: 11, fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Confirm password</label>
                <input type="password" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && verifyAndReset()}
                  style={{ width: '100%', background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 14px', color: TEXT, fontSize: 14, outline: 'none' }}
                  onFocus={e => (e.currentTarget.style.borderColor = BLUE)} onBlur={e => (e.currentTarget.style.borderColor = BORDER)} />
              </div>
              {error && <div style={{ color: RED, fontSize: 12, fontFamily: MONO }}>{error}</div>}
              <button onClick={verifyAndReset} disabled={loading}
                style={{ width: '100%', padding: '12px 0', borderRadius: 10, background: BLUE, color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Updating...' : 'Reset password'}
              </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button onClick={() => { setStep('email'); setOtp(''); setError(''); sendOtp() }} style={{ background: 'none', border: 'none', color: SUBTEXT, fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>Resend code</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
