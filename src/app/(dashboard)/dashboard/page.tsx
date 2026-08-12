import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: settings } = await supabase
    .from("user_settings")
    .select("daily_commitment, current_streak, last_streak_date")
    .eq("user_id", user.id)
    .single();

  const today = new Date().toISOString().split("T")[0];

  const { data: dueProblems } = await supabase
    .from("problems")
    .select("*")
    .eq("user_id", user.id)
    .lte("next_review_date", today)
    .order("next_review_date", { ascending: true });

  const { data: allProblems } = await supabase
    .from("problems")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const seen = new Set();
  const uniqueProblems = (allProblems ?? [])
    .filter((p) => {
      if (seen.has(p.leetcode_slug)) return false;
      seen.add(p.leetcode_slug);
      return true;
    })
    .slice(0, 5);

  const { count: totalCount } = await supabase
    .from("problems")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const dailyCommitment = settings?.daily_commitment ?? 5;
  const due = dueProblems ?? [];
  const shown = due.slice(0, dailyCommitment);
  const queueCount = Math.max(0, due.length - dailyCommitment);
  const isBacklogged = queueCount >= dailyCommitment;

  const streak = settings?.current_streak ?? 0;
  const lastStreakDate = settings?.last_streak_date ?? null;
  const streakActive = lastStreakDate === today;

  return (
    <DashboardClient
      shownProblems={shown}
      queueCount={queueCount}
      recentProblems={uniqueProblems}
      dailyCommitment={dailyCommitment}
      isBacklogged={isBacklogged}
      totalCount={totalCount ?? 0}
      streak={streak}
      streakActive={streakActive}
    />
  );
}