'use client'

import { useState } from 'react'

interface Problem {
  id: string
  title: string
  difficulty: string
  next_review_date: string
  review_count: number
  leetcode_url: string
  leetcode_slug: string
}

const BG = '#0d1117'
const CARD = '#161b22'
const BORDER = '#21262d'
const TEXT = '#e6edf3'
const SUBTEXT = '#8b949e'
const MUTED = '#484f58'
const BLUE = '#58a6ff'
const RED = '#f85149'
const GOLD = '#d29922'
const GREEN = '#3fb950'
const MONO = "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace"

function localDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysOverdue(dateStr: string) {
  const today = localDateStr(new Date())
  return Math.floor((new Date(today).getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

function getDifficultyConfig(difficulty: string) {
  switch (difficulty) {
    case 'hard': return { label: 'S', color: RED, bg: 'rgba(248,81,73,0.15)', border: 'rgba(248,81,73,0.4)' }
    case 'medium': return { label: 'A', color: GOLD, bg: 'rgba(210,153,34,0.15)', border: 'rgba(210,153,34,0.4)' }
    default: return { label: 'B', color: BLUE, bg: 'rgba(56,139,253,0.15)', border: 'rgba(56,139,253,0.4)' }
  }
}

export default function OverdueClient({ problems }: { problems: Problem[] }) {
  const [reviewing, setReviewing] = useState<string | null>(null)

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ color: MUTED, fontSize: 11, fontFamily: MONO, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>
            DSA Master · Overdue
          </div>
          <h1 style={{ color: TEXT, fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.4px' }}>Overdue Reviews</h1>
          <p style={{ color: SUBTEXT, fontSize: 14, margin: '8px 0 0', lineHeight: 1.5 }}>
            These problems are past their review date. Complete them to get back on track.
          </p>
        </div>

        {problems.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', border: `1px dashed ${BORDER}`, borderRadius: 14 }}>
            <div style={{ fontSize: 40 }}>🎉</div>
            <div style={{ fontWeight: 700, marginTop: 10, fontSize: 16 }}>All caught up!</div>
            <div style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>No overdue reviews. Keep it up.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {problems.map((p) => {
              const config = getDifficultyConfig(p.difficulty)
              const overdue = daysOverdue(p.next_review_date)
              const isReviewing = reviewing === p.id

              return (
                <div key={p.id} style={{
                  background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12,
                  padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                  opacity: isReviewing ? 0.5 : 1, transition: 'opacity 0.2s',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, background: config.bg, border: `1px solid ${config.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: config.color, fontWeight: 800, fontFamily: MONO, fontSize: 13, flexShrink: 0,
                  }}>
                    {config.label}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: TEXT, fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 3 }}>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: RED }}>{overdue}d overdue</span>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: MUTED }}>{p.review_count}× reviewed</span>
                    </div>
                  </div>
                  <a
                    href={p.leetcode_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setReviewing(p.id)}
                    style={{
                      background: config.bg, border: `1px solid ${config.border}`, color: config.color,
                      padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                      textDecoration: 'none', flexShrink: 0, cursor: 'pointer',
                    }}
                  >
                    Review
                  </a>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <a href="/dashboard" style={{ color: BLUE, fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>← Back to Dashboard</a>
        </div>
      </div>
    </div>
  )
}
