'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
  { icon: '📋', label: 'History', path: '/history' },
  { icon: '📊', label: 'Analyse', path: '/analyse', locked: true },
  { icon: '🧭', label: 'Discover', path: '/discover' },
  { icon: '🏆', label: 'Progress', path: '/progress' },
  { icon: '⚙️', label: 'Settings', path: '/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [showModal, setShowModal] = useState(false)

  return (
    <aside
      style={{
        width: '260px',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        background: '#0d1117',
        borderRight: '1px solid #21262d',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 20,
        overflow: 'hidden',
        backgroundImage: 'linear-gradient(180deg, #0d1117 0%, #0a0d12 100%)',
      }}
    >
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #21262d', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at top left, rgba(56,139,253,0.08) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/logo.svg"
            alt="DSA Master"
            style={{ height: '80px', flexShrink: 0 }}
          />
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {NAV_ITEMS.map((item) => {
          const active = !item.locked && (pathname === item.path || pathname.startsWith(`${item.path}/`))

          if (item.locked) {
            return (
              <button
                key={item.path}
                onClick={() => setShowModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  background: 'transparent',
                  border: '1px solid transparent',
                  color: '#484f58',
                  fontWeight: '400',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(56,139,253,0.08)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span style={{ fontSize: '16px', width: '22px', textAlign: 'center' }}>{item.icon}</span>
                <span style={{ fontSize: '13px', flex: 1 }}>{item.label}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#484f58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </button>
            )
          }

          return (
            <Link
              key={item.path}
              href={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                textDecoration: 'none',
                background: active ? 'rgba(56,139,253,0.12)' : 'transparent',
                border: active ? '1px solid rgba(56,139,253,0.25)' : '1px solid transparent',
                color: active ? '#58a6ff' : '#8b949e',
                fontWeight: active ? '600' : '400',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = active ? 'rgba(56,139,253,0.15)' : 'rgba(56,139,253,0.08)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = active ? 'rgba(56,139,253,0.12)' : 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <span style={{ fontSize: '16px', width: '22px', textAlign: 'center' }}>{item.icon}</span>
              <span style={{ fontSize: '13px' }}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Coming Soon Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#161b22',
              border: '1px solid #21262d',
              borderRadius: 16,
              padding: '36px 32px',
              maxWidth: 340,
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 14, margin: '0 auto 18px',
              background: 'rgba(88,166,255,0.1)', border: '1px solid rgba(88,166,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 style={{ color: '#e6edf3', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>Coming Soon</h3>
            <p style={{ color: '#8b949e', fontSize: 13, margin: '0 0 20px', lineHeight: 1.6 }}>
              Advanced analytics and insights are on the way. Stay tuned.
            </p>
            <button
              onClick={() => setShowModal(false)}
              style={{
                background: 'rgba(88,166,255,0.12)',
                border: '1px solid rgba(88,166,255,0.25)',
                borderRadius: 10,
                padding: '10px 28px',
                color: '#58a6ff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </aside>
  )
}
