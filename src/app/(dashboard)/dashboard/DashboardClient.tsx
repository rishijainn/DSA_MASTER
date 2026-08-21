'use client'

import { useEffect, useRef, useState } from 'react'
import { getRankInfo } from '@/lib/rank'

interface Problem {
  id: string
  title: string
  difficulty: string
  next_review_date: string
  review_count: number
  leetcode_url: string
  leetcode_slug: string
}

// One day's activity for the streak heatmap - count is how many problems
// were solved/reviewed on that date. Built from real Supabase data in
// page.tsx (see the query added there), not fabricated client-side.
interface ActivityDay {
  date: string // 'YYYY-MM-DD'
  count: number
}

interface Props {
  shownProblems: Problem[]
  queueCount: number
  recentProblems: Problem[]
  dailyCommitment: number
  isBacklogged: boolean
  totalCount: number
  streak: number
  longestStreak: number
  streakActive: boolean
  activityData: ActivityDay[]
  userName: string
}

const BG = '#0d1117'
const CARD = '#161b22'
const BORDER = '#21262d'
const TEXT = '#e6edf3'
const SUBTEXT = '#8b949e'
const MUTED = '#484f58'
const BLUE = '#58a6ff'
const PURPLE = '#a78bfa'
const RED = '#f85149'
const GOLD = '#d29922'
const GREEN = '#3fb950'
const GRADIENT = 'linear-gradient(135deg, #58a6ff, #a78bfa)'
const MONO = "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace"

function getDifficultyConfig(difficulty: string) {
  switch (difficulty) {
    case 'hard':
      return { label: 'S', color: RED, bg: 'rgba(248,81,73,0.15)', border: 'rgba(248,81,73,0.4)', glow: 'rgba(248,81,73,0.3)' };
    case 'medium':
      return { label: 'A', color: GOLD, bg: 'rgba(210,153,34,0.15)', border: 'rgba(210,153,34,0.4)', glow: 'rgba(210,153,34,0.3)' };
    default:
      return { label: 'B', color: BLUE, bg: 'rgba(56,139,253,0.15)', border: 'rgba(56,139,253,0.4)', glow: 'rgba(56,139,253,0.3)' };
  }
}

function localDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysOverdue(dateStr: string) {
  const today = localDateStr(new Date())
  const diff = Math.floor((new Date(today).getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return { text: 'Due today', color: SUBTEXT, urgent: false };
  if (diff > 0) return { text: `${diff}d overdue`, color: GOLD, urgent: true };
  return { text: `In ${Math.abs(diff)}d`, color: MUTED, urgent: false };
}

function ParticlesBg({ className = '', color = 'rgba(88,166,255,0.15)', count = 40 }: { className?: string; color?: string; count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    window.addEventListener('resize', resize); resize();
    const pts = Array.from({ length: count }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      o: Math.random() * 0.3 + 0.05
    }));
    let id: number;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(p => {
        p.x = (p.x + p.vx + c.width) % c.width;
        p.y = (p.y + p.vy + c.height) % c.height;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color.replace('0.15', String(p.o)); ctx.fill();
      });
      id = requestAnimationFrame(draw);
    };
    draw(); return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize); };
  }, [color, count]);
  return <canvas ref={ref} className={className} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

// Compact mono stat chip, matching the landing preview's profile card
function Chip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '8px 10px', textAlign: 'center', minWidth: 0 }}>
      <div style={{ color, fontWeight: 800, fontFamily: MONO, fontSize: 14, lineHeight: 1.2 }}>{value}</div>
      <div style={{ color: MUTED, fontSize: 8, fontFamily: MONO, letterSpacing: '0.08em', marginTop: 3 }}>{label}</div>
    </div>
  )
}

// Rank badge + profile summary + mono stats — the landing preview signature card
function RankProfileCard({ rankInfo, userName, totalCount, totalReviewed, completionPct }: {
  rankInfo: ReturnType<typeof getRankInfo>; userName: string; totalCount: number; totalReviewed: number; completionPct: number
}) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16, alignItems: 'center',
      background: `linear-gradient(135deg, ${CARD}, ${BG})`, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 16,
      height: '100%', boxSizing: 'border-box',
    }}>
      <div style={{
        aspectRatio: '1', borderRadius: 14,
        background: `linear-gradient(135deg, ${rankInfo.bg}, ${rankInfo.color}1a)`,
        border: `2px solid ${rankInfo.border}`,
        boxShadow: `0 8px 32px ${rankInfo.glow}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
      }}>
        <div style={{ fontFamily: MONO, fontSize: 9, color: SUBTEXT, letterSpacing: '0.2em' }}>RANK</div>
        <div style={{ color: rankInfo.color, fontSize: 40, fontWeight: 900, fontFamily: MONO, lineHeight: 1 }}>{rankInfo.label}</div>
        <div style={{ fontFamily: MONO, fontSize: 9, color: rankInfo.color }}>{rankInfo.rank}</div>
      </div>
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
        <div>
          <div style={{ color: SUBTEXT, fontSize: 11, fontFamily: MONO, marginBottom: 4 }}>PROFILE SUMMARY</div>
          <div style={{ color: TEXT, fontWeight: 800, fontSize: 18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Chip label="TRACKED" value={String(totalCount)} color={BLUE} />
          <Chip label="REVIEWS" value={String(totalReviewed)} color={PURPLE} />
          <Chip label="TODAY" value={`${completionPct}%`} color={completionPct === 100 ? GREEN : GOLD} />
        </div>
      </div>
    </div>
  )
}

// Compact horizontal quest row — matches the landing preview's Daily Quests
function QuestRow({ problem, index, onStart }: { problem: Problem; index: number; onStart: () => void }) {
  const config = getDifficultyConfig(problem.difficulty);
  const overdue = daysOverdue(problem.next_review_date);
  return (
    <div style={{
      background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '10px 12px',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: config.bg, border: `1px solid ${config.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: config.color, fontWeight: 800, fontFamily: MONO, flexShrink: 0,
      }}>
        {config.label}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: MUTED, fontSize: 9, fontFamily: MONO }}>QUEST #{String(index + 1).padStart(4, '0')} · {problem.review_count}×</div>
        <div style={{ color: TEXT, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{problem.title}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: overdue.urgent ? GOLD : overdue.color }}>{overdue.text}</div>
        <button onClick={onStart} style={{ background: config.bg, border: `1px solid ${config.border}`, color: config.color, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Start</button>
      </div>
    </div>
  )
}

// FSRS-recommended next quest — the landing preview right-column panel
function NextQuestPanel({ problem }: { problem: Problem | undefined }) {
  if (!problem) {
    return (
      <div style={{ background: `linear-gradient(135deg, ${CARD}, ${BG})`, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 14 }}>
        <div style={{ color: MUTED, fontSize: 9, fontFamily: MONO, letterSpacing: '0.1em', marginBottom: 8 }}>NEXT QUEST · FSRS</div>
        <div style={{ fontSize: 24 }}>✨</div>
        <div style={{ color: TEXT, fontWeight: 700, fontSize: 14, marginTop: 6 }}>All quests complete</div>
        <div style={{ color: SUBTEXT, fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>Solve problems on LeetCode to open the next portal.</div>
      </div>
    )
  }
  const config = getDifficultyConfig(problem.difficulty);
  const overdue = daysOverdue(problem.next_review_date);
  return (
    <div style={{ background: `linear-gradient(135deg, ${CARD}, ${BG})`, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ color: MUTED, fontSize: 9, fontFamily: MONO, letterSpacing: '0.1em' }}>NEXT QUEST · FSRS</div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: config.bg, border: `1px solid ${config.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: config.color, fontWeight: 900, fontFamily: MONO, fontSize: 18, flexShrink: 0, boxShadow: `0 0 20px ${config.glow}`,
        }}>
          {config.label}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: TEXT, fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{problem.title}</div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: overdue.urgent ? GOLD : SUBTEXT, marginTop: 3 }}>
            {overdue.urgent ? 'RECOMMENDED NOW — recall dropping' : overdue.text}
          </div>
        </div>
      </div>
      <a
        href={problem.leetcode_url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ background: config.bg, border: `1px solid ${config.border}`, color: config.color, padding: '9px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}
      >
        Start quest →
      </a>
    </div>
  )
}

// Streak status — matches the landing preview's STREAK STATUS panel
function StreakStatusPanel({ streak, streakActive }: { streak: number; streakActive: boolean }) {
  const color = streakActive ? GOLD : streak > 0 ? SUBTEXT : MUTED;
  const icon = streakActive ? '🔥' : streak > 0 ? '❄️' : '💤';
  const label = streakActive ? 'KEEP IT ALIVE' : streak > 0 ? 'STREAK DORMANT' : 'SOLVE TODAY';
  return (
    <div style={{
      background: `linear-gradient(135deg, ${CARD}, ${BG})`, border: `1px solid ${color}40`, borderRadius: 14, padding: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <div>
          <div style={{ color: MUTED, fontSize: 9, fontFamily: MONO, letterSpacing: '0.1em', marginBottom: 3 }}>STREAK STATUS</div>
          <div style={{ color, fontFamily: MONO, fontWeight: 800, fontSize: 20, lineHeight: 1 }}>{streak} days {streakActive ? 'on fire' : 'saved'}</div>
        </div>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 9, color: MUTED, letterSpacing: '0.1em' }}>{label}</div>
    </div>
  )
}

// --- NEW: the coding-streak heatmap, the signature visual from the reference ---
// Renders a GitHub-style contribution grid from REAL activityData passed in
// (see page.tsx for the query that builds this) - no fabricated activity.
function CodingStreakHeatmap({ activityData, currentStreak, longestStreak }: {
  activityData: ActivityDay[]; currentStreak: number; longestStreak: number
}) {
  const countByDate = new Map(activityData.map(d => [d.date, d.count]));
  const totalSolved = activityData.reduce((sum, d) => sum + d.count, 0);

  // Build the last ~26 weeks (182 days) as a week-by-week grid, Sunday-start
  const today = new Date();
  const daysToShow = 182;
  const start = new Date(today);
  start.setDate(start.getDate() - daysToShow);
  start.setDate(start.getDate() - start.getDay()); // align to Sunday

  const weeks: { date: Date; count: number }[][] = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    const week: { date: Date; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const key = localDateStr(cursor);
      week.push({ date: new Date(cursor), count: countByDate.get(key) ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const maxCount = Math.max(1, ...activityData.map(d => d.count));
  const cellColor = (count: number) => {
    if (count === 0) return CARD;
    const intensity = Math.min(1, count / maxCount);
    if (intensity < 0.25) return '#0d3a5f';
    if (intensity < 0.5) return '#155a8a';
    if (intensity < 0.75) return '#1f7fbf';
    return BLUE;
  };

  // Month labels: mark the first week column that enters a new month
  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthLabels: { weekIndex: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const m = week[0].date.getMonth();
    if (m !== lastMonth) {
      monthLabels.push({ weekIndex: i, label: MONTH_NAMES[m] });
      lastMonth = m;
    }
  });

  const CELL = 15;
  const GAP = 4;

  return (
    <div style={{ background: `linear-gradient(135deg, ${CARD}, ${BG})`, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ color: TEXT, fontWeight: 800, fontSize: 17 }}>Coding Streak</div>
          <div style={{ color: SUBTEXT, fontSize: 12, marginTop: 2 }}>{totalSolved} solutions in the last 6 months</div>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: BLUE, fontWeight: 800, fontSize: 18, fontFamily: MONO }}>{currentStreak}d</div>
            <div style={{ color: MUTED, fontSize: 10, fontFamily: MONO }}>CURRENT</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: PURPLE, fontWeight: 800, fontSize: 18, fontFamily: MONO }}>{longestStreak}d</div>
            <div style={{ color: MUTED, fontSize: 10, fontFamily: MONO }}>LONGEST</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, overflowX: 'auto' }}>
        {/* Month labels row */}
        <div style={{ display: 'flex', gap: GAP, marginBottom: 4, marginLeft: 28 }}>
          {weeks.map((_, i) => {
            const label = monthLabels.find(m => m.weekIndex === i)?.label;
            return <div key={i} style={{ width: CELL, fontSize: 10, color: MUTED, fontFamily: MONO }}>{label ?? ''}</div>;
          })}
        </div>
        {/* Grid */}
        <div style={{ display: 'flex', gap: GAP }}>
          {/* Day labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, marginRight: 4, fontSize: 10, color: MUTED, fontFamily: MONO }}>
            <div style={{ height: CELL }}>Mo</div>
            <div style={{ height: CELL }} />
            <div style={{ height: CELL }}>We</div>
            <div style={{ height: CELL }} />
            <div style={{ height: CELL }}>Fr</div>
            <div style={{ height: CELL }} />
            <div style={{ height: CELL }} />
          </div>
          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
              {week.map((day, di) => (
                <div
                  key={di}
                  title={`${localDateStr(day.date)}: ${day.count} solved`}
                  style={{ width: CELL, height: CELL, borderRadius: 3, background: cellColor(day.count) }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, marginTop: 12 }}>
        <span style={{ color: MUTED, fontSize: 11, fontFamily: MONO }}>Less</span>
        {[CARD, '#0d3a5f', '#155a8a', '#1f7fbf', BLUE].map(c => (
          <div key={c} style={{ width: CELL, height: CELL, borderRadius: 3, background: c }} />
        ))}
        <span style={{ color: MUTED, fontSize: 11, fontFamily: MONO }}>More</span>
      </div>
    </div>
  )
}

export default function DashboardClient({
  shownProblems, queueCount, recentProblems, dailyCommitment, isBacklogged,
  totalCount, streak, longestStreak, streakActive, activityData, userName,
}: Props) {
  const totalReviewed = recentProblems.reduce((a, p) => a + (p.review_count ?? 0), 0);
  const rankInfo = getRankInfo(totalCount);
  const completionPct = shownProblems.length === 0 ? 100 : Math.round((dailyCommitment - shownProblems.length) / dailyCommitment * 100);
  const [showNotifications, setShowNotifications] = useState(false);

  // Check for stale streak on mount (user missed a day → reset to 0)
  useEffect(() => {
    fetch('/api/check-streak', { method: 'POST' }).catch(() => {})
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: "Inter, system-ui, sans-serif" }}>
      <style jsx global>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>

      <main style={{ padding: 24, position: 'relative' }}>
        <ParticlesBg color="rgba(88,166,255,0.08)" count={30} />

        {/* Top bar */}
        <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 4, height: 28, background: GRADIENT, borderRadius: 2 }} />
            <div>
              <div style={{ color: MUTED, fontSize: 9, fontFamily: MONO, letterSpacing: '0.14em', textTransform: 'uppercase' }}>DSA Master · {rankInfo.rank}</div>
              <h1 style={{ margin: '2px 0 0', fontSize: 17 }}>Dashboard</h1>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: showNotifications ? 'rgba(88,166,255,0.12)' : 'rgba(22,27,34,0.8)',
                  border: `1px solid ${showNotifications ? `${BLUE}40` : BORDER}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, cursor: 'pointer', position: 'relative',
                }}
              >
                🔔
                {shownProblems.length > 0 && (
                  <div style={{
                    position: 'absolute', top: -3, right: -3,
                    width: 16, height: 16, borderRadius: 999,
                    background: GOLD, color: BG,
                    fontSize: 9, fontWeight: 800, fontFamily: MONO,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {shownProblems.length}
                  </div>
                )}
              </button>

              {showNotifications && (
                <>
                  <div onClick={() => setShowNotifications(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 320,
                    background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 100, overflow: 'hidden',
                  }}>
                    <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>Notifications</div>
                      <div style={{ color: MUTED, fontSize: 11, fontFamily: MONO }}>Today</div>
                    </div>
                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {shownProblems.length > 0 ? (
                        <>
                          <div style={{ padding: '10px 16px', background: `${GOLD}08`, borderBottom: `1px solid ${BORDER}` }}>
                            <div style={{ color: GOLD, fontSize: 10, fontWeight: 700, fontFamily: MONO, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                              {shownProblems.length} review{shownProblems.length !== 1 ? 's' : ''} due today
                            </div>
                          </div>
                          {shownProblems.map(p => {
                            const config = getDifficultyConfig(p.difficulty)
                            return (
                              <a
                                key={p.id}
                                href={p.leetcode_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setShowNotifications(false)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 10,
                                  padding: '10px 16px', borderBottom: `1px solid ${BORDER}`,
                                  textDecoration: 'none', transition: 'background 0.1s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = `${BLUE}08`)}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                              >
                                <div style={{
                                  width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                                  background: config.bg, border: `1px solid ${config.border}`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  <span style={{ color: config.color, fontSize: 10, fontWeight: 800, fontFamily: MONO }}>{config.label}</span>
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ color: TEXT, fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                                  <div style={{ color: MUTED, fontSize: 10, fontFamily: MONO, marginTop: 1 }}>{p.review_count}× reviewed</div>
                                </div>
                              </a>
                            )
                          })}
                        </>
                      ) : (
                        <div style={{ padding: 28, textAlign: 'center' }}>
                          <div style={{ fontSize: 20, marginBottom: 6 }}>✨</div>
                          <div style={{ color: SUBTEXT, fontSize: 12 }}>No notifications for today</div>
                        </div>
                      )}

                      {!streakActive && streak > 0 && (
                        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ fontSize: 16 }}>⚠️</div>
                          <div>
                            <div style={{ color: GOLD, fontSize: 12, fontWeight: 600 }}>Streak at risk</div>
                            <div style={{ color: MUTED, fontSize: 11, fontFamily: MONO }}>{streak}d streak · solve something today</div>
                          </div>
                        </div>
                      )}
                      {streakActive && (
                        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ fontSize: 16 }}>🔥</div>
                          <div>
                            <div style={{ color: GREEN, fontSize: 12, fontWeight: 600 }}>Streak active</div>
                            <div style={{ color: MUTED, fontSize: 11, fontFamily: MONO }}>{streak}d and counting</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: `${rankInfo.color}20`, border: `1px solid ${rankInfo.border}`,
              boxShadow: `0 0 16px ${rankInfo.glow}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: rankInfo.color, fontWeight: 800, fontSize: 12,
            }}>
              {userName.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
          {isBacklogged && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(210,153,34,0.06)', border: '1px solid rgba(210,153,34,0.18)', borderRadius: 12, padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(210,153,34,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚠</div>
                <div>
                  <div style={{ color: GOLD, fontWeight: 700 }}>{queueCount} quests awaiting you</div>
                  <div style={{ color: '#a67c00', fontSize: 13 }}>{queueCount} uncompleted algorithm{queueCount === 1 ? '' : 's'} have surpassed their 24h deadline.</div>
                </div>
              </div>
              <button style={{ border: '1px solid rgba(210,153,34,0.22)', background: 'transparent', color: GOLD, padding: '8px 16px', borderRadius: 10, cursor: 'pointer' }}>Start now</button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <RankProfileCard
              rankInfo={rankInfo}
              userName={userName}
              totalCount={totalCount}
              totalReviewed={totalReviewed}
              completionPct={completionPct}
            />
            <CodingStreakHeatmap activityData={activityData} currentStreak={streak} longestStreak={longestStreak} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 800 }}>Daily Quests</div>
                    <div style={{ color: SUBTEXT, fontSize: 12 }}>Active portals in your vicinity</div>
                  </div>
                  {queueCount > 0 && <button style={{ background: 'none', border: 'none', color: BLUE, cursor: 'pointer', fontSize: 13 }}>View all →</button>}
                </div>

                {shownProblems.length === 0 ? (
                  <div style={{ padding: 36, textAlign: 'center', border: `1px dashed ${BORDER}`, borderRadius: 12 }}>
                    <div style={{ fontSize: 36 }}>✨</div>
                    <div style={{ fontWeight: 700, marginTop: 8 }}>All quests complete</div>
                    <div style={{ color: MUTED, fontSize: 13 }}>No reviews due. Solve problems on LeetCode to queue new quests.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {shownProblems.map((p, i) => <QuestRow key={p.id} problem={p} index={i} onStart={() => window.open(p.leetcode_url, '_blank')} />)}
                  </div>
                )}
              </div>

              <div style={{ background: `linear-gradient(135deg, ${CARD}, ${BG})`, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 14 }}>
                <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13 }}>Performance</div>
                <div className="grid grid-cols-3 gap-2">
                  <Chip label="DUE TODAY" value={`${shownProblems.length} / ${dailyCommitment}`} color={BLUE} />
                  <Chip label="IN QUEUE" value={String(queueCount)} color={queueCount > 0 ? GOLD : GREEN} />
                  <Chip label="TOTAL" value={String(totalCount)} color={PURPLE} />
                </div>
              </div>

              <div style={{ borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                <div style={{ padding: 12, borderBottom: `1px solid ${BORDER}`, fontWeight: 700, fontSize: 13 }}>Quest Board</div>
                {recentProblems.length === 0 ? (
                  <div style={{ padding: 18, textAlign: 'center', color: MUTED, fontSize: 13 }}>No problems tracked yet</div>
                ) : (
                  recentProblems.slice(0, 8).map((p) => (
                    <div key={p.id} style={{ display: 'flex', gap: 12, padding: 12, alignItems: 'center', borderBottom: `1px solid ${BORDER}` }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: getDifficultyConfig(p.difficulty).bg, border: `1px solid ${getDifficultyConfig(p.difficulty).border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: getDifficultyConfig(p.difficulty).color, fontWeight: 800, fontFamily: MONO, fontSize: 12 }}>{getDifficultyConfig(p.difficulty).label}</span>
                      </div>
                      <div style={{ color: SUBTEXT, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>{p.title}</div>
                      <div style={{ color: MUTED, fontFamily: MONO, fontSize: 11 }}>{p.review_count}×</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <NextQuestPanel problem={shownProblems[0]} />
              <StreakStatusPanel streak={streak} streakActive={streakActive} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
