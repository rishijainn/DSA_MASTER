import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

function localDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = localDateStr(new Date());
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Run all independent queries in parallel
  const [settingsRes, todayRes, overdueRes, allRes, countRes, reviewRes, problemRes] = await Promise.all([
    supabase.from("user_settings").select("daily_commitment, current_streak, longest_streak, last_activity_date, username").eq("user_id", user.id).single(),
    supabase.from("problems").select("*").eq("user_id", user.id).eq("next_review_date", today).order("next_review_date", { ascending: true }),
    supabase.from("problems").select("*", { count: "exact", head: true }).eq("user_id", user.id).lt("next_review_date", today),
    supabase.from("problems").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("problems").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("review_logs").select("reviewed_at").eq("user_id", user.id).gte("reviewed_at", sixMonthsAgo.toISOString()),
    supabase.from("problems").select("created_at, next_review_date").eq("user_id", user.id).gte("created_at", sixMonthsAgo.toISOString()),
  ]);

  const settings = settingsRes.data;
  const todayProblems = todayRes.data;
  const overdueCount = overdueRes.count ?? 0;
  const allProblems = allRes.data;
  const totalCount = countRes.count;
  const reviewRows = reviewRes.data;
  const problemRows = problemRes.data;

  const seen = new Set();
  const uniqueProblems = (allProblems ?? [])
    .filter((p) => {
      if (seen.has(p.leetcode_slug)) return false;
      seen.add(p.leetcode_slug);
      return true;
    })
    .slice(0, 5);

  const activityCounts = new Map<string, number>();

  // Count review completions by local date
  (reviewRows ?? []).forEach((row) => {
    const d = new Date(row.reviewed_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    activityCounts.set(key, (activityCounts.get(key) ?? 0) + 1);
  });

  // For new problems: only count on days where nothing was due for review
  const dueByDate = new Map<string, number>();
  (problemRows ?? []).forEach((p) => {
    if (p.next_review_date) {
      dueByDate.set(p.next_review_date, (dueByDate.get(p.next_review_date) ?? 0) + 1);
    }
  });
  (problemRows ?? []).forEach((p) => {
    const d = new Date(p.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    // Only count if there were zero problems due for review that day
    if ((dueByDate.get(key) ?? 0) === 0) {
      activityCounts.set(key, (activityCounts.get(key) ?? 0) + 1);
    }
  });

  const activityData = Array.from(activityCounts.entries()).map(([date, count]) => ({ date, count }));

  const dailyCommitment = settings?.daily_commitment ?? 5;
  const due = todayProblems ?? [];
  const shown = due.slice(0, dailyCommitment);
  const queueCount = Math.max(0, due.length - dailyCommitment);
  const isBacklogged = queueCount >= dailyCommitment;

  const streak = settings?.current_streak ?? 0;
  const longestStreak = settings?.longest_streak ?? 0;
  const lastActivityDate = settings?.last_activity_date ?? null;
  const streakActive = lastActivityDate === today;

  // Compute the streak window: which days the user was "expected" to be active
  // Missed days = days in the window with no activity
  const streakWindow: string[] = []
  if (lastActivityDate && streak > 0) {
    const end = new Date(today + 'T00:00:00')
    const start = new Date(lastActivityDate + 'T00:00:00')
    start.setDate(start.getDate() - streak + 1)
    const cursor = new Date(start)
    while (cursor <= end) {
      streakWindow.push(localDateStr(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
  }

  // Display name: prefer the editable name stored in user_settings
  // (edited from the Settings page), falling back to auth metadata then email.
  const userName = settings?.username ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Coder";

  return (
    <DashboardClient
      shownProblems={shown}
      queueCount={queueCount}
      overdueCount={overdueCount}
      recentProblems={uniqueProblems}
      dailyCommitment={dailyCommitment}
      isBacklogged={isBacklogged}
      totalCount={totalCount ?? 0}
      streak={streak}
      longestStreak={longestStreak}
      streakActive={streakActive}
      activityData={activityData}
      streakWindow={streakWindow}
      userName={userName}
    />
  );
}