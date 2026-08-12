import { SupabaseClient } from '@supabase/supabase-js'

export async function updateStreak(userId: string, supabase: SupabaseClient) {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    // get user settings
    const { data: settings } = await supabase
        .from('user_settings')
        .select('daily_commitment, current_streak, last_streak_date')
        .eq('user_id', userId)
        .single()

    if (!settings) return

    const dailyCommitment = settings.daily_commitment ?? 5
    const currentStreak = settings.current_streak ?? 0
    const lastStreakDate = settings.last_streak_date

    // count how many reviews completed today
    const { count: todayReviews } = await supabase
        .from('review_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('reviewed_at', `${today}T00:00:00`)
        .lte('reviewed_at', `${today}T23:59:59`)

    // not enough reviews today yet
    if ((todayReviews ?? 0) < dailyCommitment) return

    // already updated streak today
    if (lastStreakDate === today) return

    let newStreak = 1
    if (lastStreakDate === yesterday) {
        // continued streak
        newStreak = currentStreak + 1
    }
    // else streak resets to 1 (missed a day)

    await supabase
        .from('user_settings')
        .update({ current_streak: newStreak, last_streak_date: today })
        .eq('user_id', userId)
}