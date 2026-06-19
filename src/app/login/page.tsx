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
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-full max-w-sm bg-zinc-900 rounded-2xl p-8 flex flex-col gap-5">
        <h1 className="text-white text-2xl font-bold">DSA Shadow</h1>
        <p className="text-zinc-400 text-sm">Log in to your account</p>

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

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-500 text-white rounded-lg py-3 text-sm font-medium transition disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <p className="text-zinc-500 text-sm text-center">
          Don't have an account?{' '}
          <a href="/signup" className="text-violet-400 hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  )
}