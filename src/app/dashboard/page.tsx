import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: settings } = await supabase
    .from('user_settings')
    .select('daily_commitment')
    .eq('user_id', user.id)
    .single()

  const today = new Date().toISOString().split('T')[0]

  const { data: dueProblems } = await supabase
    .from('problems')
    .select('*')
    .eq('user_id', user.id)
    .lte('next_review_date', today)
    .order('next_review_date', { ascending: true })

  const { data: allProblems } = await supabase
    .from('problems')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const dailyCommitment = settings?.daily_commitment ?? 5
  const due = dueProblems ?? []
  const shown = due.slice(0, dailyCommitment)
  const queueCount = Math.max(0, due.length - dailyCommitment)

  return (
    <DashboardClient
      shownProblems={shown}
      queueCount={queueCount}
      recentProblems={allProblems ?? []}
      dailyCommitment={dailyCommitment}
    />
  )
}