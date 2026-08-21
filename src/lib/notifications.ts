import { createClient } from '@supabase/supabase-js'
import { sendMail } from './mailer'
import {
  reviewReminderEmail,
  streakNudgeEmail,
  weeklySummaryEmail,
  type WeeklyStats,
} from './email-templates'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function sendReviewReminders() {
  const supabase = getSupabase()
  const today = new Date().toISOString().split('T')[0]

  const { data: dueProblems } = await supabase
    .from('problems')
    .select('user_id, title')
    .lte('next_review_date', today)

  if (!dueProblems?.length) return { sent: 0, message: 'No reviews due' }

  const byUser = new Map<string, string[]>()
  for (const p of dueProblems) {
    const list = byUser.get(p.user_id) ?? []
    list.push(p.title)
    byUser.set(p.user_id, list)
  }

  let sent = 0
  for (const [userId, titles] of byUser) {
    const { data: settings } = await supabase
      .from('user_settings')
      .select('username')
      .eq('user_id', userId)
      .single()

    const { data: authUser } = await supabase.auth.admin.getUserById(userId)
    const email = authUser?.user?.email
    if (!email) continue

    const name = settings?.username ?? email.split('@')[0]
    const html = reviewReminderEmail(name, titles.length, titles)

    try {
      await sendMail(email, `📝 ${titles.length} review${titles.length !== 1 ? 's' : ''} due today — DSA Master`, html)
      sent++
    } catch (e) {
      console.error(`Failed to send review reminder to ${email}`, e)
    }
  }

  return { sent, total: byUser.size }
}

export async function sendStreakNudges() {
  const supabase = getSupabase()
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const { data: atRisk } = await supabase
    .from('user_settings')
    .select('user_id, username, current_streak')
    .neq('last_activity_date', today)
    .gt('current_streak', 0)

  if (!atRisk?.length) return { sent: 0, message: 'No streaks at risk' }

  let sent = 0
  for (const u of atRisk) {
    const { data: authUser } = await supabase.auth.admin.getUserById(u.user_id)
    const email = authUser?.user?.email
    if (!email) continue

    const name = u.username ?? email.split('@')[0]
    const html = streakNudgeEmail(name, u.current_streak)

    try {
      await sendMail(email, `🔥 Don't break your ${u.current_streak}-day streak — DSA Master`, html)
      sent++
    } catch (e) {
      console.error(`Failed to send streak nudge to ${email}`, e)
    }
  }

  return { sent, total: atRisk.length }
}

export async function sendWeeklySummaries() {
  const supabase = getSupabase()
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString()

  const { data: allSettings } = await supabase
    .from('user_settings')
    .select('user_id, username, current_streak')

  if (!allSettings?.length) return { sent: 0, message: 'No users found' }

  let sent = 0
  for (const u of allSettings) {
    const { data: authUser } = await supabase.auth.admin.getUserById(u.user_id)
    const email = authUser?.user?.email
    if (!email) continue

    const { count: problemsSolved } = await supabase
      .from('problems')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', u.user_id)
      .gte('created_at', weekAgoStr)

    const { count: reviewsCompleted } = await supabase
      .from('review_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', u.user_id)
      .gte('reviewed_at', weekAgoStr)

    const { data: weekProblems } = await supabase
      .from('problems')
      .select('difficulty')
      .eq('user_id', u.user_id)
      .gte('created_at', weekAgoStr)

    const easyCount = weekProblems?.filter((p) => p.difficulty === 'easy').length ?? 0
    const mediumCount = weekProblems?.filter((p) => p.difficulty === 'medium').length ?? 0
    const hardCount = weekProblems?.filter((p) => p.difficulty === 'hard').length ?? 0

    const { data: streakData } = await supabase
      .from('user_settings')
      .select('current_streak, longest_streak')
      .eq('user_id', u.user_id)
      .single()

    const stats: WeeklyStats = {
      problemsSolved: problemsSolved ?? 0,
      reviewsCompleted: reviewsCompleted ?? 0,
      currentStreak: streakData?.current_streak ?? 0,
      longestStreak: streakData?.longest_streak ?? 0,
      easyCount,
      mediumCount,
      hardCount,
    }

    const name = u.username ?? email.split('@')[0]
    const html = weeklySummaryEmail(name, stats)

    try {
      await sendMail(email, `📊 Your weekly summary — DSA Master`, html)
      sent++
    } catch (e) {
      console.error(`Failed to send weekly summary to ${email}`, e)
    }
  }

  return { sent, total: allSettings.length }
}
