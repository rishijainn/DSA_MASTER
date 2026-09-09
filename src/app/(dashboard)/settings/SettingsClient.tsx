'use client'

import { useEffect, useRef, useState } from 'react'
import { getRankInfo } from '@/lib/rank'
import { createClient } from '@/lib/supabase/client'

const BG = '#0d1117'
const CARD = '#161b22'
const CARD_INNER = '#0d1117'
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
const SANS = 'Inter, system-ui, sans-serif'

function Card({ children, elevated, accent }: { children: React.ReactNode; elevated?: boolean; accent?: string }) {
  return (
    <div style={{
      background: CARD,
      border: `1px solid ${elevated && accent ? `${accent}28` : BORDER}`,
      borderRadius: 14,
      padding: '28px',
      marginBottom: 28,
      position: 'relative',
      boxShadow: elevated
        ? `0 4px 24px ${accent}11, 0 1px 3px rgba(0,0,0,0.3)`
        : '0 1px 3px rgba(0,0,0,0.2)',
    }}>
      {children}
    </div>
  )
}

function SectionHeader({ icon, color, title, sub }: { icon: React.ReactNode; color: string; title: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${color}14`, border: `1px solid ${color}28`,
        color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ color: TEXT, fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
        {sub && <div style={{ color: SUBTEXT, fontSize: 11, fontFamily: MONO, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

export default function SettingsClient({
  apiToken,
  userName,
  email,
  memberSince,
  totalCount,
  dailyCommitment,
  extensionConnected,
}: {
  apiToken: string
  userName: string
  email: string
  memberSince: string
  totalCount: number
  dailyCommitment: number
  extensionConnected: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [name, setName] = useState(userName)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(userName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  // ── LeetCode sync (extension bridge) ──
  const [extAvailable, setExtAvailable] = useState<'unknown' | 'yes' | 'no'>('unknown')
  const [extVersion, setExtVersion] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [stage, setStage] = useState<null | 'scrape' | 'difficulty' | 'upload' | 'done'>(null)
  const [stageData, setStageData] = useState<{
    page?: number; fetched?: number; unique?: number
    done?: number; total?: number; count?: number
  }>({})
  const [syncResult, setSyncResult] = useState<{ inserted: number; duplicates: number; total: number; imported_more: boolean } | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const reqIdRef = useRef<number>(0)

  const rankInfo = getRankInfo(totalCount)

  function mapSyncError(code: string) {
    const map: Record<string, string> = {
      NO_TOKEN: 'No token stored in the extension. Open the popup, paste your token, and connect first.',
      NO_LEETCODE_SESSION: 'You need to be logged into LeetCode. Open a LeetCode tab, sign in, then try again.',
      NO_ACCEPTED: 'No accepted submissions found for that LeetCode account.',
      SYNC_ALREADY_RUNNING: 'A sync is already in progress. Wait for it to finish.',
    }
    return map[code] || code
  }

  function handleBridgePayload(payload: Record<string, unknown>) {
    if (!payload || typeof payload !== 'object') return
    if (payload.type === 'bridge-status') {
      setExtAvailable(payload.available ? 'yes' : 'no')
    }
    if (payload.type === 'pong') {
      setExtAvailable('yes')
      setExtVersion(String(payload.version ?? '') || null)
    }
    if (payload.__reqId !== reqIdRef.current) return
    if (payload.type === 'sync-progress') {
      setStage(payload.stage as 'scrape' | 'difficulty' | 'upload')
      setStageData({
        page: payload.page as number | undefined,
        fetched: payload.fetched as number | undefined,
        unique: payload.unique as number | undefined,
        done: payload.done as number | undefined,
        total: payload.total as number | undefined,
        count: payload.count as number | undefined,
      })
    }
    if (payload.type === 'sync-result') {
      setSyncResult({ inserted: Number(payload.inserted) || 0, duplicates: Number(payload.duplicates) || 0, total: Number(payload.total) || 0, imported_more: Boolean(payload.imported_more) })
      setStage('done')
      setSyncing(false)
    }
    if (payload.type === 'sync-error') {
      setSyncError(mapSyncError(String(payload.error ?? 'Unknown error')))
      setSyncing(false)
    }
  }

  function postToExtension(payload: Record<string, unknown>) {
    window.postMessage({ target: 'dsa-master-extension', payload }, '*')
  }

  function startSync() {
    if (syncing) return
    setSyncing(true)
    setSyncResult(null)
    setSyncError(null)
    setStage(null)
    setStageData({})
    reqIdRef.current = Date.now() + Math.floor(Math.random() * 100000)
    postToExtension({ type: 'start-sync', __reqId: reqIdRef.current })
  }

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.source !== window) return
      const data = e.data
      if (!data || data.target !== 'dsa-master-site') return
      handleBridgePayload(data.payload)
    }
    window.addEventListener('message', onMessage)
    postToExtension({ type: 'ping', __reqId: 0 })
    const failTimer = setTimeout(() => {
      setExtAvailable((prev) => (prev === 'yes' ? prev : 'no'))
    }, 2500)
    return () => {
      window.removeEventListener('message', onMessage)
      clearTimeout(failTimer)
    }
  }, [])

  useEffect(() => {
    if (editing) {
      nameRef.current?.focus()
      nameRef.current?.select()
    }
  }, [editing])

  function handleCopy() {
    navigator.clipboard.writeText(apiToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleCancelName() {
    setDraft(name)
    setNameError(null)
    setEditing(false)
  }

  async function handleSaveName() {
    const clean = draft.trim()
    if (!clean) {
      setNameError("Name can't be empty")
      return
    }
    if (clean.length > 32) {
      setNameError('Name must be 32 characters or fewer')
      return
    }
    setNameError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: clean }),
      })
      const data = await res.json()
      if (!res.ok) {
        setNameError(data.error ?? 'Failed to save name')
        setSaving(false)
        return
      }
      setName(data.username)
      setSaving(false)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } catch {
      setNameError('Failed to save name')
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: SANS }}>
      <style jsx>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -240px 0; } 100% { background-position: 240px 0; } }
      `}</style>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px 24px' }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ color: MUTED, fontSize: 11, fontFamily: MONO, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>
            DSA Master · Settings
          </div>
          <h1 style={{ color: TEXT, fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: '-0.5px', lineHeight: 1.15 }}>Settings</h1>
          <p style={{ color: SUBTEXT, fontSize: 14, margin: '10px 0 0', lineHeight: 1.5 }}>Manage your account and extension connection</p>
        </div>

        {/* ═══════════════════════════════════════════
            ID CARD — avatar, name, rank, field grid
           ═══════════════════════════════════════════ */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 22, marginBottom: 24 }}>
            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: 16, flexShrink: 0,
              background: `linear-gradient(145deg, ${rankInfo.bg}, ${BLUE}20, ${rankInfo.bg})`,
              border: `2px solid ${rankInfo.border}`,
              boxShadow: `0 4px 20px ${rankInfo.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <span style={{
                color: rankInfo.color, fontFamily: MONO, fontWeight: 900, fontSize: 30,
                textShadow: `0 0 18px ${rankInfo.glow}`,
              }}>
                {(name || 'H').charAt(0).toUpperCase()}
              </span>
              <div style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 16, height: 16, borderRadius: 999,
                background: extensionConnected ? GREEN : RED,
                border: `2.5px solid ${CARD}`,
                boxShadow: extensionConnected ? `0 0 6px ${GREEN}88` : `0 0 6px ${RED}66`,
              }} />
            </div>

            {/* Name + status */}
            <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
              {editing ? (
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      ref={nameRef}
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveName()
                        if (e.key === 'Escape') handleCancelName()
                      }}
                      style={{
                        flex: 1, minWidth: 0, background: CARD_INNER, border: `1px solid ${BLUE}`,
                        borderRadius: 10, padding: '10px 14px', color: TEXT,
                        fontSize: 22, fontWeight: 700, outline: 'none', fontFamily: SANS,
                      }}
                    />
                    <button onClick={handleSaveName} disabled={saving} title="Save name" style={{
                      cursor: 'pointer', width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(88,166,255,0.15)', border: '1px solid rgba(88,166,255,0.3)', color: BLUE,
                    }}>
                      {saving ? (
                        <div style={{ width: 14, height: 14, borderRadius: 999, border: '2px solid rgba(88,166,255,0.3)', borderTopColor: BLUE, animation: 'spin 0.7s linear infinite' }} />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </button>
                    <button onClick={handleCancelName} disabled={saving} title="Cancel" style={{
                      cursor: 'pointer', width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'transparent', border: `1px solid ${BORDER}`, color: SUBTEXT,
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                  {nameError && <div style={{ color: RED, fontSize: 12, marginTop: 8, fontFamily: MONO }}>{nameError}</div>}
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h2 style={{ color: TEXT, fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.3px', lineHeight: 1.1 }}>{name}</h2>
                    <button
                      onClick={() => { setDraft(name); setNameError(null); setEditing(true) }}
                      title="Edit name"
                      style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: MUTED, padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = BLUE)}
                      onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                    </button>
                    {saved && <span style={{ color: GREEN, fontFamily: MONO, fontSize: 12, fontWeight: 700 }}>✓ Saved</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                    <div style={{
                      width: 7, height: 7, borderRadius: 999,
                      background: extensionConnected ? GREEN : RED,
                      boxShadow: extensionConnected ? `0 0 6px ${GREEN}` : 'none',
                      animation: extensionConnected ? 'pulse 2s ease-in-out infinite' : 'none',
                    }} />
                    <span style={{ color: SUBTEXT, fontSize: 12, fontFamily: MONO }}>
                      {extensionConnected ? 'Synced with extension' : 'Extension not connected'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Rank badge — top-right */}
            <div style={{
              padding: '5px 14px', borderRadius: 999, flexShrink: 0, marginTop: 2,
              background: rankInfo.bg, border: `1px solid ${rankInfo.border}`,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ color: rankInfo.color, fontFamily: MONO, fontWeight: 800, fontSize: 10 }}>{rankInfo.label}</span>
              <span style={{ color: rankInfo.color, fontSize: 11, fontWeight: 700 }}>{rankInfo.rank}</span>
            </div>
          </div>

          {/* 2×2 field grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px 24px',
            borderTop: `1px solid ${BORDER}`, paddingTop: 22,
          }}>
            {[
              { label: 'Email', value: email, color: TEXT },
              { label: 'Rank', value: rankInfo.rank, color: rankInfo.color },
              { label: 'Member since', value: memberSince, color: TEXT },
            ].map(f => (
              <div key={f.label}>
                <div style={{ color: MUTED, fontSize: 10, fontFamily: MONO, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>{f.label}</div>
                <div style={{ color: f.color, fontSize: 15, fontWeight: 600, wordBreak: 'break-word' }}>{f.value}</div>
              </div>
            ))}

            {/* Daily commitment — read-only */}
            <div>
              <div style={{ color: MUTED, fontSize: 10, fontFamily: MONO, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>Daily commitment</div>
              <span style={{ color: TEXT, fontSize: 15, fontWeight: 600 }}>{dailyCommitment} problems/day</span>
            </div>
          </div>
        </Card>

        {/* ═══════════════════════════════════════════
            CHROME EXTENSION TOKEN — sensitive element
           ═══════════════════════════════════════════ */}
        <Card elevated accent={GOLD}>
          <SectionHeader
            color={GOLD}
            title="Chrome Extension Token"
            sub="Never expires · Secure connection"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            }
          />

          <p style={{ color: SUBTEXT, fontSize: 13, margin: '0 0 16px', lineHeight: 1.6 }}>
            Paste this token in the DSA Master extension to link your account. Keep it private.
          </p>

          {/* Token input field */}
          <div style={{
            background: CARD_INNER, border: `1px solid ${BORDER}`,
            borderRadius: 10, padding: '0',
            display: 'flex', alignItems: 'center', gap: 0,
          }}>
            <div style={{
              padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0,
              borderRight: `1px solid ${BORDER}`,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.6 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <code style={{ color: GOLD, fontFamily: MONO, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {apiToken}
              </code>
            </div>
            <button
              onClick={handleCopy}
              style={{
                flexShrink: 0,
                padding: '14px 20px',
                fontSize: 12, fontWeight: 700, fontFamily: MONO,
                cursor: 'pointer',
                background: copied ? 'rgba(63,185,80,0.15)' : `${GOLD}18`,
                color: copied ? GREEN : GOLD,
                border: 'none',
                borderRadius: '0 10px 10px 0',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                const t = e.currentTarget as HTMLButtonElement
                t.style.background = copied ? 'rgba(63,185,80,0.25)' : `${GOLD}30`
              }}
              onMouseLeave={e => {
                const t = e.currentTarget as HTMLButtonElement
                t.style.background = copied ? 'rgba(63,185,80,0.15)' : `${GOLD}18`
              }}
            >
              {copied ? '✓ Copied' : 'Copy Token'}
            </button>
          </div>

          <p style={{ color: MUTED, fontSize: 12, margin: '12px 0 0', fontStyle: 'italic', lineHeight: 1.5 }}>
            This token grants read access to your problem history and review schedule.
          </p>
        </Card>

        {/* ═══════════════════════════════════════════
            HOW TO CONNECT THE EXTENSION
           ═══════════════════════════════════════════ */}
        <Card>
          <SectionHeader
            color={PURPLE}
            title="How to connect the extension"
            sub="4 steps to get started"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            }
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              'Install the DSA Master Chrome extension from the Chrome Web Store',
              'Click the extension icon in your browser toolbar',
              'Paste the token above and click Connect',
              'Solve any LeetCode problem — the popup fires automatically on Accepted',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                  background: `${PURPLE}12`, border: `1px solid ${PURPLE}28`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: PURPLE, fontSize: 11, fontWeight: 800, fontFamily: MONO }}>{i + 1}</span>
                </div>
                <p style={{ color: '#b0b8c1', fontSize: 13.5, margin: 0, lineHeight: 1.6, paddingTop: 4 }}>{step}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* ═══════════════════════════════════════════
            LEETCODE HISTORY IMPORT
           ═══════════════════════════════════════════ */}
        <Card elevated accent={BLUE}>
          <SectionHeader
            color={BLUE}
            title="Import your LeetCode history"
            sub="Brings in your full solved backlog"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            }
          />

          <p style={{ color: SUBTEXT, fontSize: 13, margin: '0 0 16px', lineHeight: 1.6 }}>
            One-time setup imports every problem you&apos;ve ever solved on LeetCode as an
            <strong style={{ color: TEXT }}> unreviewed backlog</strong>. Imported problems don&apos;t count toward
            your rank or streak until you review them.
          </p>

          {syncing ? (
            // ── Animated progression: Scanning → Difficulty → Uploading ──
            <div style={{ background: CARD_INNER, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '22px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                {[
                  { key: 'scrape', label: 'Scanning' },
                  { key: 'difficulty', label: 'Difficulty' },
                  { key: 'upload', label: 'Uploading' },
                  { key: 'done', label: 'Done' },
                ].map((s, i) => {
                  const activeIdx = stage === 'done' ? 3 : stage === 'upload' ? 2 : stage === 'difficulty' ? 1 : 0
                  const finished = i < activeIdx
                  const active = i === activeIdx
                  return (
                    <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '5px 10px', borderRadius: 999,
                        background: finished ? `${GREEN}12` : active ? `${BLUE}14` : 'transparent',
                        border: `1px solid ${finished ? `${GREEN}30` : active ? `${BLUE}40` : BORDER}`,
                        color: finished ? GREEN : active ? BLUE : MUTED,
                      }}>
                        <span style={{ fontSize: 10, fontWeight: 800, fontFamily: MONO }}>
                          {finished ? '✓' : i + 1}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{s.label}</span>
                      </div>
                      {i < 3 && <span style={{ color: BORDER, fontSize: 10 }}>→</span>}
                    </div>
                  )
                })}
              </div>

              {stage === 'scrape' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 999, flexShrink: 0,
                    border: '3px solid rgba(88,166,255,0.15)', borderTopColor: BLUE,
                    animation: 'spin 0.9s linear infinite',
                  }} />
                  <div>
                    <div style={{ color: TEXT, fontSize: 13, fontWeight: 600, marginBottom: 3 }}>
                      Fetching page <span style={{ color: BLUE, fontFamily: MONO }}>{stageData.page || '…'}</span>
                    </div>
                    <div style={{ color: SUBTEXT, fontSize: 12, fontFamily: MONO }}>
                      {stageData.fetched ?? 0} submissions scanned · {stageData.unique ?? 0} unique accepted
                    </div>
                  </div>
                </div>
              )}

              {stage === 'difficulty' && (() => {
                const c = 2 * Math.PI * 20
                const pct = stageData.total ? Math.min(1, (stageData.done || 0) / stageData.total) : 0
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
                      <svg width="52" height="52" viewBox="0 0 52 52">
                        <circle cx="26" cy="26" r="20" fill="none" stroke={BORDER} strokeWidth="4" />
                        <circle cx="26" cy="26" r="20" fill="none" stroke={BLUE} strokeWidth="4" strokeLinecap="round"
                          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 26 26)"
                          style={{ transition: 'stroke-dashoffset 0.3s ease' }} />
                      </svg>
                      <span style={{
                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: BLUE, fontSize: 11, fontWeight: 800, fontFamily: MONO,
                      }}>{Math.round(pct * 100)}%</span>
                    </div>
                    <div>
                      <div style={{ color: TEXT, fontSize: 13, fontWeight: 600, marginBottom: 3 }}>Calculating difficulty</div>
                      <div style={{ color: SUBTEXT, fontSize: 12, fontFamily: MONO }}>
                        {stageData.done || 0} / {stageData.total || 0} problems
                      </div>
                    </div>
                  </div>
                )
              })()}

              {stage === 'upload' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                    <span style={{ color: TEXT, fontSize: 13, fontWeight: 600 }}>Uploading to DSA Master</span>
                    <span style={{ color: BLUE, fontSize: 11, fontFamily: MONO, fontWeight: 700 }}>{stageData.count || 0} problems</span>
                  </div>
                  <div style={{
                    height: 8, borderRadius: 999, overflow: 'hidden', background: BORDER,
                    backgroundImage: 'linear-gradient(90deg, rgba(88,166,255,0) 0%, rgba(88,166,255,0.85) 50%, rgba(88,166,255,0) 100%)',
                    backgroundSize: '240px 100%', backgroundRepeat: 'no-repeat',
                    animation: 'shimmer 1.2s infinite linear',
                  }} />
                </div>
              )}

              {stage === 'done' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 999, flexShrink: 0,
                    background: `${GREEN}14`, border: `1px solid ${GREEN}40`,
                    color: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <div>
                    <div style={{ color: TEXT, fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{syncResult ? `${syncResult.inserted} problems imported` : 'Import complete'}</div>
                    <div style={{ color: SUBTEXT, fontSize: 12, fontFamily: MONO }}>{syncResult ? `${syncResult.duplicates} already tracked` : ''}</div>
                  </div>
                </div>
              )}

              <div style={{ color: MUTED, fontSize: 11.5, marginTop: 16, fontFamily: MONO }}>
                Keep this tab open — one or two minutes for a full backlog.
              </div>
            </div>
          ) : stage === 'done' && syncResult ? (
            // ── Success ──
            <div style={{ background: CARD_INNER, border: `1px solid ${GREEN}28`, borderRadius: 12, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 999, flexShrink: 0,
                  background: `${GREEN}14`, border: `1px solid ${GREEN}40`,
                  color: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div>
                  <div style={{ color: TEXT, fontSize: 15, fontWeight: 700 }}>Import complete</div>
                  <div style={{ color: SUBTEXT, fontSize: 12, marginTop: 2 }}>
                    <strong style={{ color: GREEN, fontFamily: MONO }}>{syncResult.inserted}</strong> new problems added to your backlog
                    {syncResult.duplicates > 0 && <> · <strong style={{ color: SUBTEXT, fontFamily: MONO }}>{syncResult.duplicates}</strong> already tracked</>}
                  </div>
                </div>
              </div>
              {syncResult.imported_more && (
                <div style={{ color: GOLD, fontSize: 12, marginBottom: 14, fontFamily: MONO }}>
                  ⚠ This run capped at 500 — run Import again when you&apos;re ready for the rest.
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <a href="/dashboard" style={{
                  flex: 1, textAlign: 'center', padding: '12px 0', borderRadius: 10,
                  background: BLUE, color: '#0d1117', fontSize: 13, fontWeight: 700,
                  textDecoration: 'none', cursor: 'pointer',
                }}>
                  Review them on the Dashboard →
                </a>
                <button onClick={startSync} style={{
                  padding: '12px 20px', borderRadius: 10, cursor: 'pointer',
                  background: 'transparent', border: `1px solid ${BORDER}`, color: BLUE,
                  fontSize: 13, fontWeight: 600,
                }}>
                  Import again
                </button>
              </div>
            </div>
          ) : syncError ? (
            // ── Error ──
            <div style={{ background: CARD_INNER, border: `1px solid ${RED}30`, borderRadius: 12, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 999, flexShrink: 0,
                  background: `${RED}12`, border: `1px solid ${RED}40`,
                  color: RED, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                </div>
                <div>
                  <div style={{ color: TEXT, fontSize: 14, fontWeight: 700 }}>Import failed</div>
                  <div style={{ color: SUBTEXT, fontSize: 12, marginTop: 2, lineHeight: 1.5 }}>{syncError}</div>
                </div>
              </div>
              <button onClick={startSync} style={{
                padding: '11px 22px', borderRadius: 10, cursor: 'pointer',
                background: BLUE, color: '#0d1117', border: 'none',
                fontSize: 13, fontWeight: 700,
              }}>
                Try again
              </button>
            </div>
          ) : (
            // ── Idle ──
            <div>
              {extAvailable === 'no' && (
                <div style={{
                  background: `${GOLD}0d`, border: `1px solid ${GOLD}30`, borderRadius: 10,
                  padding: '12px 14px', marginBottom: 14,
                  color: '#d8c28a', fontSize: 12.5, lineHeight: 1.5,
                }}>
                  <strong style={{ color: GOLD }}>Extension not detected.</strong> Make sure it&apos;s loaded at{' '}
                  <code style={{ fontFamily: MONO }}>chrome://extensions</code> (reload it if you just updated), then refresh this page.
                </div>
              )}
              <button
                onClick={startSync}
                disabled={extAvailable === 'no'}
                onMouseEnter={e => { if (extAvailable !== 'no') e.currentTarget.style.background = BLUE }}
                onMouseLeave={e => { if (extAvailable !== 'no') e.currentTarget.style.background = 'transparent' }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '15px 0', borderRadius: 11,
                  background: extAvailable === 'no' ? 'transparent' : `${BLUE}12`,
                  border: `1.5px solid ${extAvailable === 'no' ? BORDER : BLUE}`,
                  color: extAvailable === 'no' ? MUTED : BLUE,
                  fontSize: 14, fontWeight: 700, cursor: extAvailable === 'no' ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>
                Sync LeetCode history
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <span style={{ color: MUTED, fontSize: 11.5, fontFamily: MONO }}>Status:</span>
                {extAvailable === 'unknown' && <span style={{ color: SUBTEXT, fontSize: 11.5, fontFamily: MONO }}>checking for extension…</span>}
                {extAvailable === 'yes' && <span style={{ color: GREEN, fontSize: 11.5, fontFamily: MONO }}>extension connected{extVersion ? ` · v${extVersion}` : ''} — you&apos;re set</span>}
                {extAvailable === 'no' && <span style={{ color: RED, fontSize: 11.5, fontFamily: MONO }}>connection unavailable</span>}
              </div>
              <p style={{ color: MUTED, fontSize: 11.5, margin: '12px 0 0', lineHeight: 1.6 }}>
                Runs from inside the extension right here — your LeetCode cookie never leaves your browser.
                Just be logged into LeetCode in any tab. Imported problems land in Problem History as unreviewed.
              </p>
            </div>
          )}
        </Card>

        {/* ═══════════════════════════════════════════
            QUICK TIPS
           ═══════════════════════════════════════════ */}
        <Card>
          <SectionHeader
            color={GREEN}
            title="Quick Tips"
            sub="Things worth knowing"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
            }
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { title: 'Auto-Sync', color: BLUE, text: 'Problems solved on LeetCode automatically sync when extension is connected' },
              { title: 'Spaced Repetition', color: PURPLE, text: 'Reviews scheduled using SM-2 algorithm for optimal retention' },
              { title: 'Token Security', color: GOLD, text: 'Token never expires but can be regenerated from extension settings' },
            ].map(tip => (
              <div key={tip.title} style={{
                background: CARD_INNER, border: `1px solid ${BORDER}`,
                borderRadius: 10, padding: '16px 18px',
              }}>
                <p style={{ color: tip.color, fontSize: 10, fontWeight: 700, fontFamily: MONO, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px 0' }}>{tip.title}</p>
                <p style={{ color: SUBTEXT, fontSize: 12.5, margin: 0, lineHeight: 1.5 }}>{tip.text}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* ═══════════════════════════════════════════
            LOGOUT BUTTON
           ═══════════════════════════════════════════ */}
        <button
          onClick={async () => {
            const sb = createClient()
            await sb.auth.signOut()
            window.location.href = '/login'
          }}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 12,
            border: `1px solid ${RED}40`, background: `${RED}08`,
            color: RED, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            marginBottom: 28, transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = `${RED}18`)}
          onMouseLeave={e => (e.currentTarget.style.background = `${RED}08`)}
        >
          Log out
        </button>

        {/* ═══════════════════════════════════════════
            STATUS FOOTER BAR
           ═══════════════════════════════════════════ */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, padding: '20px 0 56px',
          borderTop: `1px solid ${BORDER}`, marginTop: 4,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: 999,
            background: extensionConnected ? GREEN : RED,
            boxShadow: extensionConnected ? `0 0 6px ${GREEN}66` : 'none',
          }} />
          <span style={{ color: MUTED, fontSize: 12, fontFamily: MONO }}>
            Extension: {extensionConnected ? 'Connected' : 'Not connected'}
          </span>
          <span style={{ color: BORDER, margin: '0 2px' }}>·</span>
          <span style={{ color: MUTED, fontSize: 12, fontFamily: MONO }}>
            {syncing ? 'Sync: in progress' : extVersion ? `Sync: v${extVersion}` : 'Sync: idle'}
          </span>
          <span style={{ color: BORDER, margin: '0 2px' }}>·</span>
          <span style={{ color: MUTED, fontSize: 12, fontFamily: MONO }}>v1.0.3</span>
        </div>

      </div>
    </div>
  )
}
