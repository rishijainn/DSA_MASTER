'use client'

import { useState } from 'react'

export default function SettingsClient({ apiToken }: { apiToken: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(apiToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", monospace' }}>
      <style jsx>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px 48px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '4px', height: '24px', background: 'linear-gradient(180deg, #58a6ff, #a78bfa)', borderRadius: '2px' }} />
            <h1 style={{ color: '#e6edf3', fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>Settings</h1>
          </div>
          <p style={{ color: '#8b949e', fontSize: '13px', margin: 0 }}>Manage your account and extension connection</p>
        </div>

        {/* Token Card */}
        <div style={{
          background: 'linear-gradient(135deg, #161b22 0%, #0d1117 100%)',
          border: '1px solid #21262d',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #ffa116, transparent)' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,161,22,0.15)', border: '1px solid rgba(255,161,22,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 12px rgba(255,161,22,0.2)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffa116" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"/><path d="M6 12h12M12 6v12"/></svg>
            </div>
            <div>
              <p style={{ color: '#e6edf3', fontSize: '14px', fontWeight: '700', margin: '0 0 2px 0' }}>Chrome Extension Token</p>
              <p style={{ color: '#8b949e', fontSize: '11px', margin: 0, fontFamily: 'monospace' }}>Never expires · Secure connection</p>
            </div>
          </div>

          <p style={{ color: '#8b949e', fontSize: '12px', margin: '0 0 16px 0', lineHeight: 1.5 }}>
            Paste this token in the DSA Shadow extension to link your account. Keep it private.
          </p>

          <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <code style={{ color: '#ffa116', fontFamily: 'monospace', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {apiToken}
            </code>
            <button
              onClick={handleCopy}
              style={{
                flexShrink: 0,
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                fontFamily: 'monospace',
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: copied ? 'rgba(63,185,80,0.15)' : 'rgba(88,166,255,0.15)',
                color: copied ? '#3fb950' : '#58a6ff',
                border: copied ? '1px solid rgba(63,185,80,0.3)' : '1px solid rgba(88,166,255,0.3)',
                boxShadow: copied ? '0 0 12px rgba(63,185,80,0.2)' : '0 0 12px rgba(88,166,255,0.15)',
              }}
              onMouseEnter={e => {
                const target = e.currentTarget as HTMLButtonElement
                if (copied) {
                  target.style.background = 'rgba(63,185,80,0.25)'
                  target.style.boxShadow = '0 0 20px rgba(63,185,80,0.3)'
                } else {
                  target.style.background = 'rgba(88,166,255,0.25)'
                  target.style.boxShadow = '0 0 20px rgba(88,166,255,0.3)'
                }
              }}
              onMouseLeave={e => {
                const target = e.currentTarget as HTMLButtonElement
                if (copied) {
                  target.style.background = 'rgba(63,185,80,0.15)'
                  target.style.boxShadow = '0 0 12px rgba(63,185,80,0.2)'
                } else {
                  target.style.background = 'rgba(88,166,255,0.15)'
                  target.style.boxShadow = '0 0 12px rgba(88,166,255,0.15)'
                }
              }}
            >
              {copied ? '✓ Copied' : 'Copy Token'}
            </button>
          </div>
        </div>

        {/* How to Connect Card */}
        <div style={{
          background: 'linear-gradient(135deg, #161b22 0%, #0d1117 100%)',
          border: '1px solid #21262d',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #a78bfa, transparent)' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 12px rgba(167,139,250,0.2)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
            </div>
            <p style={{ color: '#e6edf3', fontSize: '14px', fontWeight: '700', margin: 0 }}>How to connect the extension</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              'Install the DSA Shadow Chrome extension from the Chrome Web Store',
              'Click the extension icon in your browser toolbar',
              'Paste the token above and click Connect',
              'Solve any LeetCode problem — the popup fires automatically on Accepted',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px',
                  background: 'rgba(88,166,255,0.15)', border: '1px solid rgba(88,166,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  boxShadow: '0 0 8px rgba(88,166,255,0.15)'
                }}>
                  <span style={{ color: '#58a6ff', fontSize: '11px', fontWeight: '800', fontFamily: 'monospace' }}>{i + 1}</span>
                </div>
                <p style={{ color: '#b0b8c1', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info Card */}
        <div style={{
          background: 'linear-gradient(135deg, #161b22 0%, #0d1117 100%)',
          border: '1px solid #21262d',
          borderRadius: '16px',
          padding: '24px',
          marginTop: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #3fb950, transparent)' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(63,185,80,0.15)', border: '1px solid rgba(63,185,80,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 12px rgba(63,185,80,0.2)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3fb950" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <p style={{ color: '#e6edf3', fontSize: '14px', fontWeight: '700', margin: 0 }}>Quick Tips</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: '10px', padding: '14px 16px' }}>
              <p style={{ color: '#58a6ff', fontSize: '10px', fontWeight: '700', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px 0' }}>Auto-Sync</p>
              <p style={{ color: '#8b949e', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>Problems solved on LeetCode automatically sync when extension is connected</p>
            </div>
            <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: '10px', padding: '14px 16px' }}>
              <p style={{ color: '#a78bfa', fontSize: '10px', fontWeight: '700', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px 0' }}>Spaced Repetition</p>
              <p style={{ color: '#8b949e', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>Reviews scheduled using SM-2 algorithm for optimal retention</p>
            </div>
            <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: '10px', padding: '14px 16px' }}>
              <p style={{ color: '#ffa116', fontSize: '10px', fontWeight: '700', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px 0' }}>Token Security</p>
              <p style={{ color: '#8b949e', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>Token never expires but can be regenerated from extension settings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}