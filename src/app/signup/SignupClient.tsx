'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import OTPInput from '@/components/OTPInput'

/* ──────────────────────────── Corner Constellations ──────────────────────────── */
function CornerParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      const dpr = window.devicePixelRatio || 1
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    window.addEventListener('resize', resize)
    resize()
    setTimeout(resize, 100)

    const stars: { x: number; y: number; baseX: number; baseY: number; size: number; speedX: number; speedY: number }[] = []

    const addCornerParticles = (cx: number, cy: number, radius: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const r = Math.random() * radius
        stars.push({
          x: cx + Math.cos(angle) * r,
          y: cy + Math.sin(angle) * r,
          baseX: cx,
          baseY: cy,
          size: Math.random() * 1.5 + 0.5,
          speedX: (Math.random() - 0.5) * 0.1,
          speedY: (Math.random() - 0.5) * 0.1,
        })
      }
    }

    let initialized = false
    let animId: number

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, w, h)

      if (w > 0 && h > 0 && !initialized) {
        addCornerParticles(50, 50, 150, 15)       // Top Left
        addCornerParticles(w - 50, 50, 150, 15)   // Top Right
        addCornerParticles(w - 50, h - 50, 150, 15) // Bottom Right
        initialized = true
      }

      ctx.lineWidth = 0.5
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x
          const dy = stars[i].y - stars[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 80) {
            ctx.beginPath()
            ctx.moveTo(stars[i].x, stars[i].y)
            ctx.lineTo(stars[j].x, stars[j].y)
            ctx.strokeStyle = `rgba(100, 150, 255, ${0.15 * (1 - dist / 80)})`
            ctx.stroke()
          }
        }
      }

      stars.forEach(s => {
        s.x += s.speedX
        s.y += s.speedY

        const distFromBase = Math.sqrt(Math.pow(s.x - s.baseX, 2) + Math.pow(s.y - s.baseY, 2))
        if (distFromBase > 180) {
          s.speedX *= -1
          s.speedY *= -1
        }

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(140, 200, 255, 0.4)`
        ctx.fill()
      })

      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />
}

/* ──────────────────────────── SVG Icons ──────────────────────────── */
const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)
const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)
const GitHubIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="#8b949e"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
)
const GoogleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
)
const DiscordIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="#8b949e"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" /></svg>
)

/* ──────────────────────────── Page ──────────────────────────── */
export default function SignupClient() {
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dailyCommitment, setDailyCommitment] = useState(5)

  // ---------- UI state ----------
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // ---------- Step 1: send OTP ----------
  async function sendOtp(e: React.MouseEvent<HTMLButtonElement>) {
    if (e) e.preventDefault()
    setLoading(true)
    setError('')

    // DEBUG
    console.log('[signup] email state =', email)

    if (!email) {
      setError('Email is empty – please type an address')
      setLoading(false)
      return
    }

    const res = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email })
    })

    const text = await res.text()
    console.log('[signup] send-otp raw response =', res.status, text)

    let json
    try { json = JSON.parse(text) } catch { json = {} }

    setLoading(false)

    if (!res.ok) {
      setError(json.error ?? 'Could not send code')
      return
    }
    setStep('otp')
  }

  useEffect(() => {
    // trigger entrance animations after mount
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // ---------- Step 2: verify OTP ----------
  async function verifyOtp(code: string) {
    setLoading(true)
    setError('')

    const res = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email,
        code,
        username,
        password,
        dailyCommitment
      })
    })
    const json = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(json.error ?? 'Invalid or expired code')
      return
    }
    // set session on client so middleware sees it
    if (json.session) {
      await supabase.auth.setSession(json.session)
    }
    router.push('/dashboard')
  }

  return (
    <>
      <style>{`
        .auth-page * { box-sizing: border-box; margin: 0; padding: 0; }
        .auth-page { min-height: 100vh; display: flex; background: #0b0c10; font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; overflow: hidden; }
        
        .auth-left { 
          width: 65%; 
          position: relative; 
          background-color: #080a0f;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          border-right: 1px solid #1a1d24; 
          display: flex; 
          flex-direction: column; 
          justify-content: space-between; 
          padding: 48px 64px; 
          z-index: 1; 
        }
        .auth-left::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: radial-gradient(closest-side, rgba(0,0,0,0) 60%, rgba(0,0,0,0.25)), repeating-linear-gradient(transparent, transparent 59px, rgba(255,255,255,0.01) 60px);
          mix-blend-mode: overlay;
          z-index: 1;
        }
        
        .auth-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; background: #0b0d12; position: relative; z-index: 1; }

        .auth-logo { position: relative; z-index: 2; display: flex; align-items: center; gap: 12px; }
        .auth-logo-icon { width: 32px; height: 32px; background: #1a2333; border: 1px solid #2a364f; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #4db8ff; }
        .auth-logo-text { color: #4db8ff; font-weight: 600; font-size: 16px; letter-spacing: -0.2px; }

        .auth-hero { position: relative; z-index: 2; margin-top: -60px; }
        .auth-hero-tag { color: #0284c7; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 24px; font-family: "Geist Mono", "SF Mono", "Fira Code", monospace; }
        .auth-hero-title { color: #ffffff; font-size: 46px; font-weight: 700; line-height: 1.15; margin-bottom: 20px; letter-spacing: -1px; }
        .auth-hero-gradient { background: linear-gradient(90deg, #4db8ff, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .auth-hero-desc { color: #8b949e; font-size: 15px; line-height: 1.6; margin-bottom: 48px; max-width: 380px; }

        .auth-stats { display: flex; gap: 48px; margin-bottom: 32px; }
        .auth-stat-num { color: #ffffff; font-weight: 700; font-size: 20px; margin-bottom: 4px; letter-spacing: -0.5px; }
        .auth-stat-label { color: #8b949e; font-size: 12px; }

        .auth-badges { display: flex; flex-wrap: wrap; gap: 12px; }
        .auth-badge { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.03); border-radius: 20px; padding: 8px 14px; color: #dce9f8; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 8px; backdrop-filter: blur(6px); box-shadow: 0 8px 24px rgba(30, 50, 80, 0.25); }
        .auth-badge span { display: inline-flex; width: 18px; height: 18px; align-items: center; justify-content: center; border-radius: 6px; background: rgba(255,255,255,0.02); }

        .auth-footer-note { position: relative; z-index: 2; color: #484f58; font-size: 11px; font-family: "Geist Mono", "SF Mono", "Fira Code", monospace; }

        .auth-form-wrap { width: 100%; max-width: 380px; position: relative; z-index: 2; }
        /* Entrance transitions */
        .auth-page .auth-hero, .auth-page .auth-badges, .auth-page .auth-stats { transform: translateY(10px); opacity: 0; transition: transform 600ms cubic-bezier(.2,.9,.2,1), opacity 600ms ease; }
        .auth-page .auth-form-wrap { transform: translateY(10px); opacity: 0; transition: transform 600ms cubic-bezier(.2,.9,.2,1), opacity 600ms ease; }
        .auth-page.mounted .auth-hero, .auth-page.mounted .auth-badges, .auth-page.mounted .auth-stats { transform: none; opacity: 1; }
        .auth-page.mounted .auth-form-wrap { transform: none; opacity: 1; }

        .auth-tabs { display: flex; background: #080a0f; border: 1px solid #1a1d24; border-radius: 10px; padding: 4px; margin-bottom: 40px; }
        .auth-tab { flex: 1; text-align: center; padding: 10px; border-radius: 6px; font-size: 13px; font-weight: 500; color: #6e7681; text-decoration: none; transition: color 0.2s; cursor: pointer; background: none; border: none; }
        .auth-tab:hover { color: #c9d1d9; }
        .auth-tab-active { flex: 1; text-align: center; padding: 10px; border-radius: 6px; font-size: 13px; font-weight: 500; background: #1e2532; color: #ffffff; border: 1px solid #2a364f; }

        .auth-heading { color: #ffffff; font-size: 24px; font-weight: 600; margin-bottom: 8px; letter-spacing: -0.5px; }
        .auth-subheading { color: #8b949e; font-size: 14px; margin-bottom: 32px; }

        .auth-field-label { color: #c9d1d9; font-size: 12px; font-weight: 500; display: block; margin-bottom: 8px; }
        .auth-input-wrap { position: relative; display: flex; align-items: center; }
        .auth-input-icon { position: absolute; left: 14px; z-index: 1; display: flex; align-items: center; pointer-events: none; }
        .auth-input { width: 100%; background: #12151a; border: 1px solid #21262d; border-radius: 8px; padding: 12px 14px 12px 42px; font-size: 14px; color: #ffffff; outline: none; transition: border-color 0.2s; font-family: inherit; }
        .auth-input::placeholder { color: #484f58; }
        .auth-input:focus { border-color: #4db8ff; }

        /* subtle glow around focused input */
        .auth-input:focus { box-shadow: 0 6px 24px rgba(77,184,255,0.06); }

        .auth-commitment-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .auth-commitment-btn { padding: 8px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: #12151a; border: 1px solid #21262d; color: #6e7681; font-family: inherit; }
        .auth-commitment-btn:hover { background: #1a1d24; border-color: #30363d; }
        .auth-commitment-btn.active { background: #1a2333; border-color: #2a364f; color: #4db8ff; }
        .auth-commitment-hint { color: #484f58; font-size: 11px; margin-top: 8px; font-weight: 500; }

        .auth-error { background: rgba(248,81,73,0.1); border: 1px solid rgba(248,81,73,0.3); border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #ff7b72; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }

        .auth-submit { width: 100%; padding: 12px; background: linear-gradient(180deg, #2a3b54 0%, #1a2538 100%); border: 1px solid #3b4d6e; border-radius: 8px; color: #ffffff; font-size: 14px; font-weight: 500; cursor: pointer; margin-bottom: 24px; transition: all 0.2s; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .auth-submit:hover { background: linear-gradient(180deg, #324765 0%, #1f2d44 100%); }
        .auth-submit:disabled { opacity: 0.7; cursor: not-allowed; }

        .auth-divider { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
        .auth-divider-line { flex: 1; height: 1px; background: #21262d; }
        .auth-divider-text { color: #484f58; font-size: 11px; font-weight: 500; white-space: nowrap; }

        .auth-social-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
        .auth-social-btn { padding: 10px; background: #12151a; border: 1px solid #21262d; border-radius: 8px; color: #8b949e; font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; font-family: inherit; }
        .auth-social-btn:hover { background: #1a1d24; border-color: #30363d; color: #c9d1d9; }

        .auth-footer-link { color: #484f58; font-size: 12px; text-align: center; }
        .auth-footer-link a { color: #4db8ff; font-weight: 500; text-decoration: none; }
        .auth-footer-link a:hover { text-decoration: underline; }
      `}</style>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div className={`auth-page${mounted ? ' mounted' : ''}`}>
        {/* ═══════ LEFT PANEL ═══════ */}
        <div className="auth-left">
          <CornerParticles />

          <div className="auth-logo">
            <img src="/favicon.svg" alt="" style={{ width: 36, height: 36 }} />
            <span className="auth-logo-text">DSA Master</span>
          </div>

          <div className="auth-hero">
            <p className="auth-hero-tag">SYSTEM INTERFACE v4.0</p>
            <h1 className="auth-hero-title">
              Level up your<br />
              <span className="auth-hero-gradient">coding journey</span>
            </h1>
            <p className="auth-hero-desc">
              Track algorithms, complete quests, and rise through the ranks.
              Your path to becoming an S-Rank coder starts here.
            </p>

            <div className="auth-stats">
              {[
                { n: '48K+', label: 'Coders' },
                { n: '1,200+', label: 'Quests' },
                { n: '99.8%', label: 'Uptime' },
              ].map(s => (
                <div key={s.label}>
                  <p className="auth-stat-num">{s.n}</p>
                  <p className="auth-stat-label">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="auth-badges">
              {[
                { icon: '⚡', text: 'Real-time rank tracking' },
                { icon: '🎯', text: 'Daily quest challenges' },
                { icon: '🏆', text: 'Global leaderboard' },
              ].map(f => (
                <span key={f.text} className="auth-badge">
                  <span>{f.icon}</span> {f.text}
                </span>
              ))}
            </div>
          </div>

          <p className="auth-footer-note">
            Node: KR-Seoul-01 · Ping: 0.002ms · v4.0.1-stable
          </p>
        </div>

        {/* ═══════ RIGHT PANEL ═══════ */}
        <div className="auth-right">
          <div className="auth-form-wrap">

            {/* Tabs */}
            <div className="auth-tabs">
              <a href="/login" className="auth-tab" onClick={(e) => { e.preventDefault(); router.push('/login') }}>Sign In</a>
              <div className="auth-tab-active">Create Account</div>
            </div>

            {/* ===================================================== */}
            {/*  STEP 1 – registration form                         */}
            {/* ===================================================== */}
            {step === 'form' && (
              <>
                <h2 className="auth-heading">Join the System</h2>
                <p className="auth-subheading">Create your hunter profile to get started</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                  {/* Username */}
                  <div>
                    <label className="auth-field-label">Username</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon"><UserIcon /></span>
                      <input className="auth-input" type="text" placeholder="Sung Jin-Woo" value={username} onChange={e => setUsername(e.target.value)} />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="auth-field-label">Email</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon"><MailIcon /></span>
                      <input className="auth-input" type="email" placeholder="hunter@system.io" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="auth-field-label">Password</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon"><LockIcon /></span>
                      <input className="auth-input" type="password" placeholder="min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                  </div>

                  {/* Daily commitment */}
                  <div>
                    <label className="auth-field-label">Daily review commitment</label>
                    <div className="auth-commitment-grid">
                      {[3, 5, 7, 10].map(n => (
                        <button key={n} className={`auth-commitment-btn${dailyCommitment === n ? ' active' : ''}`} onClick={() => setDailyCommitment(n)}>
                          {n}
                        </button>
                      ))}
                    </div>
                    <p className="auth-commitment-hint">problems per day · can change anytime</p>
                  </div>
                </div>

                {error && <div className="auth-error"><span>⚠</span> {error}</div>}

                <button className="auth-submit" onClick={sendOtp} disabled={loading}>
                  {loading ? 'Sending…' : 'Send code →'}
                </button>

                <p className="auth-footer-link">
                  Already have an account? <a href="/login" onClick={(e) => { e.preventDefault(); router.push('/login') }}>Sign in</a>
                </p>
              </>
            )}

            {/* ===================================================== */}
            {/*  STEP 2 – OTP screen                                 */}
            {/* ===================================================== */}
            {step === 'otp' && (
              <>
                <h2 className="auth-heading">Check your e‑mail</h2>
                <p className="auth-subheading">
                  We sent a 6‑digit code to <strong>{email}</strong>
                </p>

                <OTPInput onComplete={verifyOtp} disabled={loading} autoFocus />

                {error && <div className="auth-error"><span>⚠</span> {error}</div>}

                <button
                  className="auth-submit"
                  onClick={() => setStep('form')}
                  disabled={loading}
                  style={{ marginTop: '12px', background: '#21262d', color: '#8b949e' }}
                >
                  ← Back
                </button>
              </>
            )}

            {/* <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">or continue with</span>
              <div className="auth-divider-line" />
            </div> */}

            {/* <div className="auth-social-grid">
              {[
                { name: 'GitHub', icon: <GitHubIcon /> },
                { name: 'Google', icon: <GoogleIcon /> },
                { name: 'Discord', icon: <DiscordIcon /> },
              ].map(p => (
                <button key={p.name} className="auth-social-btn">
                  {p.icon} {p.name}
                </button>
              ))}
            </div> */}
          </div>
        </div>
      </div>
    </>
  )
}