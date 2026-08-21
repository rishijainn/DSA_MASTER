'use client'

import { useState } from 'react'
import { patterns, type Pattern } from '@/lib/patterns'

function problemCount(pattern: Pattern) {
  if (pattern.problems) return pattern.problems.length
  return Object.values(pattern.subgroups!).reduce((total, problems) => total + problems.length, 0)
}

export default function DiscoverClient() {
  const [selected, setSelected] = useState<Pattern | null>(null)

  if (selected) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '28px 24px' }}>

          <button
            onClick={() => setSelected(null)}
            style={{ background: 'transparent', border: 'none', color: '#58a6ff', fontSize: '13px', cursor: 'pointer', padding: '0 0 16px 0', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            ← All patterns
          </button>

          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ color: '#e6edf3', fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>{selected.name}</h1>
            <p style={{ color: '#8b949e', fontSize: '13px', margin: 0 }}>{selected.description}</p>
          </div>

          {selected.subgroups ? (
            Object.entries(selected.subgroups).map(([group, problems]) => (
              <div key={group} style={{ marginBottom: '24px' }}>
                <p style={{ color: '#a78bfa', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px 0' }}>{group}</p>
                {problemLinks(problems)}
              </div>
            ))
          ) : (
            problemLinks(selected.problems!)
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '28px 24px' }}>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ color: '#e6edf3', fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>Discover</h1>
          <p style={{ color: '#8b949e', fontSize: '13px', margin: 0 }}>Browse {patterns.length} DSA patterns — pick one to see its problems</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {patterns.map((pattern) => (
            <button
              key={pattern.name}
              onClick={() => setSelected(pattern)}
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                background: '#161b22',
                border: '1px solid #21262d',
                borderRadius: '10px',
                padding: '16px',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(88,166,255,0.4)'; e.currentTarget.style.background = '#1a2029' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#21262d'; e.currentTarget.style.background = '#161b22' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ color: '#e6edf3', fontSize: '14px', fontWeight: '600' }}>{pattern.name}</span>
                <span style={{ color: '#484f58', fontSize: '10px', fontFamily: 'monospace', background: '#0d1117', border: '1px solid #21262d', borderRadius: '4px', padding: '2px 6px', flexShrink: 0, marginLeft: '8px' }}>
                  {problemCount(pattern)} problems
                </span>
              </div>
              <p style={{ color: '#8b949e', fontSize: '12px', lineHeight: '1.5', margin: 0 }}>{pattern.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function problemLinks(problems: { title: string; leetcode_url: string }[]) {
  return (
    <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '10px', overflow: 'hidden' }}>
      {problems.map((p, i) => (
        <a
          key={p.title + p.leetcode_url}
          href={p.leetcode_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '12px 16px',
            borderBottom: i < problems.length - 1 ? '1px solid #21262d' : 'none',
            textDecoration: 'none',
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ color: '#e6edf3', fontSize: '13px', fontWeight: '500' }}>{p.title}</span>
          <span style={{ color: '#58a6ff', fontSize: '12px', flexShrink: 0 }}>Open ↗</span>
        </a>
      ))}
    </div>
  )
}
