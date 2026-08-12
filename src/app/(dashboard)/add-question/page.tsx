import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AddQuestionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 24px' }}>
        <p style={{ color: '#8b949e', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Add Problem</p>
        <h1 style={{ color: '#e6edf3', fontSize: '34px', fontWeight: '800', margin: '14px 0 8px 0' }}>Create a new review quest</h1>
        <p style={{ color: '#8b949e', fontSize: '15px', maxWidth: '680px', lineHeight: 1.8, margin: '0 0 32px 0' }}>
          This page is available from the dashboard sidebar. For now, the problem entry flow is still under construction.
        </p>
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '16px', padding: '24px', maxWidth: '680px' }}>
          <p style={{ color: '#e6edf3', fontSize: '16px', fontWeight: '700', margin: '0 0 12px 0' }}>Coming soon</p>
          <p style={{ color: '#8b949e', fontSize: '14px', margin: 0, lineHeight: 1.8 }}>
            You can navigate back to the dashboard, history, or settings using the sidebar. The shared sidebar is now persistent across every protected page in this route group.
          </p>
        </div>
      </div>
    </div>
  )
}
