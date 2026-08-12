import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d1117', color: '#e6edf3' }}>
      <Sidebar />
      <main style={{ flex: 1, minHeight: '100vh', marginLeft: '260px' }}>{children}</main>
    </div>
  )
}
