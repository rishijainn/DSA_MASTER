'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsClient({ apiToken }: { apiToken: string }) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(apiToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-8 max-w-lg mx-auto">
      <button onClick={() => router.back()} className="text-zinc-500 text-sm mb-6 hover:text-white transition">
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-zinc-400 text-sm mb-8">Connect your Chrome extension using this token</p>

      <div className="bg-zinc-900 rounded-xl p-6 flex flex-col gap-4">
        <div>
          <p className="text-zinc-400 text-sm mb-2">Your API Token</p>
          <div className="bg-zinc-800 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-violet-400 text-sm font-mono break-all">{apiToken}</p>
            <button
              onClick={handleCopy}
              className="shrink-0 bg-violet-600 hover:bg-violet-500 text-white text-xs px-3 py-1.5 rounded-lg transition"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <p className="text-zinc-500 text-xs">
          Paste this token in the DSA Shadow Chrome extension settings to link your account.
        </p>
      </div>
    </div>
  )
}