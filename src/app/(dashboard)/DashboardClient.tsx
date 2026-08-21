'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getRankInfo, getRankProgress } from '@/lib/rank'

interface Problem {
  id: string
  title: string
  difficulty: string
  next_review_date: string
  review_count: number
  leetcode_url: string
  leetcode_slug: string
}

interface Props {
  shownProblems: Problem[]
  queueCount: number
  recentProblems: Problem[]
  dailyCommitment: number
  isBacklogged: boolean
  totalCount: number
  streak: number
  streakActive: boolean
}

function getDifficultyConfig(difficulty: string) {
  switch (difficulty) {
    case 'hard':
      return { label: 'S', color: '#ff4444', bg: 'rgba(255,68,68,0.15)', border: 'rgba(255,68,68,0.4)' }
    case 'medium':
      return { label: 'A', color: '#ffd700', bg: 'rgba(255,215,0,0.15)', border: 'rgba(255,215,0,0.4)' }
    default:
      return { label: 'B', color: '#00e4b8', bg: 'rgba(0,228,184,0.15)', border: 'rgba(0,228,184,0.4)' }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const config = getDifficultyConfig(difficulty)
  return (
    <motion.div
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: config.bg,
        border: `1px solid ${config.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `0 0 12px ${config.color}30`
      }}
      whileHover={{ scale: 1.1, boxShadow: `0 0 20px ${config.color}60` }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <span style={{ color: config.color, fontWeight: 900, fontSize: 11 }}>{config.label}</span>
    </motion.div>
  )
}

function ProgressBar({ label, percentage, color }: { label: string; percentage: number; color: string }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), 200)
    return () => clearTimeout(timer)
  }, [percentage])

  return (
    <motion.div style={{ marginBottom: 16 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ color: '#8892b0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <motion.span style={{ color, fontWeight: 600, fontSize: 13 }} animate={{ scale: [1, 1.05, 1] }} transition={{ delay: 0.8, duration: 0.4 }}>{percentage}%</motion.span>
      </div>
      <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', background: `linear-gradient(90deg, ${color}, ${color}aa)`, borderRadius: 4 }}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
    </motion.div>
  )
}

function LevelBadge({ level }: { level: number }) {
  return (
    <motion.div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        background: 'rgba(0,228,184,0.08)',
        border: '1px solid rgba(0,228,184,0.2)',
        borderRadius: 10,
        minWidth: 72
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
      whileHover={{ scale: 1.02, boxShadow: '0 0 24px #00e4b840' }}
    >
      <motion.span
        style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(0,228,184,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        ★
      </motion.span>
      <div>
        <p style={{ color: '#00e4b8', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>LEVEL</p>
        <p style={{ color: '#ffffff', fontSize: 24, fontWeight: 800, margin: 0, lineHeight: 1 }}>{level}</p>
      </div>
    </motion.div>
  )
}

function HeatmapGrid() {
  const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  const cells: boolean[][] = []
  for (let w = 0; w < 7; w++) {
    const week: boolean[] = []
    for (let m = 0; m < months.length; m++) {
      week.push(Math.random() > 0.4)
    }
    cells.push(week)
  }

  return (
    <motion.div style={{ fontSize: 9, color: '#8892b0' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '18px repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        <span />
        {months.map((m, i) => <span key={i} style={{ textAlign: 'center', opacity: 0.6 }}>{m}</span>)}
      </div>
      {days.map((day, d) => (
        <div key={day} style={{ display: 'grid', gridTemplateColumns: '18px repeat(7, 1fr)', gap: 2, alignItems: 'center' }}>
          <span style={{ textAlign: 'right', paddingRight: 4, opacity: 0.5 }}>{day}</span>
          {cells.map((_, w) => (
            <motion.div
              key={`${w}-${d}`}
              style={{
                width: 12, height: 12, borderRadius: 2, margin: '0 auto',
                background: cells[w][d] ? (Math.random() > 0.5 ? '#00e4b8' : '#00e4b888') : 'rgba(255,255,255,0.05)',
                boxShadow: cells[w][d] ? '0 0 4px #00e4b866' : 'none'
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25, delay: w * 0.03 + d * 0.01 }}
              whileHover={{ scale: 1.5, zIndex: 10, boxShadow: '0 0 8px #00e4b8' }}
            />
          ))}
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8, fontSize: 8, opacity: 0.6 }}>
        <span>Less</span>
        <div style={{ display: 'flex', gap: 2 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#00e4b844' }} />
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#00e4b888' }} />
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#00e4b8' }} />
        </div>
        <span>More</span>
      </div>
    </motion.div>
  )
}

function ProblemQuestCard({ problem, index }: { problem: Problem; index: number }) {
  const config = getDifficultyConfig(problem.difficulty)
  return (
    <motion.div
      style={{
        background: 'rgba(13,19,24,0.9)',
        border: `1px solid ${config.border}`,
        borderRadius: 12,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        position: 'relative',
        overflow: 'hidden'
      }}
      variants={cardVariants}
      whileHover={{
        y: -4,
        boxShadow: `0 12px 40px ${config.color}30`,
        borderColor: config.color
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <motion.div
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${config.color}, ${config.color}88)` }}
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#8892b0', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>ID: #{String(index + 1).padStart(4, '0')}</span>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>
      <motion.h3
        style={{ color: '#e6edf3', fontSize: 14, fontWeight: 700, margin: 0, lineHeight: 1.3 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        {problem.title}
      </motion.h3>
      <motion.p
        style={{ color: '#8892b0', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0, maxWidth: '200px' }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        Review count: {problem.review_count ?? 0} · Next review: {problem.next_review_date}
      </motion.p>
    </motion.div>
  )
}

export default function DashboardClient({ shownProblems, queueCount, recentProblems, dailyCommitment, isBacklogged, totalCount, streak, streakActive }: Props) {
  const rankInfo = getRankInfo(totalCount)
  const rankProgress = getRankProgress(totalCount)
  const completionPct = shownProblems.length === 0 ? 100 : Math.round((dailyCommitment - shownProblems.length) / dailyCommitment * 100)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e14', color: '#e6edf3', display: 'flex', fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <style jsx global>{`
        :root { --bg: #0a0e14; --sidebar: #0d1318; --card: rgba(13,19,24,0.9); --border: rgba(255,255,255,0.06); --muted: #8892b0; --primary: #00e4b8; --accent: #a78bfa; --error: #ff4444; --warning: #ffd700; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <AnimatePresence mode="wait">
        <motion.div
          style={{ display: 'flex', minHeight: '100vh', background: '#0a0e14' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* ==================== SIDEBAR ==================== */}
          <motion.aside
            style={{
              width: 280,
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              background: '#0d1318',
              borderRight: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 20,
              overflow: 'hidden',
              padding: '24px 20px'
            }}
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.8 }}
          >
            {/* App Branding */}
            <motion.div
              style={{
                borderRadius: 12,
                padding: 20,
                marginBottom: 32,
                textAlign: 'center',
                background: 'rgba(0,228,184,0.08)',
                border: '1px solid rgba(0,228,184,0.15)'
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <motion.div
                style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #00e4b8, #a78bfa)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#0a0e14', fontWeight: 800 }}
                animate={{ rotate: [0, 0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear', delay: 2 }}
              >
                S
              </motion.div>
              <h3 style={{ color: '#e6edf3', fontSize: 18, fontWeight: 600, margin: '0 0 4px 0', letterSpacing: '-0.2px' }}>Hunter</h3>
              <p style={{ color: '#8892b0', fontSize: 11, margin: 0, fontFamily: 'monospace' }}>v4.0.1</p>
            </motion.div>

            {/* User Profile Card */}
            <motion.div
              style={{
                borderRadius: 16,
                padding: 24,
                textAlign: 'center',
                marginBottom: 32,
                background: 'rgba(13,19,24,0.8)',
                border: '1px solid var(--border)',
                position: 'relative'
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.div
                style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg, #1a2333, #0d1318)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#00e4b8', fontWeight: 700, border: '2px solid rgba(0,228,184,0.3)' }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px #00e4b860' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                SJ
              </motion.div>
              <motion.p style={{ color: '#e6edf3', fontSize: 15, fontWeight: 600, margin: '0 0 8px 0' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>Sung Jin-Woo</motion.p>
              <motion.div
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 20, padding: '4px 12px' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 20 }}
              >
                <motion.span
                  style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffd700' }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span style={{ color: '#ffd700', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'monospace' }}>S-Class · Lv 42</span>
              </motion.div>
            </motion.div>

            {/* Divider */}
            <motion.hr style={{ borderColor: 'var(--border)', margin: '24px 0' }} initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />

            {/* Navigation Menu */}
            <motion.nav
              style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, staggerChildren: 0.05 }}
            >
              {[
                { path: '/dashboard', label: 'Dashboard', icon: '����' },
                { path: '/history', label: 'Hunter Quests', icon: '����' },
                { path: '/skills', label: 'Skill Library', icon: '����' },
                { path: '/tracking', label: 'Portal Tracking', icon: '����' },
                { path: '/shop', label: 'System Shop', icon: '����' },
                { path: '/settings', label: 'Settings', icon: '������' }
              ].map((item, i) => {
                const isActive = item.path === '/dashboard'
                return (
                  <motion.div
                    key={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 16px',
                      borderRadius: 10,
                      margin: '4px 0',
                      cursor: 'pointer',
                      background: isActive ? 'rgba(0,228,184,0.12)' : 'transparent',
                      border: isActive ? '1px solid #00e4b8' : '1px solid transparent',
                      color: isActive ? '#00e4b8' : '#8892b0',
                      fontWeight: isActive ? 600 : 400,
                      fontSize: 13,
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: 8, background: isActive ? 'rgba(0,228,184,0.18)' : 'rgba(0,228,184,0.06)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <span style={{ width: 22, fontSize: 16, textAlign: 'center' }}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {isActive && <motion.span style={{ width: 8, height: 8, background: '#00e4b8', borderRadius: '50%', flexShrink: 0, boxShadow: '0 0 8px #00e4b8' }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />}
                  </motion.div>
                )
              })}
            </motion.nav>

            {/* Upgrade System Button */}
            <motion.div
              style={{ marginTop: 'auto' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <motion.button
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 12,
                  border: '1px solid #00e4b8',
                  background: 'transparent',
                  color: '#00e4b8',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                whileHover={{ background: 'rgba(0,228,184,0.08)', boxShadow: '0 0 24px #00e4b840', scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                Upgrade System
              </motion.button>
            </motion.div>
          </motion.aside>

          {/* ==================== MAIN CONTENT ==================== */}
          <motion.main
            style={{ flex: 1, marginLeft: 280, padding: '40px 48px 32px' }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {/* Top Bar */}
            <motion.header
              style={{
                background: 'rgba(13,14,20,0.7)',
                borderBottom: '1px solid var(--border)',
                backdropFilter: 'blur(20px)',
                padding: '20px 32px',
                marginBottom: 32,
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 24
              }}
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div>
                <motion.h1 style={{ color: '#e6edf3', fontSize: 30, fontWeight: 800, letterSpacing: '-0.4px', margin: '0 0 4px 0' }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>Hunter Dashboard</motion.h1>
                <motion.p style={{ color: '#8892b0', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0, fontFamily: 'monospace' }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>v4.0.1 · S-Class Hunter</motion.p>
              </div>
              <motion.div style={{ display: 'flex', alignItems: 'center', gap: 16 }} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <input
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '10px 18px',
                    color: '#e6edf3',
                    fontSize: 13,
                    width: 320,
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  placeholder="Search database..."
                  onFocus={e => { e.currentTarget.style.borderColor = '#00e4b8'; e.currentTarget.style.boxShadow = '0 0 0 3px #00e4b822' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
                />
                <motion.div
                  style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,68,68,0.12)', border: '1px solid rgba(255,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#ff4444', position: 'relative' }}
                  whileHover={{ scale: 1.1, boxShadow: '0 0 16px #ff444460' }}
                  animate={{ boxShadow: '0 0 0 0 #ff444460' }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ���
                  <motion.span
                    style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, background: '#ff4444', borderRadius: '50%', border: '2px solid #0a0e14', fontSize: 7, color: '#0a0e14', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    7
                  </motion.span>
                </motion.div>
                <motion.div
                  style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #1a2333, #0d1318)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#00e4b8', border: '1px solid rgba(0,228,184,0.3)' }}
                  whileHover={{ scale: 1.1, rotate: 6, boxShadow: '0 0 20px #00e4b840' }}
                  whileTap={{ scale: 0.95 }}
                >
                  SJ
                </motion.div>
              </motion.div>
            </motion.header>

            {/* Alert Banner */}
            <motion.div
              style={{
                background: 'rgba(255,68,68,0.06)',
                border: '1px solid rgba(255,68,68,0.15)',
                borderRadius: 14,
                padding: '18px 24px',
                marginBottom: 32,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                backdropFilter: 'blur(10px)'
              }}
              initial={{ opacity: 0, y: -30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
            >
              <motion.div
                style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 20px rgba(255,68,68,0.2)' }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span style={{ fontSize: 16 }}>���</span>
              </motion.div>
              <motion.div style={{ flex: 1 }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <p style={{ color: '#ff4444', fontSize: 15, fontWeight: 700, margin: '0 0 4px 0' }}>7 quests awaiting you</p>
                <p style={{ color: '#8892b0', fontSize: 12, margin: 0 }}>Seven uncompleted S-Rank algorithms have surpassed their 24h deadline</p>
              </motion.div>
              <motion.button
                style={{
                  padding: '10px 22px',
                  borderRadius: 24,
                  border: '1px solid rgba(255,68,68,0.3)',
                  background: 'rgba(255,68,68,0.08)',
                  color: '#ff4444',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
                whileHover={{ background: 'rgba(255,68,68,0.15)', boxShadow: '0 0 16px rgba(255,68,68,0.3)', scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Start now
              </motion.button>
            </motion.div>

            {/* ==================== TWO-COLUMN LAYOUT ==================== */}
            <motion.div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 420px',
                gap: 32,
                alignItems: 'start'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, staggerChildren: 0.1 }}
            >
              {/* LEFT COLUMN: Profile Summary */}
              <motion.div
                style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
                variants={staggerContainer}
              >
                <motion.section
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 20,
                    padding: '32px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  variants={cardVariants}
                >
                  <motion.div
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                    <motion.span style={{ color: '#8892b0', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'monospace' }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>YOUR PROGRESS</motion.span>
                    <motion.div style={{ display: 'flex', alignItems: 'center', gap: 16 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                      <LevelBadge level={42} />
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#ffd700', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>S-Class</p>
                        <p style={{ color: '#8892b0', fontSize: 10, margin: 0, fontFamily: 'monospace' }}>Lv 42</p>
                      </div>
                    </motion.div>
                  </div>

                  <motion.h2 style={{ color: '#e6edf3', fontSize: 26, fontWeight: 700, letterSpacing: '-0.4px', margin: '0 0 28px 0' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>Profile Summary</motion.h2>

                  <motion.div
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}
                    variants={staggerContainer}
                  >
                    <ProgressBar label="Arrays Completed" percentage={84} color="#00e4b8" />
                    <ProgressBar label="Graphs Mastery" percentage={62} color="#ffd700" />
                    <ProgressBar label="Dynamic Programming" percentage={31} color="#ff4444" />
                  </motion.div>
                </motion.section>
              </motion.div>

              {/* RIGHT COLUMN: Coding Streak + Daily Quests */}
              <motion.div
                style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
                variants={staggerContainer}
              >
                {/* Coding Streak Card */}
                <motion.section
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 20,
                    padding: '28px 28px 16px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  variants={cardVariants}
                >
                  <motion.div
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                      <h2 style={{ color: '#e6edf3', fontSize: 20, fontWeight: 600, margin: '0 0 10px 0' }}>Coding Streak</h2>
                      <div style={{ display: 'flex', gap: 20, fontSize: 11, fontFamily: 'monospace' }}>
                        <span style={{ color: '#ffd700' }}>�� {streak}d / Current</span>
                        <span style={{ color: '#8892b0' }}>�� {streakActive ? '���� Active' : '������ Inactive'}</span>
                      </div>
                    </motion.div>
                    <motion.div style={{ textAlign: 'right', minWidth: 100 }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                      <p style={{ color: '#e6edf3', fontSize: 16, fontWeight: 700, margin: 0 }}>18d / Longest</p>
                      <p style={{ color: '#8892b0', fontSize: 9, margin: '2px 0 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>streak</p>
                    </motion.div>
                  </div>

                  <motion.p style={{ color: '#8892b0', fontSize: 11, margin: '0 0 16px 0' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>66 solutions in the last 6 months</motion.p>
                  
                  <HeatmapGrid />
                </motion.section>

                {/* Daily Quests Section */}
                <motion.section
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    overflow: 'hidden'
                  }}
                  variants={cardVariants}
                >
                  <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ color: '#8892b0', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px 0', fontFamily: 'monospace' }}>Daily Quests</p>
                      <p style={{ color: '#e6edf3', fontSize: 12, margin: 0 }}>Active portals in your vicinity</p>
                    </div>
                    <motion.a href="#" style={{ color: '#00e4b8', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none', fontFamily: 'monospace' }} whileHover={{ x: 4 }}>
                      View all →
                    </motion.a>
                  </div>
                  <motion.div
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, padding: '20px 22px 22px' }}
                    variants={staggerContainer}
                  >
                    {shownProblems.length === 0 ? (
                      <motion.div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#8892b0' }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <p style={{ fontSize: 24, margin: '0 0 8px 0' }}>���</p>
                        <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px 0' }}>All quests complete</p>
                        <p style={{ fontSize: 11 }}>No reviews due. Solve problems to queue new quests.</p>
                      </motion.div>
                    ) : (
                      shownProblems.map((p, i) => <ProblemQuestCard key={p.id} problem={p} index={i} />)
                    )}
                  </motion.div>
                </motion.section>
              </motion.div>
            </motion.div>

            {/* ==================== FOOTER BAR ==================== */}
            <motion.footer
              style={{
                padding: '16px 32px',
                borderTop: '1px solid var(--border)',
                marginTop: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 10,
                color: '#8892b0',
                fontFamily: 'monospace'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <span>Coordinates: 37.5665° N, 126.9780° E</span>
              <motion.span style={{ color: '#a78bfa', fontWeight: 500 }} whileHover={{ color: '#00e4b8' }}>System Diagnostics: Optimal</motion.span>
              <div style={{ display: 'flex', gap: 20 }}>
                <span>Server: MONARCH-01</span>
                <motion.a href="#" style={{ color: '#00e4b8', textDecoration: 'none', fontWeight: 500 }} whileHover={{ scale: 1.05 }}>Logs</motion.a>
              </div>
            </motion.footer>
          </motion.main>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}