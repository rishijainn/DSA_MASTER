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

  function difficultyTag(d: string) {
    if (d === 'easy') return { color: '#00b85d', background: 'rgba(0,184,93,0.12)', border: '1px solid rgba(0,184,93,0.3)' }
    if (d === 'medium') return { color: '#ffa116', background: 'rgba(255,161,22,0.12)', border: '1px solid rgba(255,161,22,0.3)' }
    return { color: '#ff375f', background: 'rgba(255,55,95,0.12)', border: '1px solid rgba(255,55,95,0.3)' }
  }

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

  const feltOptions: { value: FeltDifficulty; label: string }[] = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
    { value: 'forgot', label: 'Forgot' },
  ]

  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: '#282828', border: '1px solid #3e3e3e', borderRadius: '12px', padding: '40px', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
          <div style={{ width: '48px', height: '48px', background: 'rgba(0,184,93,0.12)', border: '1px solid rgba(0,184,93,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <span style={{ color: '#00b85d', fontSize: '20px' }}>✓</span>
          </div>
          <p style={{ color: '#eff1f6', fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0' }}>Review logged</p>
          <p style={{ color: '#737373', fontSize: '13px', margin: '0 0 24px 0' }}>
            Next review for <span style={{ color: '#eff1f6', fontWeight: '500' }}>{problem.title}</span> scheduled for{' '}
            <span style={{ color: '#ffa116', fontWeight: '600' }}>{nextDate}</span>
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            style={{ background: '#ffa116', color: '#1a1a1a', border: 'none', borderRadius: '6px', padding: '10px 24px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', width: '100%' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#eff1f6' }}>
      <nav style={{ background: '#212121', borderBottom: '1px solid #3e3e3e', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '24px', height: '24px', background: '#ffa116', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#1a1a1a', fontWeight: '900', fontSize: '11px' }}>S</span>
          </div>
          <span style={{ color: '#eff1f6', fontWeight: '600', fontSize: '14px' }}>DSA Shadow</span>
        </div>
        <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', color: '#737373', fontSize: '13px', cursor: 'pointer' }}>
          ← Back to dashboard
        </button>
      </nav>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '36px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <p style={{ color: '#eff1f6', fontSize: '20px', fontWeight: '700', margin: 0 }}>{problem.title}</p>
          <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '4px', fontWeight: '500', textTransform: 'capitalize', ...difficultyTag(problem.difficulty) }}>
            {problem.difficulty}
          </span>
        </div>
        <p style={{ color: '#5a5a5a', fontSize: '13px', marginBottom: '24px' }}>
          Reviewed {problem.review_count}× so far
        </p>

        <a
          href={problem.leetcode_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'block', background: '#282828', border: '1px solid #3e3e3e', borderRadius: '6px', padding: '11px 16px', color: '#ffa116', fontSize: '13px', textAlign: 'center', textDecoration: 'none', marginBottom: '12px', fontWeight: '500' }}
        >
          Open on LeetCode →
        </a>

        <p style={{ color: '#5a5a5a', fontSize: '12px', marginBottom: '28px', textAlign: 'center' }}>
          Solve it without AI first. Come back when done.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ color: '#eff1f6bf', fontSize: '13px', marginBottom: '10px' }}>Did you use a hint or AI?</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(opt => (
                <button
                  key={opt.label}
                  onClick={() => setHintUsed(opt.value)}
                  style={{
                    flex: 1, padding: '9px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s',
                    background: hintUsed === opt.value ? 'rgba(255,161,22,0.12)' : '#282828',
                    border: hintUsed === opt.value ? '1px solid #ffa116' : '1px solid #3e3e3e',
                    color: hintUsed === opt.value ? '#ffa116' : '#737373',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p style={{ color: '#eff1f6bf', fontSize: '13px', marginBottom: '10px' }}>How did it feel?</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {feltOptions.map(opt => {
                const selected = feltDifficulty === opt.value
                const colors: Record<string, { color: string; bg: string; border: string }> = {
                  easy: { color: '#00b85d', bg: 'rgba(0,184,93,0.12)', border: '1px solid rgba(0,184,93,0.5)' },
                  medium: { color: '#ffa116', bg: 'rgba(255,161,22,0.12)', border: '1px solid rgba(255,161,22,0.5)' },
                  hard: { color: '#ff375f', bg: 'rgba(255,55,95,0.12)', border: '1px solid rgba(255,55,95,0.5)' },
                  forgot: { color: '#a0a0a0', bg: 'rgba(160,160,160,0.12)', border: '1px solid rgba(160,160,160,0.4)' },
                }
                const c = colors[opt.value]
                return (
                  <button
                    key={opt.value}
                    onClick={() => setFeltDifficulty(opt.value)}
                    style={{
                      flex: 1, padding: '9px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s',
                      background: selected ? c.bg : '#282828',
                      border: selected ? c.border : '1px solid #3e3e3e',
                      color: selected ? c.color : '#737373',
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <p style={{ color: '#ff375f', fontSize: '12px', textAlign: 'center', margin: 0 }}>{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ background: loading ? '#cc8010' : '#ffa116', color: '#1a1a1a', border: 'none', borderRadius: '6px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', width: '100%' }}
          >
            {loading ? 'Saving...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  )
}