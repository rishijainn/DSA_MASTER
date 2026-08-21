import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: settings } = await supabase
    .from('user_settings')
    .select('api_token, username, daily_commitment')
    .eq('user_id', user.id)
    .single()

  const { count: totalCount } = await supabase
    .from('problems')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Check if extension has been active in the last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: recentProblem } = await supabase
    .from('problems')
    .select('last_reviewed_at')
    .eq('user_id', user.id)
    .gte('last_reviewed_at', twentyFourHoursAgo)
    .order('last_reviewed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const extensionConnected = Boolean(recentProblem)

  const userName = settings?.username ?? user.email?.split('@')[0] ?? 'Hunter'
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    : '—'

  return (
    <SettingsClient
      apiToken={settings?.api_token ?? ''}
      userName={userName}
      email={user.email ?? ''}
      memberSince={memberSince}
      totalCount={totalCount ?? 0}
      dailyCommitment={settings?.daily_commitment ?? 5}
      extensionConnected={extensionConnected}
    />
  )
}