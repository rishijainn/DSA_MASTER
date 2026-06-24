'use client'

import { useRouter } from 'next/navigation'

interface Problem {
  id: string
  title: string
  difficulty: string
  next_review_date: string
  review_count: number
  leetcode_url: string
}

interface Props {
  shownProblems: Problem[]
  queueCount: number
  recentProblems: Problem[]
  dailyCommitment: number
  isBacklogged: boolean
}

function difficultyTag(d: string) {
  if (d === 'easy') return { color: '#00b85d', background: 'rgba(0,184,93,0.12)', border: '1px solid rgba(0,184,93,0.3)' }
  if (d === 'medium') return { color: '#ffa116', background: 'rgba(255,161,22,0.12)', border: '1px solid rgba(255,161,22,0.3)' }
  return { color: '#ff375f', background: 'rgba(255,55,95,0.12)', border: '1px solid rgba(255,55,95,0.3)' }
}

function daysOverdue(dateStr: string) {
  const today = new Date()
  const due = new Date(dateStr)
  const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return { text: 'Due today', color: '#737373' }
  if (diff > 0) return { text: `${diff}d overdue`, color: '#ffa116' }
  return { text: `In ${Math.abs(diff)}d`, color: '#5a5a5a' }
}

export default function DashboardClient({ shownProblems, queueCount, recentProblems, dailyCommitment, isBacklogged }: Props) {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#eff1f6' }}>

      {/* Navbar */}
      <nav style={{ background: '#212121', borderBottom: '1px solid #3e3e3e', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', background: '#ffa116', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#1a1a1a', fontWeight: '900', fontSize: '11px' }}>S</span>
            </div>
            <span style={{ color: '#eff1f6', fontWeight: '600', fontSize: '14px' }}>DSA Shadow</span>
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            <div style={{ padding: '4px 12px', borderRadius: '4px', fontSize: '13px', color: '#ffa116', background: 'rgba(255,161,22,0.1)', fontWeight: '500' }}>Dashboard</div>
            <button onClick={() => router.push('/settings')} style={{ padding: '4px 12px', borderRadius: '4px', fontSize: '13px', color: '#737373', background: 'transparent', border: 'none', cursor: 'pointer' }}>Settings</button>
          </div>
        </div>
        {!isBacklogged && (
          <button
            onClick={() => router.push('/add-question')}
            style={{ background: '#ffa116', color: '#1a1a1a', border: 'none', borderRadius: '4px', padding: '6px 16px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
          >
            + Add Problem
          </button>
        )}
      </nav>

      {/* Content */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '28px 24px' }}>

        {/* Backlog warning */}
        {isBacklogged && (
          <div style={{ background: 'rgba(255,161,22,0.08)', border: '1px solid rgba(255,161,22,0.25)', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ color: '#ffa116', fontSize: '14px', marginTop: '1px' }}>⚠</span>
            <div>
              <p style={{ color: '#ffa116', fontSize: '13px', fontWeight: '600', margin: '0 0 2px 0' }}>Backlog building up</p>
              <p style={{ color: '#737373', fontSize: '12px', margin: 0 }}>{queueCount} overdue problems waiting. Clear these before adding new ones.</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'Due today', value: shownProblems.length, suffix: ` / ${dailyCommitment}` },
            { label: 'In queue', value: queueCount, suffix: '' },
            { label: 'Total tracked', value: recentProblems.length, suffix: '' },
          ].map(s => (
            <div key={s.label} style={{ background: '#282828', border: '1px solid #3e3e3e', borderRadius: '8px', padding: '16px 18px' }}>
              <p style={{ color: '#737373', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px 0' }}>{s.label}</p>
              <p style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '24px', color: '#eff1f6', margin: 0 }}>
                {s.value}<span style={{ fontSize: '13px', fontWeight: '400', color: '#3e3e3e' }}>{s.suffix}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Due for review */}
        <p style={{ color: '#737373', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px 0' }}>Due for review</p>

        {shownProblems.length === 0 ? (
          <div style={{ background: '#282828', border: '1px solid #3e3e3e', borderRadius: '8px', padding: '36px 24px', textAlign: 'center', marginBottom: '28px' }}>
            <p style={{ color: '#5a5a5a', fontSize: '14px', margin: '0 0 6px 0' }}>Nothing due today.</p>
            <p style={{ color: '#3e3e3e', fontSize: '12px', margin: 0 }}>Solve a problem on LeetCode — it'll appear here when it's time to review.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '28px' }}>
            {shownProblems.map(p => {
              const overdue = daysOverdue(p.next_review_date)
              return (
                <div key={p.id} style={{ background: '#282828', border: '1px solid #3e3e3e', borderLeft: '3px solid #ffa116', borderRadius: '8px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#eff1f6', fontSize: '14px', fontWeight: '500', margin: '0 0 7px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '4px', fontWeight: '500', textTransform: 'capitalize', ...difficultyTag(p.difficulty) }}>
                        {p.difficulty}
                      </span>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', color: overdue.color }}>{overdue.text}</span>
                      <span style={{ fontSize: '11px', color: '#5a5a5a' }}>{p.review_count}× reviewed</span>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/review/${p.id}`)}
                    style={{ marginLeft: '16px', padding: '6px 16px', borderRadius: '4px', background: 'transparent', color: '#ffa116', border: '1px solid rgba(255,161,22,0.4)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    Review →
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {queueCount > 0 && (
          <p style={{ fontSize: '12px', textAlign: 'center', margin: '-20px 0 28px 0', color: '#5a5a5a' }}>
            +{queueCount} more in queue
          </p>
        )}

        {/* Recently tracked */}
        <p style={{ color: '#737373', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px 0' }}>Recently tracked</p>
        {recentProblems.length === 0 ? (
          <div style={{ background: '#282828', border: '1px solid #3e3e3e', borderRadius: '8px', padding: '28px 24px', textAlign: 'center' }}>
            <p style={{ color: '#5a5a5a', fontSize: '13px', margin: 0 }}>No problems tracked yet. Install the Chrome extension to get started.</p>
          </div>
        ) : (
          <div style={{ background: '#282828', border: '1px solid #3e3e3e', borderRadius: '8px', overflow: 'hidden' }}>
            {recentProblems.map((p, i) => (
              <div key={p.id} style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < recentProblems.length - 1 ? '1px solid #3e3e3e' : 'none' }}>
                <span style={{ color: '#eff1f6bf', fontSize: '13px' }}>{p.title}</span>
                <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '4px', fontWeight: '500', textTransform: 'capitalize', ...difficultyTag(p.difficulty) }}>
                  {p.difficulty}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}