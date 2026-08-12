'use client'

import { useEffect, useRef, useState } from 'react'
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
      return { label: 'S', color: '#f85149', bg: 'rgba(248,81,73,0.15)', border: 'rgba(248,81,73,0.4)', glow: 'rgba(248,81,73,0.3)' };
    case 'medium':
      return { label: 'A', color: '#d29922', bg: 'rgba(210,153,34,0.15)', border: 'rgba(210,153,34,0.4)', glow: 'rgba(210,153,34,0.3)' };
    default:
      return { label: 'B', color: '#388bfd', bg: 'rgba(56,139,253,0.15)', border: 'rgba(56,139,253,0.4)', glow: 'rgba(56,139,253,0.3)' };
  }
}

function daysOverdue(dateStr: string) {
  const today = new Date();
  const due = new Date(dateStr);
  const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return { text: 'Due today', color: '#8b949e', urgent: false };
  if (diff > 0) return { text: `${diff}d overdue`, color: '#d29922', urgent: true };
  return { text: `In ${Math.abs(diff)}d`, color: '#484f58', urgent: false };
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

function StatCard({ label, value, color, icon, trend, prefix = '', suffix = '' }: { 
  label: string; value: string | number; color: string; icon: string; trend?: string; prefix?: string; suffix?: string 
}) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #161b22 0%, #0d1117 100%)',
      border: `1px solid ${color}30`,
      borderRadius: '12px',
      padding: '16px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{icon}</div>
        <span style={{ color: '#484f58', fontSize: '9px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ color, fontFamily: 'monospace', fontWeight: '800', fontSize: '28px', lineHeight: 1 }}>{prefix}{value}{suffix}</span>
        {trend && <span style={{ color: '#3fb950', fontSize: '11px', fontWeight: '600', marginLeft: '4px' }}>{trend}</span>}
      </div>
    </div>
  );
}

function QuestCard({ problem, index, onStart }: { problem: Problem; index: number; onStart: () => void }) {
  const [hovered, setHovered] = useState(false);
  const config = getDifficultyConfig(problem.difficulty);
  const overdue = daysOverdue(problem.next_review_date);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'linear-gradient(135deg, #1c2430 0%, #161b22 100%)' : '#161b22',
        border: `1px solid ${hovered ? config.border : '#21262d'}`,
        borderRadius: '12px',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: hovered ? `0 8px 32px ${config.glow}` : 'none',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${config.color}, ${config.color}88)` }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <span style={{ color: '#484f58', fontSize: '10px', fontFamily: 'monospace' }}>QUEST #{String(index + 1).padStart(4, '0')}</span>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: config.bg, border: `1px solid ${config.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: `0 0 12px ${config.glow}`
        }}>
          <span style={{ color: config.color, fontWeight: '900', fontSize: '14px', textShadow: `0 0 8px ${config.color}` }}>{config.label}</span>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ color: '#e6edf3', fontSize: '15px', fontWeight: '700', margin: '0 0 6px 0', lineHeight: 1.3 }}>{problem.title}</p>
        <p style={{ color: '#8b949e', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>
          <span style={{ color: config.color, fontWeight: '600', textTransform: 'capitalize' }}>{problem.difficulty}</span> difficulty · {problem.review_count}× cleared
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '4px' }}>
        <span style={{ 
          color: overdue.urgent ? '#d29922' : overdue.color, 
          fontSize: '11px', 
          fontFamily: 'monospace',
          fontWeight: overdue.urgent ? '700' : '400',
          animation: overdue.urgent ? 'pulse 1.5s ease-in-out infinite' : 'none'
        }}>{overdue.text}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onStart(); }}
          style={{
            background: config.bg, border: `1px solid ${config.border}`, borderRadius: '6px',
            padding: '7px 16px', color: config.color, fontSize: '12px', fontWeight: '700',
            cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '6px',
            boxShadow: `0 0 0 1px ${config.color}20`
          }}
          onMouseEnter={e => e.currentTarget.style.cssText += `background: ${config.color}; color: white; box-shadow: 0 0 16px ${config.glow};`}
          onMouseLeave={e => e.currentTarget.style.cssText = `background: ${config.bg}; color: ${config.color}; border: 1px solid ${config.border}; border-radius: 6px; padding: 7px 16px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 6px; box-shadow: 0 0 0 1px ${config.color}20;`}
        >
          <span>Start</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  );
}

function RankDisplay({ rankInfo, totalCount, rankProgress }: { rankInfo: ReturnType<typeof getRankInfo>; totalCount: number; rankProgress: number }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, #161b22 0%, #0d1117 100%)', border: `1px solid ${rankInfo.border}`, borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${rankInfo.color}, transparent)` }} />
      <div style={{ position: 'absolute', top: '20px', right: '20px', width: '80px', height: '80px', background: `radial-gradient(circle, ${rankInfo.color}15 0%, transparent 70%)`, borderRadius: '50%', pointerEvents: 'none' }} />
      <p style={{ color: '#484f58', fontSize: '9px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px 0', position: 'relative', zIndex: 1 }}>CURRENT RANK</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px', position: 'relative', zIndex: 1 }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '14px',
          background: `linear-gradient(135deg, ${rankInfo.bg}, ${rankInfo.color}30)`,
          border: `2px solid ${rankInfo.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: `0 0 24px ${rankInfo.glow}, inset 0 0 24px ${rankInfo.color}20`
        }}>
          <span style={{ color: rankInfo.color, fontWeight: '900', fontSize: '26px', textShadow: `0 0 12px ${rankInfo.color}` }}>{rankInfo.label}</span>
        </div>
        <div>
          <p style={{ color: '#e6edf3', fontSize: '18px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>{rankInfo.rank}</p>
          <p style={{ color: '#8b949e', fontSize: '12px', margin: 0 }}>{totalCount} problems tracked</p>
        </div>
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#484f58', fontSize: '10px', fontFamily: 'monospace' }}>Progress to {rankInfo.nextRank || 'Max'}</span>
          <span style={{ color: rankInfo.color, fontSize: '10px', fontFamily: 'monospace', fontWeight: '700' }}>{rankProgress}%</span>
        </div>
        <div style={{ height: '6px', background: '#0d1117', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
          <div style={{
            height: '100%', width: `${rankProgress}%`,
            background: `linear-gradient(90deg, ${rankInfo.color}, ${rankInfo.color}aa)`,
            borderRadius: '3px', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: `0 0 8px ${rankInfo.color}, 0 0 16px ${rankInfo.color}80`
          }} />
        </div>
      </div>
      <p style={{ 
        color: rankInfo.next ? '#484f58' : rankInfo.color, 
        fontSize: '11px', fontFamily: 'monospace', margin: '12px 0 0 0',
        fontWeight: rankInfo.next ? '400' : '700',
        position: 'relative', zIndex: 1
      }}>
        {rankInfo.next ? `${totalCount} / ${rankInfo.next} to ${rankInfo.nextRank}` : '★ Maximum rank achieved — S-Class Hunter'}
      </p>
    </div>
  );
}

function StreakCard({ streak, streakActive }: { streak: number; streakActive: boolean }) {
  const color = streakActive ? '#f97316' : streak > 0 ? '#d29922' : '#484f58';
  const icon = streakActive ? '🔥' : streak > 0 ? '❄️' : '💤';
  return (
    <div style={{
      background: 'linear-gradient(135deg, #161b22 0%, #0d1117 100%)',
      border: `1px solid ${color}40`,
      borderRadius: '16px',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <p style={{ color: '#484f58', fontSize: '9px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px 0' }}>DAILY STREAK</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
        <span style={{ fontSize: '48px', filter: streakActive ? 'drop-shadow(0 0 12px #f97316)' : 'none' }}>{icon}</span>
        <p style={{ color, fontFamily: 'monospace', fontWeight: '900', fontSize: '42px', margin: 0, lineHeight: 1, textShadow: streakActive ? `0 0 16px ${color}` : 'none' }}>{streak}</p>
      </div>
      <p style={{ color: '#8b949e', fontSize: '12px', margin: 0, fontFamily: 'monospace' }}>
        {streakActive ? `${streak} day${streak === 1 ? '' : 's'} on fire` : streak > 0 ? 'complete quests to continue streak' : 'complete all quests to start'}
      </p>
    </div>
  );
}

export default function DashboardClient({ shownProblems, queueCount, recentProblems, dailyCommitment, isBacklogged, totalCount, streak, streakActive }: Props) {
  const totalReviewed = recentProblems.reduce((a, p) => a + (p.review_count ?? 0), 0);
  const rankInfo = getRankInfo(totalCount);
  const rankProgress = getRankProgress(totalCount);
  const completionPct = shownProblems.length === 0 ? 100 : Math.round((dailyCommitment - shownProblems.length) / dailyCommitment * 100);

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3', display: 'flex', fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", monospace' }}>
      <style jsx global>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 12px rgba(56,139,253,0.3); } 50% { box-shadow: 0 0 24px rgba(56,139,253,0.5); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>

      <main style={{ flex: 1, minHeight: '100vh', padding: '24px 28px 40px' }}>
        {/* Top bar */}
        <div style={{
          height: '60px', background: 'rgba(13,17,23,0.95)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #21262d', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 28px', position: 'sticky', top: 0,
          zIndex: 10, flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '4px', height: '24px', background: 'linear-gradient(180deg, #388bfd, #a78bfa)', borderRadius: '2px' }} />
            <h1 style={{ color: '#e6edf3', fontSize: '17px', fontWeight: '700', margin: 0, letterSpacing: '-0.3px' }}>Hunter Dashboard</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(22,27,34,0.8)', border: '1px solid #21262d',
              borderRadius: '10px', padding: '8px 16px', width: '220px'
            }}>
              <span style={{ color: '#484f58', fontSize: '13px' }}>🔍</span>
              <span style={{ color: '#484f58', fontSize: '12px', flex: 1 }}>Search database...</span>
              <kbd style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: '4px', padding: '2px 6px', fontSize: '9px', color: '#484f58', fontFamily: 'monospace' }}>⌘K</kbd>
            </div>
            <div style={{
              width: '38px', height: '38px', background: 'rgba(22,27,34,0.8)',
              border: '1px solid #21262d', borderRadius: '10px', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: '16px' }}>H</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', overflow: 'hidden', paddingTop: '20px' }}>
        <div style={{ flex: 1, padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
          <ParticlesBg color="rgba(88,166,255,0.08)" count={30} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

            {/* Backlog alert */}
            {isBacklogged && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'linear-gradient(135deg, rgba(210,153,34,0.1) 0%, rgba(210,153,34,0.03) 100%)',
                border: '1px solid rgba(210,153,34,0.3)', borderRadius: '14px',
                padding: '18px 24px', animation: 'float 3s ease-in-out infinite',
                boxShadow: '0 0 24px rgba(210,153,34,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'rgba(210,153,34,0.15)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    boxShadow: '0 0 16px rgba(210,153,34,0.2)'
                  }}>
                    <span style={{ fontSize: '18px', animation: 'pulse 1.5s ease-in-out infinite' }}>⚠</span>
                  </div>
                  <div>
                    <p style={{ color: '#d29922', fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0' }}>{queueCount} quests awaiting review</p>
                    <p style={{ color: '#a67c00', fontSize: '12px', margin: 0, maxWidth: '400px' }}>Uncompleted quests have surpassed their 24h deadline. Clear backlog before adding new problems.</p>
                  </div>
                </div>
                <button style={{
                  background: 'rgba(210,153,34,0.15)', border: '1px solid rgba(210,153,34,0.4)',
                  borderRadius: '8px', padding: '10px 22px', color: '#d29922',
                  fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                  whiteSpace: 'nowrap', transition: 'all 0.2s',
                  boxShadow: '0 0 12px rgba(210,153,34,0.15)'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(210,153,34,0.25)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(210,153,34,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(210,153,34,0.15)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(210,153,34,0.15)'; }}
              >
                Start Clearing →
              </button>
              </div>
            )}

            {/* Main grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>

              {/* Left column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Profile Summary Card */}
                <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
                  <ParticlesBg color="rgba(56,139,253,0.06)" count={25} />
                  <div style={{ position: 'relative', zIndex: 1, padding: '28px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '28px', alignItems: 'center' }}>
                      {/* Rank badge */}
                      <div style={{
                        background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
                        border: `1px solid ${rankInfo.border}`, borderRadius: '14px',
                        padding: '24px', textAlign: 'center', position: 'relative',
                        boxShadow: `0 0 24px ${rankInfo.glow}, inset 0 0 24px ${rankInfo.color}10`
                      }}>
                        <p style={{ color: '#484f58', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px 0' }}>RANK</p>
                        <p style={{ color: rankInfo.color, fontSize: '52px', fontWeight: '900', margin: '0 0 4px 0', lineHeight: 1, fontFamily: 'monospace', textShadow: `0 0 16px ${rankInfo.color}` }}>{rankInfo.label}</p>
                        <p style={{ color: rankInfo.color, fontSize: '12px', fontFamily: 'monospace', margin: 0, fontWeight: '600' }}>{rankInfo.rank}</p>
                      </div>
                      {/* Progress stats */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <p style={{ color: '#484f58', fontSize: '9px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0' }}>PROFILE SUMMARY</p>
                          <p style={{ color: '#e6edf3', fontSize: '22px', fontWeight: '800', margin: '0 0 16px 0', letterSpacing: '-0.4px', background: 'linear-gradient(90deg, #e6edf3, #58a6ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Hunter Profile</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                          <StatCard label="Tracked" value={recentProblems.length} color="#58a6ff" icon="📊" prefix="" suffix="" />
                          <StatCard label="Reviews" value={totalReviewed} color="#a78bfa" icon="🔄" prefix="" suffix="" />
                          <StatCard label="Today's Progress" value={`${completionPct}%`} color={completionPct === 100 ? '#3fb950' : '#d29922'} icon={completionPct === 100 ? '✅' : '⏳'} prefix="" suffix="" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Quests */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <h2 style={{ color: '#e6edf3', fontSize: '17px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>📋</span> Daily Quests
                      </h2>
                      <p style={{ color: '#8b949e', fontSize: '12px', margin: 0 }}>Active portals in your vicinity</p>
                    </div>
                    {queueCount > 0 && (
                      <button style={{ background: 'none', border: 'none', color: '#58a6ff', fontSize: '12px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', transition: 'all 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(88,166,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        View all →
                      </button>
                    )}
                  </div>

                  {shownProblems.length === 0 ? (
                    <div style={{
                      background: 'linear-gradient(135deg, #161b22 0%, #0d1117 100%)',
                      border: '1px dashed #21262d', borderRadius: '14px',
                      padding: '56px 32px', textAlign: 'center', position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{ position: 'absolute', top: '20px', right: '20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(88,166,255,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <p style={{ fontSize: '40px', margin: '0 0 14px 0', animation: 'float 3s ease-in-out infinite' }}>✨</p>
                        <p style={{ color: '#8b949e', fontSize: '16px', fontWeight: '700', margin: '0 0 6px 0' }}>All quests complete</p>
                        <p style={{ color: '#484f58', fontSize: '13px', margin: 0, maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' }}>No reviews due. Solve problems on LeetCode to queue new quests.</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                      {shownProblems.map((p, i) => (
                        <QuestCard key={p.id} problem={p} index={i} onStart={() => window.open(p.leetcode_url, '_blank')} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right column — Stats & Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '80px' }}>
                
                {/* Performance Stats */}
                <div style={{
                  background: 'linear-gradient(135deg, #161b22 0%, #0d1117 100%)',
                  border: '1px solid #21262d', borderRadius: '16px', padding: '24px',
                  position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #58a6ff, transparent)' }} />
                  <p style={{ color: '#e6edf3', fontSize: '14px', fontWeight: '700', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>📈</span> Performance
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <StatCard label="Due Today" value={`${shownProblems.length} / ${dailyCommitment}`} color="#58a6ff" icon="📅" />
                    <StatCard label="In Queue" value={`${queueCount} pending`} color={queueCount > 0 ? '#d29922' : '#3fb950'} icon="⏳" />
                  </div>
                  
                  <StatCard label="Total Tracked" value={`${totalCount} problems`} color="#a78bfa" icon="🎯" />
                  
                  <div style={{ borderTop: '1px solid #21262d', paddingTop: '16px', marginTop: '8px' }}>
                    <p style={{ color: '#484f58', fontSize: '9px', fontFamily: 'monospace', margin: '0 0 4px 0' }}>Shadow-OS v1.0.1</p>
                    <p style={{ color: '#484f58', fontSize: '9px', fontFamily: 'monospace', margin: 0 }}>Server: IN-Delhi-01 · Uptime: 99.9%</p>
                  </div>
                </div>

                {/* Rank Card */}
                <RankDisplay rankInfo={rankInfo} totalCount={totalCount} rankProgress={rankProgress} />

                {/* Streak Card */}
                <StreakCard streak={streak} streakActive={streakActive} />

                {/* Quest Board */}
                <div style={{
                  background: 'linear-gradient(135deg, #161b22 0%, #0d1117 100%)',
                  border: '1px solid #21262d', borderRadius: '16px', overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #a78bfa, transparent)' }} />
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #21262d' }}>
                    <p style={{ color: '#e6edf3', fontSize: '13px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px' }}>🏆</span> Quest Board
                    </p>
                  </div>
                  {recentProblems.length === 0 ? (
                    <div style={{ padding: '28px 20px', textAlign: 'center' }}>
                      <p style={{ color: '#484f58', fontSize: '13px', margin: 0 }}>No problems tracked yet</p>
                    </div>
                  ) : (
                    recentProblems.slice(0, 8).map((p, i) => {
                      const config = getDifficultyConfig(p.difficulty);
                      return (
                        <div key={p.id} style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px 20px', borderBottom: i < recentProblems.length - 1 ? '1px solid #21262d' : 'none',
                          transition: 'background 0.15s'
                        }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '8px',
                            background: config.bg, border: `1px solid ${config.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, boxShadow: `0 0 8px ${config.glow}`
                          }}>
                            <span style={{ color: config.color, fontWeight: '800', fontSize: '11px' }}>{config.label}</span>
                          </div>
                          <span style={{
                            color: '#8b949e', fontSize: '13px',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1
                          }}>{p.title}</span>
                          <span style={{ color: '#484f58', fontSize: '10px', fontFamily: 'monospace' }}>{p.review_count}×</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  )
}