'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getRankInfo, getRankProgress } from '@/lib/rank'

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
const MONO = "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace"

interface Props {
  totalCount: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
  dailyCommitment: number
}

const ALL_RANKS = [
  { rank: 'Beginner', label: '?', min: 0, color: '#484f58', bg: 'rgba(72,79,88,0.15)', border: 'rgba(72,79,88,0.4)', glow: 'rgba(72,79,88,0.3)', desc: 'Just getting started' },
  { rank: 'E-Class', label: 'E', min: 10, color: '#58a6ff', bg: 'rgba(88,166,255,0.15)', border: 'rgba(88,166,255,0.4)', glow: 'rgba(88,166,255,0.3)', desc: '10 problems tracked' },
  { rank: 'D-Class', label: 'D', min: 30, color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.4)', glow: 'rgba(167,139,250,0.3)', desc: '30 problems tracked' },
  { rank: 'C-Class', label: 'C', min: 60, color: '#3fb950', bg: 'rgba(63,185,80,0.15)', border: 'rgba(63,185,80,0.4)', glow: 'rgba(63,185,80,0.3)', desc: '60 problems tracked' },
  { rank: 'B-Class', label: 'B', min: 100, color: '#388bfd', bg: 'rgba(56,139,253,0.15)', border: 'rgba(56,139,253,0.4)', glow: 'rgba(56,139,253,0.3)', desc: '100 problems tracked' },
  { rank: 'A-Class', label: 'A', min: 150, color: '#d29922', bg: 'rgba(210,153,34,0.15)', border: 'rgba(210,153,34,0.4)', glow: 'rgba(210,153,34,0.3)', desc: '150 problems tracked' },
  { rank: 'S-Class', label: 'S', min: 210, color: '#f85149', bg: 'rgba(248,81,73,0.15)', border: 'rgba(248,81,73,0.4)', glow: 'rgba(248,81,73,0.3)', desc: '210 problems tracked' },
]

function AnimatedNumber({ value, duration = 1.4 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const startTime = Date.now()
    const step = () => {
      const elapsed = (Date.now() - startTime) / (duration * 1000)
      if (elapsed >= 1) { setDisplay(value); return }
      const eased = 1 - Math.pow(1 - elapsed, 4)
      setDisplay(Math.round(eased * value))
      requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value, duration])
  return <>{display}</>
}

function ProgressRing({ percent, size = 160, stroke = 10, color }: { percent: number; size?: number; stroke?: number; color: string }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 36, fontWeight: 900, fontFamily: MONO, color, lineHeight: 1 }}>
          <AnimatedNumber value={Math.round(percent)} duration={1.8} />
        </div>
        <div style={{ fontSize: 10, fontFamily: MONO, color: MUTED, letterSpacing: '0.15em', marginTop: 4 }}>% TO NEXT</div>
      </div>
    </div>
  )
}

function ParticlesBg() {
  const [particles, setParticles] = useState<Array<{
    id: number; x: number; y: number; size: number; color: string;
    opacity: number; drift: number; dur: number; delay: number;
  }>>([])
  useEffect(() => {
    setParticles(Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, y: Math.random() * 100,
      size: 1.5 + Math.random() * 2.5,
      color: [BLUE, PURPLE, GREEN, GOLD][i % 4],
      opacity: 0.08 + Math.random() * 0.12,
      drift: -20 - Math.random() * 40,
      dur: 5 + Math.random() * 6,
      delay: Math.random() * 4,
    })))
  }, [])
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute', width: p.size, height: p.size, borderRadius: '50%',
            background: p.color, opacity: p.opacity,
            left: `${p.x}%`, top: `${p.y}%`,
          }}
          animate={{ y: [0, p.drift, 0], opacity: [p.opacity, p.opacity * 2.5, p.opacity] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

export default function ProgressClient({ totalCount, currentStreak, longestStreak, lastActivityDate, dailyCommitment }: Props) {
  const currentRank = getRankInfo(totalCount)
  const progress = getRankProgress(totalCount)
  const nextRank = currentRank.nextRank
  const problemsToNext = currentRank.next ? currentRank.next - totalCount : 0

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <ParticlesBg />
      <style>{`
        @keyframes breathe { 0%,100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
        @keyframes pulse-dot { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes float-fire { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .rank-node:hover { transform: translateX(4px); }
        .rule-card:hover { border-color: rgba(255,255,255,0.12); transform: scale(1.015); }
        .flow-step:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.15); }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 920, margin: '0 auto', padding: '36px 24px 80px' }}>

        {/* QUICK STATS BAR */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28 }}
        >
          {[
            { icon: '📦', label: 'TRACHED', value: totalCount, color: currentRank.color },
            { icon: '🔥', label: 'STREAK', value: currentStreak, color: GOLD },
            { icon: '🏆', label: 'BEST', value: longestStreak, color: PURPLE },
            { icon: '🎯', label: 'DAILY GOAL', value: dailyCommitment, color: GREEN },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              style={{
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                background: 'rgba(22,27,34,0.65)', border: `1px solid ${BORDER}`,
                borderRadius: 12, padding: '16px 14px', textAlign: 'center',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
            >
              <div style={{ fontSize: 14, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, fontFamily: MONO, color: s.color, lineHeight: 1 }}>
                <AnimatedNumber value={s.value} duration={1} />
              </div>
              <div style={{ fontSize: 9, fontFamily: MONO, color: MUTED, letterSpacing: '0.15em', marginTop: 4 }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* HERO — Rank + Progress Ring */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'relative', overflow: 'hidden',
            background: `radial-gradient(ellipse at 50% 20%, ${currentRank.color}10 0%, ${CARD} 55%, ${BG} 100%)`,
            border: `1px solid ${currentRank.border}`,
            borderRadius: 20, marginBottom: 32,
          }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `radial-gradient(circle at 30% 30%, ${currentRank.color}08, transparent 50%), radial-gradient(circle at 70% 70%, ${currentRank.color}05, transparent 50%)`,
            pointerEvents: 'none',
          }} />

          <div style={{
            display: 'flex', alignItems: 'center', gap: 40,
            padding: '48px 44px', position: 'relative', zIndex: 1,
            flexWrap: 'wrap', justifyContent: 'center',
          }}>
            {/* Rank Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.2 }}
              style={{
                width: 110, height: 110, borderRadius: 22, flexShrink: 0,
                background: currentRank.bg, border: `3px solid ${currentRank.border}`,
                boxShadow: `0 0 50px ${currentRank.glow}, 0 0 100px ${currentRank.glow}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                animation: 'breathe 3s ease-in-out infinite',
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 7, color: MUTED, letterSpacing: '0.25em' }}>RANK</div>
              <div style={{ color: currentRank.color, fontSize: 52, fontWeight: 900, fontFamily: MONO, lineHeight: 1 }}>{currentRank.label}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: currentRank.color, fontWeight: 600 }}>{currentRank.rank}</div>
            </motion.div>

            {/* Center info */}
            <div style={{ flex: 1, minWidth: 200, textAlign: 'center' }}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <div style={{ fontSize: 13, color: SUBTEXT, marginBottom: 2, letterSpacing: '0.05em' }}>Problems Tracked</div>
                <div style={{ fontSize: 50, fontWeight: 900, fontFamily: MONO, color: currentRank.color, lineHeight: 1, textShadow: `0 0 30px ${currentRank.glow}` }}>
                  <AnimatedNumber value={totalCount} />
                </div>
              </motion.div>
              {nextRank && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12, fontSize: 11, fontFamily: MONO, color: MUTED, marginBottom: 8 }}>
                    <span style={{ color: currentRank.color }}>{currentRank.rank}</span>
                    <span>→</span>
                    <span>{problemsToNext} more needed</span>
                    <span>→</span>
                    <span style={{ color: nextRank }}>{nextRank}</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Progress Ring */}
            {nextRank && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <ProgressRing percent={progress} color={currentRank.color} />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* RANK LADDER — Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '28px 28px 28px 20px', marginBottom: 32,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Rank Ladder</div>
          <div style={{ color: SUBTEXT, fontSize: 13, marginBottom: 28 }}>Each tier unlocks at a problem threshold</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {ALL_RANKS.slice().reverse().map((r, i) => {
              const isCurrent = r.rank === currentRank.rank
              const isUnlocked = totalCount >= r.min
              const isFirst = i === 0
              const isLast = i === ALL_RANKS.length - 1
              return (
                <motion.div
                  key={r.rank}
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.07 }}
                  className="rank-node"
                  style={{
                    display: 'flex', alignItems: 'stretch', gap: 0, transition: 'transform 0.2s ease',
                  }}
                >
                  {/* Timeline column */}
                  <div style={{
                    width: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0,
                  }}>
                    <div style={{
                      width: isCurrent ? 18 : 14, height: isCurrent ? 18 : 14,
                      borderRadius: '50%', flexShrink: 0, marginTop: 18,
                      background: isUnlocked ? r.color : MUTED,
                      border: `3px solid ${isCurrent ? r.color : isUnlocked ? r.bg : 'rgba(255,255,255,0.06)'}`,
                      boxShadow: isCurrent ? `0 0 16px ${r.glow}` : 'none',
                      animation: isCurrent ? 'pulse-dot 2s ease-in-out infinite' : 'none',
                      zIndex: 2,
                    }} />
                    {!isLast && (
                      <div style={{
                        width: 2, flex: 1, minHeight: 8,
                        background: isUnlocked
                          ? `linear-gradient(180deg, ${r.color}50, ${ALL_RANKS[ALL_RANKS.length - 1 - i - 1]?.color ?? MUTED}50)`
                          : 'rgba(255,255,255,0.05)',
                      }} />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{
                    flex: 1, padding: '14px 18px', borderRadius: 12, marginBottom: 6,
                    background: isCurrent ? r.bg : 'transparent',
                    border: `1px solid ${isCurrent ? r.border : 'transparent'}`,
                    boxShadow: isCurrent ? `0 0 25px ${r.glow}` : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: isUnlocked ? r.bg : 'rgba(255,255,255,0.02)',
                        border: `2px solid ${isUnlocked ? r.border : 'rgba(255,255,255,0.05)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        boxShadow: isUnlocked && !isCurrent ? `0 0 12px ${r.glow}` : 'none',
                      }}>
                        {isUnlocked ? (
                          <span style={{ color: r.color, fontSize: 20, fontWeight: 900, fontFamily: MONO }}>{r.label}</span>
                        ) : (
                          <span style={{ fontSize: 16, opacity: 0.3 }}>🔒</span>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: 15, fontWeight: 700,
                          color: isUnlocked ? TEXT : MUTED,
                          display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                          {r.rank}
                          {isCurrent && (
                            <span style={{
                              fontSize: 9, fontFamily: MONO, fontWeight: 700,
                              color: r.color, background: r.bg, border: `1px solid ${r.border}`,
                              padding: '3px 8px', borderRadius: 999, letterSpacing: '0.08em',
                            }}>YOU ARE HERE</span>
                          )}
                          {isUnlocked && !isCurrent && (
                            <span style={{ fontSize: 11, color: GREEN }}>✓</span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: SUBTEXT, marginTop: 1 }}>{r.desc}</div>
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 12, color: isUnlocked ? r.color : MUTED, fontWeight: 600 }}>
                        {r.min}+
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* STREAK SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 28, marginBottom: 32,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Streak System</div>
          <div style={{ color: SUBTEXT, fontSize: 13, marginBottom: 24 }}>Consistency is everything — here's how it works</div>

          {/* Streak counters */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              style={{
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                background: `linear-gradient(135deg, rgba(22,27,34,0.8), rgba(13,17,23,0.8))`,
                border: `1px solid ${BLUE}30`, borderRadius: 16, padding: 28, textAlign: 'center',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 0%, ${BLUE}10, transparent 60%)`, pointerEvents: 'none' }} />
              <div style={{ fontSize: 22, marginBottom: 8, animation: 'float-fire 2s ease-in-out infinite' }}>🔥</div>
              <div style={{ fontSize: 44, fontWeight: 900, fontFamily: MONO, color: BLUE, lineHeight: 1, textShadow: `0 0 20px ${BLUE}40` }}>
                <AnimatedNumber value={currentStreak} />
              </div>
              <div style={{ fontSize: 10, fontFamily: MONO, color: MUTED, letterSpacing: '0.15em', marginTop: 8 }}>CURRENT STREAK</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              style={{
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                background: `linear-gradient(135deg, rgba(22,27,34,0.8), rgba(13,17,23,0.8))`,
                border: `1px solid ${PURPLE}30`, borderRadius: 16, padding: 28, textAlign: 'center',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 0%, ${PURPLE}10, transparent 60%)`, pointerEvents: 'none' }} />
              <div style={{ fontSize: 22, marginBottom: 8 }}>👑</div>
              <div style={{ fontSize: 44, fontWeight: 900, fontFamily: MONO, color: PURPLE, lineHeight: 1, textShadow: `0 0 20px ${PURPLE}40` }}>
                <AnimatedNumber value={longestStreak} />
              </div>
              <div style={{ fontSize: 10, fontFamily: MONO, color: MUTED, letterSpacing: '0.15em', marginTop: 8 }}>LONGEST STREAK</div>
            </motion.div>
          </div>

          {/* Rules */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '✅', color: GREEN, title: 'Complete ALL due reviews', desc: `Every day you have reviews due, you must finish every single one. Your ${dailyCommitment}/day commitment sets how many are scheduled. Clear the full queue to earn today's streak.` },
              { icon: '🆕', color: BLUE, title: 'New problems only when the queue is empty', desc: 'Tracking a new problem only counts for streak when zero reviews are due that day. Finish reviews first, then log new solves.' },
              { icon: '💀', color: RED, title: 'Miss a day, streak resets to zero', desc: 'If an entire calendar day passes without completing your reviews, the streak drops back to 0. Open the app daily to stay alive.' },
              { icon: '📈', color: GOLD, title: 'Longest streak never decreases', desc: 'Your all-time best streak only goes up. Every record you set becomes a permanent milestone on your profile.' },
            ].map((rule, i) => (
              <motion.div
                key={rule.title}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.08 }}
                className="rule-card"
                style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  padding: '16px 18px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.015)', border: `1px solid ${BORDER}`,
                  transition: 'border-color 0.2s, transform 0.2s',
                  cursor: 'default',
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: `${rule.color}10`, border: `1px solid ${rule.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
                }}>{rule.icon}</div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT, marginBottom: 3 }}>{rule.title}</div>
                  <div style={{ fontSize: 12, color: SUBTEXT, lineHeight: 1.55 }}>{rule.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* DAILY FLOW — Connected Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 28,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Daily Flow</div>
          <div style={{ color: SUBTEXT, fontSize: 13, marginBottom: 28 }}>Your typical day with DSA Master</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr auto 1fr', alignItems: 'stretch', gap: 0 }}>
            {[
              { step: '01', icon: '📥', color: BLUE, title: 'Solve & Log', desc: 'Extension captures your solve on LeetCode/GFG and schedules the first spaced review' },
              { step: '02', icon: '📋', color: PURPLE, title: 'Review Queue', desc: 'FSRS picks which problems to review today based on forgetting curves' },
              { step: '03', icon: '🔄', color: GOLD, title: 'Re-solve', desc: 'Open each problem, solve from memory, rate difficulty to adjust the schedule' },
              { step: '04', icon: '🔥', color: GREEN, title: 'Streak', desc: 'All reviews done? Streak goes up. You\'re one step closer to the next rank' },
            ].map((s, i) => (
              <div key={s.step} style={{ display: 'contents' }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="flow-step"
                  style={{
                    background: `${s.color}06`, border: `1px solid ${s.color}18`,
                    borderRadius: 14, padding: '20px 16px', position: 'relative',
                    transition: 'transform 0.2s, border-color 0.2s',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 10, right: 12,
                    fontSize: 28, fontWeight: 900, fontFamily: MONO, color: `${s.color}12`,
                  }}>{s.step}</div>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{s.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 11.5, color: SUBTEXT, lineHeight: 1.5 }}>{s.desc}</div>
                </motion.div>
                {i < 3 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', padding: '0 6px',
                  }}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, color: MUTED, fontFamily: MONO, flexShrink: 0,
                      }}>→</motion.div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
