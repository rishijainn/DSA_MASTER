'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ display: 'flex', width: '100%', maxWidth: '860px', background: '#212121', borderRadius: '12px', border: '1px solid #3e3e3e', overflow: 'hidden', minHeight: '480px' }}>

        {/* Left panel */}
        <div style={{ width: '42%', background: '#212121', borderRight: '1px solid #3e3e3e', padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '26px', height: '26px', background: '#ffa116', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#1a1a1a', fontWeight: '900', fontSize: '12px' }}>S</span>
            </div>
            <span style={{ color: '#eff1f6', fontWeight: '600', fontSize: '14px' }}>DSA Shadow</span>
          </div>

          <div>
            <p style={{ color: '#eff1f6', fontSize: '20px', fontWeight: '700', lineHeight: '1.4', marginBottom: '12px' }}>
              "Solved 800 problems.<br />Remembered maybe 200."
            </p>
            <p style={{ color: '#737373', fontSize: '13px', lineHeight: '1.6' }}>
              DSA Shadow fixes the forgetting, not the solving.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { n: '847', label: 'problems tracked' },
              { n: '3.2×', label: 'better retention' },
              { n: '12min', label: 'avg daily review' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ color: '#ffa116', fontFamily: 'monospace', fontWeight: '700', fontSize: '18px' }}>{s.n}</span>
                <span style={{ color: '#5a5a5a', fontSize: '11px' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ flex: 1, padding: '40px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: '#eff1f6', fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Sign in</p>
          <p style={{ color: '#737373', fontSize: '13px', marginBottom: '28px' }}>Welcome back. Keep your streak alive.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ background: '#282828', border: '1px solid #3e3e3e', borderRadius: '6px', padding: '10px 14px', fontSize: '13px', color: '#eff1f6', width: '100%', transition: 'border-color 0.15s' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ background: '#282828', border: '1px solid #3e3e3e', borderRadius: '6px', padding: '10px 14px', fontSize: '13px', color: '#eff1f6', width: '100%', transition: 'border-color 0.15s' }}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(255,55,95,0.1)', border: '1px solid rgba(255,55,95,0.3)', borderRadius: '6px', padding: '10px 14px', fontSize: '12px', color: '#ff375f', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ background: loading ? '#cc8010' : '#ffa116', color: '#1a1a1a', border: 'none', borderRadius: '6px', padding: '11px', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', width: '100%', transition: 'background 0.15s', marginBottom: '20px' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p style={{ color: '#5a5a5a', fontSize: '13px', textAlign: 'center' }}>
            No account?{' '}
            <a href="/signup" style={{ color: '#ffa116', textDecoration: 'none' }}>Create one free</a>
          </p>
        </div>
      </div>
    </div>
  )
}