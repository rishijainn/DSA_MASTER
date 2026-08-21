import { SupabaseClient } from '@supabase/supabase-js'

/**
 * STREAK LOGIC — PLAIN ENGLISH
 * ────────────────────────────
 * A streak increments by 1 for a calendar day ONLY when:
 *
 *   1. ALL questions that were due for review that day have been reviewed, OR
 *   2. Zero questions were due for review AND the user solved at least one
 *      brand-new question.
 *
 * In other words: if there are reviews pending, solving new problems does NOT
 * count — you must clear the review queue first.
 *
 * Reset rule:
 *   If a full calendar day passes without the above being met, the streak
 *   resets to 0.  This is checked on every action AND on app/extension load.
 *
 * Data model (user_settings table):
 *   current_streak  — integer, resets to 0 on a missed day
 *   longest_streak  — integer, historical max, never decreases
 *   last_activity_date — date (no time), the last calendar day the streak was
 *                        incremented
 *
 * Timezone note:
 *   Dates are stored as YYYY-MM-DD strings (local calendar day).
 *   "Today" and "yesterday" are derived from the server's local clock.
 *   If we later collect the user's IANA timezone, we should use it here.
 *   Until then this defaults to the server's timezone — a known limitation.
 */

function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysBetween(a: string, b: string): number {
  const msA = new Date(a + 'T00:00:00').getTime()
  const msB = new Date(b + 'T00:00:00').getTime()
  return Math.round((msB - msA) / (1000 * 60 * 60 * 24))
}

// ── Called after every action (review completed or new problem logged) ─────
//
// The function itself checks whether the day's obligation is met:
//   • If problems were due today → only increments when ALL of them have a
//     review_log entry for today (todayReviews >= dueCount).
//   • If zero problems were due today → the caller is responsible for only
//     calling this when the user solved at least one new problem.
//
export async function updateStreak(
  userId: string,
  supabase: SupabaseClient,
) {
  const today = localDateStr(new Date())

  const { data: settings } = await supabase
    .from('user_settings')
    .select('current_streak, longest_streak, last_activity_date')
    .eq('user_id', userId)
    .single()

  if (!settings) return

  const currentStreak = settings.current_streak ?? 0
  const longestStreak = settings.longest_streak ?? 0
  const lastActivity = settings.last_activity_date as string | null

  // already counted today → nothing to do
  if (lastActivity === today) return

  // count problems due for review today
  const { count: dueCount } = await supabase
    .from('problems')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .lte('next_review_date', today)

  // count reviews completed today (convert local date → UTC boundaries)
  const todayStartUTC = new Date(`${today}T00:00:00`)
  todayStartUTC.setMinutes(todayStartUTC.getMinutes() - todayStartUTC.getTimezoneOffset())
  const todayEndUTC = new Date(`${today}T23:59:59.999`)
  todayEndUTC.setMinutes(todayEndUTC.getMinutes() - todayEndUTC.getTimezoneOffset())

  const { count: todayReviews } = await supabase
    .from('review_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('reviewed_at', todayStartUTC.toISOString())
    .lte('reviewed_at', todayEndUTC.toISOString())

  // If reviews were due but not all completed → don't increment
  if ((dueCount ?? 0) > 0 && (todayReviews ?? 0) < (dueCount ?? 0)) return

  // Day obligation met → increment streak
  let newStreak = 1
  if (lastActivity && daysBetween(lastActivity, today) === 1) {
    newStreak = currentStreak + 1
  }
  // else: missed a day (or first ever) → reset to 1

  const newLongest = Math.max(longestStreak, newStreak)

  await supabase
    .from('user_settings')
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_activity_date: today,
    })
    .eq('user_id', userId)
}

// ── Called on app / extension load ──────────────────────────────────────────
//
// If last_activity_date is more than 1 day in the past the user missed a
// full calendar day, so current_streak is reset to 0 immediately — no need
// to wait for the user's next action.
//
export async function checkStaleStreak(userId: string, supabase: SupabaseClient) {
  const today = localDateStr(new Date())

  const { data: settings } = await supabase
    .from('user_settings')
    .select('current_streak, last_activity_date')
    .eq('user_id', userId)
    .single()

  if (!settings) return

  const lastActivity = settings.last_activity_date as string | null
  if (!lastActivity) return
  if (lastActivity === today) return
  if (daysBetween(lastActivity, today) <= 1) return

  if ((settings.current_streak ?? 0) > 0) {
    await supabase
      .from('user_settings')
      .update({ current_streak: 0 })
      .eq('user_id', userId)
  }
}
