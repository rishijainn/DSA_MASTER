'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsClient({ apiToken }: { apiToken: string }) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(apiToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#eff1f6' }}>
      <nav style={{ background: '#212121', borderBottom: '1px solid #3e3e3e', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '24px', height: '24px', background: '#ffa116', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#1a1a1a', fontWeight: '900', fontSize: '11px' }}>S</span>
          </div>
          <span style={{ color: '#eff1f6', fontWeight: '600', fontSize: '14px' }}>DSA Shadow</span>
        </div>
        <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', color: '#737373', fontSize: '13px', cursor: 'pointer' }}>
          ← Back
        </button>
      </nav>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '36px 24px' }}>
        <p style={{ color: '#eff1f6', fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0' }}>Settings</p>
        <p style={{ color: '#737373', fontSize: '13px', margin: '0 0 28px 0' }}>Manage your account and extension connection</p>

        {/* Token card */}
        <div style={{ background: '#282828', border: '1px solid #3e3e3e', borderRadius: '8px', padding: '20px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '6px', height: '6px', background: '#ffa116', borderRadius: '50%' }} />
            <p style={{ color: '#eff1f6', fontSize: '13px', fontWeight: '600', margin: 0 }}>Chrome Extension Token</p>
          </div>
          <p style={{ color: '#737373', fontSize: '12px', margin: '0 0 14px 0', paddingLeft: '14px' }}>
            Paste this in the DSA Shadow extension to link your account. Never expires.
          </p>
          <div style={{ background: '#1a1a1a', border: '1px solid #3e3e3e', borderRadius: '6px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <code style={{ color: '#ffa116', fontFamily: 'monospace', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {apiToken}
            </code>
            <button
              onClick={handleCopy}
              style={{
                flexShrink: 0, padding: '5px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s',
                background: copied ? 'rgba(0,184,93,0.12)' : '#3e3e3e',
                color: copied ? '#00b85d' : '#eff1f6bf',
                border: copied ? '1px solid rgba(0,184,93,0.3)' : '1px solid transparent',
              }}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* How to connect */}
        <div style={{ background: '#282828', border: '1px solid #3e3e3e', borderRadius: '8px', padding: '20px' }}>
          <p style={{ color: '#eff1f6', fontSize: '13px', fontWeight: '600', margin: '0 0 16px 0' }}>How to connect the extension</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              'Install the DSA Shadow Chrome extension',
              'Click the extension icon in your browser toolbar',
              'Paste the token above and click Connect',
              'Solve any LeetCode problem — the popup fires automatically on Accepted',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '20px', height: '20px', background: '#1a1a1a', border: '1px solid #3e3e3e', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#ffa116', fontSize: '10px', fontWeight: '700' }}>{i + 1}</span>
                </div>
                <p style={{ color: '#737373', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}