export default function SettingsLoading() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .sk { background: linear-gradient(90deg, #161b22 25%, #21262d 50%, #161b22 75%); background-size: 800px 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
      `}</style>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '36px 24px' }}>
        <div className="sk" style={{ height: 120, borderRadius: 16, marginBottom: 20 }} />
        <div className="sk" style={{ height: 200, borderRadius: 16, marginBottom: 20 }} />
        <div className="sk" style={{ height: 300, borderRadius: 16 }} />
      </div>
    </div>
  )
}
