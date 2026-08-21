import Sidebar from '@/components/Sidebar'
import TabRefresh from '@/components/TabRefresh'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d1117', color: '#e6edf3' }}>
      <TabRefresh />
      <Sidebar />
      <main style={{ flex: 1, minHeight: '100vh', marginLeft: '260px' }}>{children}</main>
    </div>
  )
}
