'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dailyCommitment, setDailyCommitment] = useState(5)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setLoading(true)
    setError('')
    const { data, error: signupError } = await supabase.auth.signUp({ email, password })
    if (signupError) { setError(signupError.message); setLoading(false); return }
    if (data.user) {
      const { error: settingsError } = await supabase
        .from('user_settings')
        .insert({ user_id: data.user.id, daily_commitment: dailyCommitment })
      if (settingsError) { setError(settingsError.message); setLoading(false); return }
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0a0a0a' }}>
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12" style={{ background: '#111111', borderRight: '1px solid #1f1f1f' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: '#f97316' }}>
            <span className="text-black font-black text-sm">S</span>
          </div>
          <span className="text-white font-semibold tracking-tight">DSA Shadow</span>
        </div>
        <div>
          <p className="text-2xl font-semibold text-white leading-snug mb-3">
            Stop solving.<br />Start remembering.
          </p>
          <p className="text-sm" style={{ color: '#555' }}>
            Every problem you solve gets scheduled for review at exactly the right time — before you forget it.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {['Tracks every LeetCode solve automatically', 'Knows when you\'re about to forget', 'Shows you what to review, not what to grind'].map(f => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#f97316' }} />
              <span className="text-sm" style={{ color: '#888' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: '#f97316' }}>
              <span className="text-black font-black text-sm">S</span>
            </div>
            <span className="text-white font-semibold">DSA Shadow</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-sm mb-8" style={{ color: '#555' }}>Free forever. No credit card.</p>

          <div className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-sm text-white rounded-lg outline-none"
              style={{ background: '#161616', border: '1px solid #222' }}
              onFocus={e => e.target.style.borderColor = '#f97316'}
              onBlur={e => e.target.style.borderColor = '#222'}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-sm text-white rounded-lg outline-none"
              style={{ background: '#161616', border: '1px solid #222' }}
              onFocus={e => e.target.style.borderColor = '#f97316'}
              onBlur={e => e.target.style.borderColor = '#222'}
            />

            <div className="pt-1">
              <p className="text-sm font-medium text-white mb-3">How many reviews per day can you commit to?</p>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 7, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => setDailyCommitment(n)}
                    className="py-2.5 rounded-lg text-sm font-semibold transition"
                    style={{
                      background: dailyCommitment === n ? '#f97316' : '#161616',
                      color: dailyCommitment === n ? '#000' : '#666',
                      border: `1px solid ${dailyCommitment === n ? '#f97316' : '#222'}`
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2" style={{ color: '#444' }}>You can change this anytime</p>
            </div>

            {error && (
              <p className="text-sm px-3 py-2 rounded-lg" style={{ color: '#f87171', background: '#1a0f0f', border: '1px solid #3a1515' }}>
                {error}
              </p>
            )}

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold transition mt-1"
              style={{ background: loading ? '#7a3a0f' : '#f97316', color: '#000' }}
            >
              {loading ? 'Creating account...' : 'Get started'}
            </button>
          </div>

          <p className="text-center text-sm mt-6" style={{ color: '#555' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#f97316' }} className="hover:underline">Log in</a>
          </p>
        </div>
      </div>
    </div>
  )
}