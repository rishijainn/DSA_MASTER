'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { calculateNextReview, FeltDifficulty } from '@/lib/fsrs'

interface Problem {
  id: string
  title: string
  difficulty: string
  leetcode_url: string
  stability: number
  review_count: number
}

export default function ReviewClient({ problem }: { problem: Problem }) {
  const router = useRouter()
  const supabase = createClient()

  const [hintUsed, setHintUsed] = useState<boolean | null>(null)
  const [feltDifficulty, setFeltDifficulty] = useState<FeltDifficulty | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [nextDate, setNextDate] = useState('')

  async function handleSubmit() {
    if (hintUsed === null) { setError('Did you use a hint or AI?'); return }
    if (!feltDifficulty) { setError('How did it feel?'); return }

    setLoading(true)
    setError('')

    const { newStability, nextReviewDate } = calculateNextReview({
      stability: problem.stability,
      feltDifficulty,
      hintUsed
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: updateError } = await supabase
      .from('problems')
      .update({
        stability: newStability,
        next_review_date: nextReviewDate,
        last_reviewed_at: new Date().toISOString(),
        hint_used: hintUsed,
        felt_difficulty: feltDifficulty,
        review_count: problem.review_count + 1
      })
      .eq('id', problem.id)

    if (updateError) { setError(updateError.message); setLoading(false); return }

    await supabase.from('review_logs').insert({
      problem_id: problem.id,
      user_id: user.id,
      hint_used: hintUsed,
      felt_difficulty: feltDifficulty
    })

    setNextDate(nextReviewDate)
    setDone(true)
    setLoading(false)
  }

  const feltOptions: FeltDifficulty[] = ['easy', 'medium', 'hard', 'forgot']

  if (done) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-zinc-900 rounded-2xl p-8 text-center flex flex-col gap-4">
          <div className="text-4xl">✅</div>
          <h2 className="text-xl font-bold">Review logged</h2>
          <p className="text-zinc-400 text-sm">
            Next review for <span className="text-white font-medium">{problem.title}</span> scheduled for{' '}
            <span className="text-violet-400 font-medium">{nextDate}</span>
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg py-3 text-sm font-medium transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-8 max-w-lg mx-auto">
      <button onClick={() => router.back()} className="text-zinc-500 text-sm mb-6 hover:text-white transition">
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-1">{problem.title}</h1>
      <p className="text-zinc-400 text-sm mb-6 capitalize">{problem.difficulty} · Reviewed {problem.review_count}x</p>

      <a
        href={problem.leetcode_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center bg-zinc-900 hover:bg-zinc-800 text-violet-400 rounded-lg py-3 text-sm font-medium transition mb-8"
      >
        Open on LeetCode →
      </a>

      <p className="text-zinc-400 text-sm mb-8">
        Solve it without AI first. Come back here when you&apos;re done.
      </p>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-zinc-400 text-sm">Did you use a hint or AI?</label>
          <div className="flex gap-2">
            {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(opt => (
              <button
                key={opt.label}
                onClick={() => setHintUsed(opt.value)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                  hintUsed === opt.value ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-zinc-400 text-sm">How did it feel?</label>
          <div className="flex gap-2">
            {feltOptions.map(f => (
              <button
                key={f}
                onClick={() => setFeltDifficulty(f)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition ${
                  feltDifficulty === f ? 'bg-violet-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-500 text-white rounded-lg py-3 text-sm font-medium transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Submit Review'}
        </button>
      </div>
    </div>
  )
}