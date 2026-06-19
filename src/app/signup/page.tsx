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
    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: settingsError } = await supabase
        .from('user_settings')
        .insert({ user_id: data.user.id, daily_commitment: dailyCommitment })

      if (settingsError) {
        setError(settingsError.message)
        setLoading(false)
        return
      }
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-full max-w-sm bg-zinc-900 rounded-2xl p-8 flex flex-col gap-5">
        <h1 className="text-white text-2xl font-bold">DSA Shadow</h1>
        <p className="text-zinc-400 text-sm">Create your account</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="bg-zinc-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="bg-zinc-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-500"
        />

        <div className="flex flex-col gap-2">
          <label className="text-zinc-400 text-sm">How many problems do you want to review per day?</label>
          <div className="flex gap-2">
            {[3, 5, 7, 10].map(n => (
              <button
                key={n}
                onClick={() => setDailyCommitment(n)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                  dailyCommitment === n
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleSignup}
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-500 text-white rounded-lg py-3 text-sm font-medium transition disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p className="text-zinc-500 text-sm text-center">
          Already have an account?{' '}
          <a href="/login" className="text-violet-400 hover:underline">Log in</a>
        </p>
      </div>
    </div>
  )
}