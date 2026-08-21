'use client'

import { useRef, type ReactNode } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from 'framer-motion'

const CHROME_STORE_URL = '#'

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

const SANS = "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
const MONO = "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace"

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98]

function FadeUp({
  children,
  delay = 0,
  y = 24,
  className,
  style,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  style?: React.CSSProperties
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      style={style}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.35, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

function Eyebrow({ children, color = MUTED }: { children: ReactNode; color?: string }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color,
      }}
    >
      {children}
    </div>
  )
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: ReactNode
  subtitle?: string
}) {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', marginBottom: 56 }}>
      <FadeUp>
        <Eyebrow color={BLUE}>{eyebrow}</Eyebrow>
      </FadeUp>
      <FadeUp delay={0.05}>
        <h2
          style={{
            margin: '14px 0 0',
            fontSize: 'clamp(30px, 4.5vw, 46px)',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            color: TEXT,
          }}
        >
          {title}
        </h2>
      </FadeUp>
      {subtitle && (
        <FadeUp delay={0.1}>
          <p style={{ margin: '14px 0 0', color: SUBTEXT, fontSize: 16, lineHeight: 1.6 }}>{subtitle}</p>
        </FadeUp>
      )}
    </div>
  )
}

function Gradient({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <span
      style={{
        background: GRADIENT,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        ...style,
      }}
    >
      {children}
    </span>
  )
}

const container = {
  maxWidth: 1120,
  margin: '0 auto',
  padding: '0 24px',
}

function rankBadgeSvg({ size = 24, color = RED }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
        fill={color}
        style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
      />
    </svg>
  )
}

// Deterministic heatmap data so the preview never shifts between renders
function seededHeatmap(seed: number) {
  const rand = (() => {
    let a = seed
    return () => {
      a |= 0
      a = (a + 0x6d2b79f5) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  })()
  const r = rand()
  const cell = () => {
    const v = rand()
    if (v < 0.45) return 0
    if (v < 0.68) return 1
    if (v < 0.84) return 2
    if (v < 0.95) return 3
    return 4 + Math.floor(rand() * 3)
  }
  return {
    streak: 12 + Math.floor(r * 24),
    cells: Array.from({ length: 26 * 7 }, cell),
  }
}

function useTilt(max = 6) {
  const reduce = useReducedMotion()
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 22 })
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 22 })
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    ry.set(px * max * 2)
    rx.set(-py * max * 2)
  }
  const onMouseLeave = () => {
    rx.set(0)
    ry.set(0)
  }
  return { rx, ry, onMouseMove, onMouseLeave }
}

// ---------------------------------------------------------------------------
// HERO
// ---------------------------------------------------------------------------

function Hero() {
  const reduce = useReducedMotion()

  const badge = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.3 },
    animate: reduce ? { opacity: 1 } : { opacity: 1, scale: 1 },
    transition: reduce
      ? { duration: 0.25 }
      : { type: 'spring' as const, stiffness: 220, damping: 16 },
  }

  const badgeGlow = {
    initial: { opacity: 0, boxShadow: '0 0 0px 0 rgba(248,81,73,0)' },
    animate: {
      opacity: 1,
      boxShadow: '0 0 48px 6px rgba(248,81,73,0.32), 0 0 120px 0px rgba(248,81,73,0.18)',
    },
    transition: { duration: reduce ? 0.2 : 0.8, delay: reduce ? 0 : 0.15, ease: EASE },
  }

  const item = (delay: number, y = 24) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y },
    animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: EASE },
  })

  return (
    <header style={{ position: 'relative', overflow: 'hidden' }}>
      {/* ambient background glows */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -160,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 900,
          height: 900,
          background:
            'radial-gradient(closest-side, rgba(88,166,255,0.14), rgba(167,139,250,0.07), transparent)',
          pointerEvents: 'none',
        }}
      />

      <div style={container as React.CSSProperties}>
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '22px 0',
          }}
        >
          <motion.div initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <a
              href="/landing"
              style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: 'linear-gradient(135deg, #f8514933, #f85149)',
                  border: '1px solid rgba(248,81,73,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: 14,
                  fontFamily: MONO,
                }}
              >
                S
              </span>
              <span style={{ color: TEXT, fontWeight: 800, letterSpacing: '-0.01em' }}>DSA MASTER</span>
            </a>
          </motion.div>
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            style={{ display: 'flex', alignItems: 'center', gap: 20 }}
          >
            <a
              href="#how-it-works"
              className="hidden md:inline"
              style={{ color: SUBTEXT, fontSize: 14, textDecoration: 'none' }}
            >
              How it works
            </a>
            <a
              href="/dashboard"
              style={{
                fontFamily: MONO,
                fontSize: 12,
                color: TEXT,
                textDecoration: 'none',
                border: `1px solid ${BORDER}`,
                background: CARD,
                padding: '9px 14px',
                borderRadius: 10,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              Hunter Dashboard <span style={{ color: BLUE }}>→</span>
            </a>
          </motion.div>
        </nav>

        <div
          className="grid items-center md:grid-cols-[minmax(0,1fr)_460px]"
          style={{ gap: 56, padding: '84px 0 120px' }}
        >
          <div className="md:justify-self-center">
            <motion.div
              initial={badge.initial}
              animate={badge.animate}
              transition={badge.transition}
            >
              <motion.div
                initial={badgeGlow.initial}
                animate={badgeGlow.animate}
                transition={badgeGlow.transition}
                style={{
                  width: 'min(300px, 68vw)',
                  aspectRatio: '1',
                  borderRadius: 28,
                  background: `linear-gradient(160deg, #1d2026, ${CARD})`,
                  border: '1px solid rgba(248,81,73,0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  position: 'relative',
                }}
              >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 28,
                  background:
                    'radial-gradient(closest-side at 50% 30%, rgba(248,81,73,0.22), transparent 70%)',
                }}
              />
              <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.24em', color: SUBTEXT }}>RANK</div>
              <div
                style={{
                  color: RED,
                  fontSize: 'clamp(96px, 18vw, 148px)',
                  fontWeight: 900,
                  lineHeight: 1,
                  fontFamily: MONO,
                  textShadow: '0 0 40px rgba(248,81,73,0.6)',
                }}
              >
                S
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  letterSpacing: '0.2em',
                  color: RED,
                  textTransform: 'uppercase',
                }}
              >
                S-Rank
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontFamily: MONO,
                  fontSize: 11,
                  color: MUTED,
                  letterSpacing: '0.1em',
                }}
              >
                248 SOLVES · 61 DAY STREAK
              </div>
            </motion.div>
            </motion.div>
          </div>

          {/* Copy column */}
          <div className="flex flex-col items-center gap-5 md:items-start">
            <motion.div {...item(0.35, 16)}>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: BLUE,
                  border: `1px solid ${BLUE}33`,
                  background: 'rgba(88,166,255,0.08)',
                  padding: '6px 12px',
                  borderRadius: 999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: 999, background: BLUE, display: 'inline-block' }} />
                Chrome Extension · Hunter Rank System
              </span>
            </motion.div>

            <motion.h1
              {...item(0.5)}
              style={{
                margin: 0,
                fontSize: 'clamp(40px, 6vw, 64px)',
                fontWeight: 900,
                lineHeight: 1.02,
                letterSpacing: '-0.03em',
                color: TEXT,
              }}
            >
              Stop grinding.
              <br />
              Start <Gradient>leveling.</Gradient>
            </motion.h1>

            <motion.p
              {...item(0.62)}
              style={{ margin: 0, color: SUBTEXT, fontSize: 17, lineHeight: 1.6, maxWidth: 480 }}
            >
              DSA Master turns every LeetCode session into an RPG run — auto-tracked
              hints and attempts, FSRS-ranked reviews, and a Hunter Rank (S/A/B) that
              reflects how you actually solve, not how you say you grind.
            </motion.p>

            <motion.div {...item(0.74)} style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <a
                href={CHROME_STORE_URL}
                style={{
                  background: GRADIENT,
                  color: '#0d1117',
                  fontWeight: 800,
                  fontSize: 15,
                  padding: '14px 26px',
                  borderRadius: 12,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 0 40px -8px rgba(88,166,255,0.55)',
                }}
              >
                {rankBadgeSvg({ size: 16, color: '#0d1117' })}
                Add to Chrome
              </a>
              <a
                href="#how-it-works"
                style={{
                  border: `1px solid ${BORDER}`,
                  background: CARD,
                  color: TEXT,
                  fontWeight: 700,
                  fontSize: 15,
                  padding: '14px 24px',
                  borderRadius: 12,
                  textDecoration: 'none',
                }}
              >
                How it works
              </a>
            </motion.div>

            <motion.div
              {...item(0.86)}
              style={{
                display: 'flex',
                gap: 22,
                flexWrap: 'wrap',
                marginTop: 10,
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: '0.08em',
                color: MUTED,
                textTransform: 'uppercase',
              }}
            >
              <span>Auto-tracked sessions</span>
              <span style={{ color: `${BLUE}55` }}>·</span>
              <span>FSRS recall engine</span>
              <span style={{ color: `${BLUE}55` }}>·</span>
              <span>Streak heatmap</span>
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  )
}

// ---------------------------------------------------------------------------
// DASHBOARD PREVIEW
// ---------------------------------------------------------------------------

function heatColor(count: number) {
  if (count === 0) return CARD
  if (count === 1) return '#0d3a5f'
  if (count === 2) return '#155a8a'
  if (count === 3) return '#1f7fbf'
  return BLUE
}

function DashboardPreview() {
  const reduce = useReducedMotion()
  const { rx, ry, onMouseMove, onMouseLeave } = useTilt(3.5)
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.4'] })
  const glowY = useTransform(scrollYProgress, [0, 1], [40, 0])
  const glow = useMotionTemplate`0 40px 120px -30px rgba(88,166,255,0.25), ${glowY}px 0 0 0 rgba(0,0,0,0)`
  const heat = seededHeatmap(1337)

  const quests = [
    { id: '0001', title: 'Find Median from Two Sorted Arrays', rank: 'S', color: RED, due: 'Due today' },
    { id: '0002', title: 'Longest Palindromic Substring', rank: 'A', color: GOLD, due: '2d overdue' },
    { id: '0003', title: 'Container With Most Water', rank: 'B', color: BLUE, due: 'In 3d' },
  ]

  return (
    <section id="dashboard" style={{ padding: '40px 0 120px', position: 'relative' }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '20%',
          right: '-15%',
          width: 560,
          height: 560,
          background: 'radial-gradient(closest-side, rgba(167,139,250,0.1), transparent)',
          pointerEvents: 'none',
        }}
      />
      <div style={container as React.CSSProperties}>
        <SectionHeading
          eyebrow="Live Dashboard"
          title={
            <>
              Your grind, <Gradient>visualized.</Gradient>
            </>
          }
          subtitle="The same dashboard you get the moment you install. Rank badge, daily quests, FSRS queue, and a heatmap that shows exactly where the streak lives."
        />

        <FadeUp y={40}>
          <div style={{ perspective: 1200 }} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
            <motion.div
              ref={ref}
              style={{
                transformStyle: 'preserve-3d',
                rotateX: reduce ? 0 : rx,
                rotateY: reduce ? 0 : ry,
                boxShadow: reduce ? '0 40px 120px -30px rgba(88,166,255,0.25)' : glow,
                borderRadius: 18,
                border: `1px solid ${BORDER}`,
                background: BG,
                overflow: 'hidden',
              }}
            >
              {/* window chrome */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  borderBottom: `1px solid ${BORDER}`,
                  background: CARD,
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: 999, background: RED }} />
                <span style={{ width: 10, height: 10, borderRadius: 999, background: GOLD }} />
                <span style={{ width: 10, height: 10, borderRadius: 999, background: GREEN }} />
                <span
                  style={{
                    marginLeft: 12,
                    fontFamily: MONO,
                    fontSize: 11,
                    color: SUBTEXT,
                    letterSpacing: '0.06em',
                  }}
                >
                  hunter-dashboard — DSA Master
                </span>
              </div>

              <div
                className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2"
              >
                {/* left column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr',
                      gap: 16,
                      alignItems: 'center',
                      background: `linear-gradient(135deg, ${CARD}, ${BG})`,
                      border: '1px solid #21262d',
                      borderRadius: 16,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        aspectRatio: '1',
                        borderRadius: 14,
                        background: 'linear-gradient(135deg, rgba(248,81,73,0.18), rgba(248,81,73,0.05))',
                        border: '2px solid rgba(248,81,73,0.5)',
                        boxShadow: '0 8px 32px rgba(248,81,73,0.25)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                      }}
                    >
                      <div style={{ fontFamily: MONO, fontSize: 9, color: SUBTEXT, letterSpacing: '0.2em' }}>RANK</div>
                      <div style={{ color: RED, fontSize: 40, fontWeight: 900, fontFamily: MONO, lineHeight: 1 }}>S</div>
                      <div style={{ fontFamily: MONO, fontSize: 9, color: RED }}>S-RANK</div>
                    </div>
                    <div>
                      <div style={{ color: SUBTEXT, fontSize: 11, fontFamily: MONO, marginBottom: 4 }}>PROFILE SUMMARY</div>
                      <div style={{ color: TEXT, fontWeight: 800, fontSize: 18, marginBottom: 10 }}>Sung Jin-Woo</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {[
                          { label: 'TRACKED', value: '248', color: BLUE },
                          { label: 'REVIEWS', value: '1.4k', color: PURPLE },
                          { label: 'TODAY', value: '80%', color: GOLD },
                        ].map((s) => (
                          <div
                            key={s.label}
                            style={{
                              flex: 1,
                              background: CARD,
                              border: '1px solid #21262d',
                              borderRadius: 10,
                              padding: '8px 10px',
                              textAlign: 'center',
                            }}
                          >
                            <div style={{ color: s.color, fontWeight: 800, fontFamily: MONO, fontSize: 14 }}>{s.value}</div>
                            <div style={{ color: MUTED, fontSize: 8, fontFamily: MONO, letterSpacing: '0.08em' }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: 10,
                      }}
                    >
                      <div>
                        <div style={{ color: TEXT, fontWeight: 800, fontSize: 15 }}>Daily Quests</div>
                        <div style={{ color: MUTED, fontSize: 11 }}>Active portals in your vicinity</div>
                      </div>
                      <div style={{ color: BLUE, fontSize: 12, fontFamily: MONO }}>VIEW ALL →</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {quests.map((q) => (
                        <div
                          key={q.id}
                          style={{
                            background: CARD,
                            border: '1px solid #21262d',
                            borderRadius: 12,
                            padding: '10px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: `${q.color}1f`,
                              border: `1px solid ${q.color}55`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: q.color,
                              fontWeight: 800,
                              fontFamily: MONO,
                              flexShrink: 0,
                            }}
                          >
                            {q.rank}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: MUTED, fontSize: 9, fontFamily: MONO }}>QUEST #{q.id}</div>
                            <div style={{ color: TEXT, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {q.title}
                            </div>
                          </div>
                          <div
                            style={{
                              fontFamily: MONO,
                              fontSize: 10,
                              color: q.due.startsWith('2') ? GOLD : SUBTEXT,
                              flexShrink: 0,
                            }}
                          >
                            {q.due}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* right column: heatmap + stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${CARD}, ${BG})`,
                      border: '1px solid #21262d',
                      borderRadius: 16,
                      padding: 16,
                      flex: 1,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ color: TEXT, fontWeight: 800, fontSize: 15 }}>Coding Streak</div>
                        <div style={{ color: MUTED, fontSize: 11 }}>312 solutions in 6 months</div>
                      </div>
                      <div style={{ display: 'flex', gap: 14 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: BLUE, fontWeight: 800, fontFamily: MONO }}>{heat.streak}d</div>
                          <div style={{ color: MUTED, fontSize: 8, fontFamily: MONO, letterSpacing: '0.08em' }}>CURRENT</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: PURPLE, fontWeight: 800, fontFamily: MONO }}>41d</div>
                          <div style={{ color: MUTED, fontSize: 8, fontFamily: MONO, letterSpacing: '0.08em' }}>LONGEST</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 2.5 }}>
                      {Array.from({ length: 26 }, (_, w) => (
                        <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                          {Array.from({ length: 7 }, (_, d) => (
                            <div
                              key={d}
                              style={{
                                width: 9,
                                height: 9,
                                borderRadius: 2.5,
                                background: heatColor(heat.cells[w * 7 + d]),
                              }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 5, marginTop: 10 }}>
                      <span style={{ color: MUTED, fontSize: 9, fontFamily: MONO }}>LESS</span>
                      {[CARD, '#0d3a5f', '#155a8a', '#1f7fbf', BLUE].map((c) => (
                        <div key={c} style={{ width: 9, height: 9, borderRadius: 2.5, background: c }} />
                      ))}
                      <span style={{ color: MUTED, fontSize: 9, fontFamily: MONO }}>MORE</span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 14,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        background: `linear-gradient(135deg, ${CARD}, ${BG})`,
                        border: '1px solid #21262d',
                        borderRadius: 14,
                        padding: 14,
                      }}
                    >
                      <div style={{ color: MUTED, fontSize: 9, fontFamily: MONO, letterSpacing: '0.1em', marginBottom: 8 }}>NEXT QUEST · FSRS</div>
                      <div style={{ color: RED, fontWeight: 800, fontFamily: MONO, fontSize: 22 }}>S</div>
                      <div style={{ color: SUBTEXT, fontSize: 11, marginTop: 4, lineHeight: 1.5 }}>
                        Regressed — recall 0.21. Recommended now.
                      </div>
                    </div>
                    <div
                      style={{
                        background: `linear-gradient(135deg, ${CARD}, ${BG})`,
                        border: '1px solid #21262d',
                        borderRadius: 14,
                        padding: 14,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ color: MUTED, fontSize: 9, fontFamily: MONO, letterSpacing: '0.1em' }}>STREAK STATUS</div>
                      <div style={{ fontSize: 26 }}>🔥</div>
                      <div style={{ color: GOLD, fontWeight: 800, fontFamily: MONO }}>{heat.streak} days on fire</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// HOW IT WORKS
// ---------------------------------------------------------------------------

const STEPS = [
  {
    num: '01',
    title: 'Install the extension',
    desc: 'One click from the Chrome Web Store. Pin it and move on.',
    color: BLUE,
    tag: 'INSTALL',
  },
  {
    num: '02',
    title: 'Create your Hunter profile',
    desc: 'Sign in once. Your profile starts climbing the moment you do.',
    color: PURPLE,
    tag: 'SIGN IN',
  },
  {
    num: '03',
    title: 'Solve on LeetCode as usual',
    desc: 'Hints, idle time, run attempts — captured silently. Zero manual logging.',
    color: RED,
    tag: 'AUTO-TRACK',
  },
  {
    num: '04',
    title: 'Check your dashboard',
    desc: 'Rank, streak heatmap, and the FSRS-picked next quest — ready where you left off.',
    color: GOLD,
    tag: 'RANK UP',
  },
]

function HowItWorks() {
  const reduce = useReducedMotion()
  const railRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ['start 0.72', 'end 0.55'],
  })

  return (
    <section id="how-it-works" style={{ padding: '40px 0 120px', background: BG }}>
      <div style={container as React.CSSProperties}>
        <SectionHeading
          eyebrow="The Questline"
          title={
            <>
              Four steps to <Gradient>your first rank.</Gradient>
            </>
          }
          subtitle="No configuration, no data entry, no ritual. Install, sign in, solve, and let the system do the bookkeeping."
        />

        <div ref={railRef} style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          {/* rail */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: 27,
              top: 16,
              bottom: 16,
              width: 2,
              background: BORDER,
              borderRadius: 999,
            }}
          />
          <motion.div
            aria-hidden
            style={{
              position: 'absolute',
              left: 27,
              top: 16,
              bottom: 16,
              width: 2,
              background: GRADIENT,
              borderRadius: 999,
              transformOrigin: 'top',
              boxShadow: '0 0 12px rgba(88,166,255,0.5)',
              ...(reduce ? {} : { scaleY: scrollYProgress }),
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {STEPS.map((step, i) => (
              <FadeUp key={step.num} delay={i * 0.03}>
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    gap: 22,
                    paddingLeft: 0,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: `linear-gradient(135deg, ${CARD}, ${BG})`,
                      border: `1px solid ${step.color}66`,
                      boxShadow: `0 0 28px -8px ${step.color}88`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: MONO,
                      fontWeight: 800,
                      fontSize: 17,
                      color: step.color,
                      flexShrink: 0,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    {step.num}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      background: CARD,
                      border: '1px solid #21262d',
                      borderRadius: 14,
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        letterSpacing: '0.14em',
                        color: step.color,
                      }}
                    >
                      STEP {step.num} · {step.tag}
                    </div>
                    <div style={{ color: TEXT, fontWeight: 800, fontSize: 17 }}>{step.title}</div>
                    <div style={{ color: SUBTEXT, fontSize: 14, lineHeight: 1.55 }}>{step.desc}</div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// FEATURES
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    icon: '🎯',
    eyebrow: 'Auto-Tracking',
    title: 'Your grind, logged for you.',
    desc: 'Every session counts itself — hints used, idle time, run attempts. The extension watches quietly in the background so you never open a log again.',
    color: BLUE,
  },
  {
    icon: '🧠',
    eyebrow: 'FSRS Recall Engine',
    title: 'Knows what you\'re forgetting.',
    desc: 'Not just the next problem in a list. FSRS schedules reviews by your actual recall curve — the problems your memory is dropping resurface first.',
    color: PURPLE,
  },
  {
    icon: '⚔️',
    eyebrow: 'Hunter Rank',
    title: 'Rank up on real solves.',
    desc: 'S. A. B. Your tier is earned from real solving activity, not self-reported streaks. Every accepted solution pushes you toward the next rank.',
    color: RED,
  },
  {
    icon: '🔥',
    eyebrow: 'Streak Heatmap',
    title: 'Don\'t break the chain.',
    desc: 'A GitHub-style calendar of your grind. Miss a day and the portal closes. Keep the streak alive and the wall burns gold.',
    color: GOLD,
  },
]

function Features() {
  return (
    <section id="features" style={{ padding: '40px 0 120px', position: 'relative' }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '10%',
          left: '-12%',
          width: 480,
          height: 480,
          background: 'radial-gradient(closest-side, rgba(88,166,255,0.08), transparent)',
          pointerEvents: 'none',
        }}
      />
      <div style={container as React.CSSProperties}>
        <SectionHeading
          eyebrow="Core Systems"
          title={
            <>
              Built for the <Gradient>long grind.</Gradient>
            </>
          }
          subtitle="Four systems, one loop: solve, get tracked, get ranked, get the next quest. Repeat until S."
        />

        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FEATURES.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.06}>
              <div
                style={{
                  position: 'relative',
                  background: `linear-gradient(160deg, ${CARD}, ${BG})`,
                  border: '1px solid #21262d',
                  borderRadius: 16,
                  padding: '24px 22px',
                  height: '100%',
                  transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)'
                  e.currentTarget.style.borderColor = `${f.color}66`
                  e.currentTarget.style.boxShadow = `0 12px 40px -12px ${f.color}88, 0 0 0 1px ${f.color}22 inset`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = BORDER
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${f.color}1f`,
                    border: `1px solid ${f.color}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    marginBottom: 18,
                  }}
                >
                  {f.icon}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: '0.16em',
                    color: f.color,
                    marginBottom: 10,
                  }}
                >
                  {f.eyebrow}
                </div>
                <div style={{ color: TEXT, fontWeight: 800, fontSize: 18, lineHeight: 1.25, marginBottom: 10 }}>
                  {f.title}
                </div>
                <div style={{ color: SUBTEXT, fontSize: 14, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// FINAL CTA
// ---------------------------------------------------------------------------

function FinalCTA() {
  const reduce = useReducedMotion()
  return (
    <section style={{ padding: '40px 0 100px', position: 'relative', overflow: 'hidden' }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800,
          height: 800,
          background:
            'radial-gradient(closest-side, rgba(88,166,255,0.14), rgba(167,139,250,0.07), transparent)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ ...(container as React.CSSProperties), textAlign: 'center', position: 'relative' }}>
        <FadeUp>
          <Eyebrow color={RED}>Ready to rank up?</Eyebrow>
        </FadeUp>
        <FadeUp delay={0.05}>
          <h2
            style={{
              margin: '16px 0 0',
              fontSize: 'clamp(32px, 5vw, 54px)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: TEXT,
            }}
          >
            Your next rank is
            <br />
            <Gradient>one solve away.</Gradient>
          </h2>
        </FadeUp>
        <FadeUp delay={0.12}>
          <p style={{ margin: '18px auto 0', maxWidth: 460, color: SUBTEXT, fontSize: 16, lineHeight: 1.6 }}>
            Install DSA Master and turn the grind into a game. Your hunter rank is
            waiting — and it only climbs if you actually solve.
          </p>
        </FadeUp>
        <FadeUp delay={0.2}>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 34, flexWrap: 'wrap' }}>
            <motion.a
              href={CHROME_STORE_URL}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4, delay: 0.2, ease: EASE }}
              style={{
                background: GRADIENT,
                color: '#0d1117',
                fontWeight: 800,
                fontSize: 16,
                padding: '16px 32px',
                borderRadius: 12,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 0 50px -10px rgba(167,139,250,0.6)',
              }}
            >
              {rankBadgeSvg({ size: 18, color: '#0d1117' })}
              Add to Chrome
            </motion.a>
            <a
              href="#how-it-works"
              style={{
                border: `1px solid ${BORDER}`,
                background: CARD,
                color: TEXT,
                fontWeight: 700,
                fontSize: 16,
                padding: '16px 28px',
                borderRadius: 12,
                textDecoration: 'none',
              }}
            >
              See how it works
            </a>
          </div>
        </FadeUp>
        <FadeUp delay={0.28}>
          <div
            style={{
              marginTop: 26,
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '0.1em',
              color: MUTED,
              textTransform: 'uppercase',
            }}
          >
            Free to install · No manual logging · Your LeetCode data stays yours
          </div>
        </FadeUp>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// FOOTER
// ---------------------------------------------------------------------------

function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${BORDER}`, padding: '34px 0 44px', background: BG }}>
      <div
        style={{
          ...(container as React.CSSProperties),
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #f8514933, #f85149)',
              border: '1px solid rgba(248,81,73,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 900,
              fontSize: 12,
              fontFamily: MONO,
            }}
          >
            S
          </span>
          <span style={{ color: SUBTEXT, fontSize: 13, fontWeight: 700 }}>DSA Master</span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: MUTED, maxWidth: 420, lineHeight: 1.7 }}>
          DSA Master is an independent tool and is not affiliated with or endorsed by
          LeetCode. LeetCode is a trademark of LeetCode, Inc.
        </div>
      </div>
    </footer>
  )
}

// ---------------------------------------------------------------------------

export default function LandingClient() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        color: TEXT,
        fontFamily: SANS,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <Hero />
      <DashboardPreview />
      <HowItWorks />
      <Features />
      <FinalCTA />
      <Footer />
    </div>
  )
}
