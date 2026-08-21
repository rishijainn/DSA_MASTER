export default function HistoryLoading() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .sk { background: linear-gradient(90deg, #161b22 25%, #21262d 50%, #161b22 75%); background-size: 800px 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
      `}</style>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '36px 24px' }}>
        <div className="sk" style={{ height: 40, width: 250, borderRadius: 10, marginBottom: 28 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="sk" style={{ height: 64, borderRadius: 12 }} />
          ))}
        </div>
      </div>
    </div>
  )
}
