'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
  { icon: '📋', label: 'History', path: '/history' },
  { icon: '⚙️', label: 'Settings', path: '/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()

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
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #388bfd 0%, #a78bfa 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '16px',
              color: 'white',
              flexShrink: 0,
              boxShadow: '0 0 24px rgba(56,139,253,0.4), inset 0 0 24px rgba(255,255,255,0.1)',
            }}
          >
            S
          </div>
          <div>
            <p style={{ color: '#e6edf3', fontSize: '14px', fontWeight: '700', margin: '0 0 2px 0', letterSpacing: '-0.2px' }}>DSA Shadow</p>
            <p style={{ color: '#58a6ff', fontSize: '10px', margin: 0, fontFamily: 'monospace' }}>Protected workspace</p>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.path || pathname.startsWith(`${item.path}/`)
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
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '16px', width: '22px', textAlign: 'center' }}>{item.icon}</span>
              <span style={{ fontSize: '13px' }}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '20px', borderTop: '1px solid #21262d' }}>
        <Link
          href="/add-question"
          style={{
            display: 'block',
            width: '100%',
            padding: '14px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1f6feb 0%, #388bfd 50%, #58a6ff 100%)',
            color: 'white',
            fontWeight: '700',
            textAlign: 'center',
            textDecoration: 'none',
          }}
        >
          + Add Problem
        </Link>
      </div>
    </aside>
  )
}
