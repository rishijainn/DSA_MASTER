export default function DashboardLoading() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .sk { background: linear-gradient(90deg, #161b22 25%, #21262d 50%, #161b22 75%); background-size: 800px 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 28px' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div className="sk" style={{ width: 200, height: 28 }} />
          <div className="sk" style={{ width: 140, height: 36, borderRadius: 10 }} />
        </div>
        {/* Grid skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="sk" style={{ height: 340, borderRadius: 16 }} />
          <div className="sk" style={{ height: 340, borderRadius: 16 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginTop: 20 }}>
          <div className="sk" style={{ height: 200, borderRadius: 16 }} />
          <div className="sk" style={{ height: 200, borderRadius: 16 }} />
          <div className="sk" style={{ height: 200, borderRadius: 16 }} />
        </div>
      </div>
    </div>
  )
}
