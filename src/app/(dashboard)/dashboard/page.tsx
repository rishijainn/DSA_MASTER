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
  const [settingsRes, todayRes, overdueRes, allRes, countRes, reviewRes, problemRes, unreviewedRes, unreviewedCountRes] = await Promise.all([
    supabase.from("user_settings").select("daily_commitment, current_streak, longest_streak, last_activity_date, username").eq("user_id", user.id).single(),
    supabase.from("problems").select("*").eq("user_id", user.id).eq("next_review_date", today).order("next_review_date", { ascending: true }),
    supabase.from("problems").select("*", { count: "exact", head: true }).eq("user_id", user.id).lt("next_review_date", today),
    supabase.from("problems").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("problems").select("*", { count: "exact", head: true }).eq("user_id", user.id).gt("stability", 0),
    supabase.from("review_logs").select("reviewed_at, problem_id").eq("user_id", user.id).gte("reviewed_at", sixMonthsAgo.toISOString()),
    supabase.from("problems").select("id, created_at, next_review_date, stability").eq("user_id", user.id),
    // Imported backlog — stability 0 until first review (next_review_date is a
    // far-future sentinel date). Not part of the daily queue, rank, or streak.
    // Show just the latest 5; a reviewed one is naturally replaced server-side
    // when the dashboard is re-rendered after a review.
    supabase.from("problems").select("id, title, difficulty, leetcode_slug, leetcode_url").eq("user_id", user.id).eq("stability", 0).order("created_at", { ascending: false }).limit(5),
    supabase.from("problems").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("stability", 0),
  ]);

  const settings = settingsRes.data;
  const todayProblems = todayRes.data;
  const overdueCount = overdueRes.count ?? 0;
  const allProblems = allRes.data;
  const totalCount = countRes.count;
  const reviewRows = reviewRes.data;
  const problemRows = problemRes.data;
  const unreviewedProblems = unreviewedRes.data ?? [];
  const unreviewedCount = unreviewedCountRes.count ?? 0;

  const seen = new Set();
  const uniqueProblems = (allProblems ?? [])
    .filter((p) => {
      if (p.stability === 0) return false; // unreviewed imports — not "recent reviews"
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    })
    .slice(0, 5);

  const activityCounts = new Map<string, number>();

  // Build a map of problem_id -> next_review_date for filtering
  const reviewDateByProblem = new Map<string, string>();
  (problemRows ?? []).forEach((p) => {
    if (p.id && p.stability > 0 && p.next_review_date) {
      reviewDateByProblem.set(p.id, p.next_review_date);
    }
  });

  // Count review completions — but ONLY for problems that were actually due on that day
  // (not overdue reviews, those don't count toward streak or heatmap activity)
  (reviewRows ?? []).forEach((row) => {
    const reviewDate = reviewDateByProblem.get(row.problem_id);
    if (!reviewDate) return; // unknown problem, skip
    const d = new Date(row.reviewed_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    // Only count if the review happened on the day the problem was due
    if (key === reviewDate) {
      activityCounts.set(key, (activityCounts.get(key) ?? 0) + 1);
    }
  });

  // For new problems: only count on days where nothing was due for review.
  // Unreviewed imports (stability 0) never count toward the heatmap.
  const sixMonthsAgoStr = localDateStr(sixMonthsAgo);
  const dueByDate = new Map<string, number>();
  (problemRows ?? []).forEach((p) => {
    if (p.stability > 0 && p.next_review_date) {
      dueByDate.set(p.next_review_date, (dueByDate.get(p.next_review_date) ?? 0) + 1);
    }
  });
  (problemRows ?? []).forEach((p) => {
    if (p.stability === 0) return; // unreviewed import — guard the heatmap
    const d = new Date(p.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    // Only count problems created in the last 6 months, and only if no reviews were due that day
    if (key >= sixMonthsAgoStr && (dueByDate.get(key) ?? 0) === 0) {
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

  // Compute the streak window: days from last activity through today.
  // Missed days (past days with no activity) show red in the heatmap.
  const streakWindow: string[] = []
  if (lastActivityDate) {
    const end = new Date(today + 'T00:00:00')
    const start = new Date(lastActivityDate + 'T00:00:00')
    // Cap at 30 days back from today so we don't flood with red
    const maxStart = new Date(today + 'T00:00:00')
    maxStart.setDate(maxStart.getDate() - 30)
    if (start < maxStart) start.setTime(maxStart.getTime())
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
      unreviewedProblems={unreviewedProblems}
      unreviewedCount={unreviewedCount}
    />
  );
}