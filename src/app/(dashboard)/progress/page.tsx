import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProgressClient from "./ProgressClient";

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: settings } = await supabase
    .from("user_settings")
    .select("current_streak, longest_streak, last_activity_date, daily_commitment")
    .eq("user_id", user.id)
    .single();

  const { count: totalCount } = await supabase
    .from("problems")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <ProgressClient
      totalCount={totalCount ?? 0}
      currentStreak={settings?.current_streak ?? 0}
      longestStreak={settings?.longest_streak ?? 0}
      lastActivityDate={settings?.last_activity_date ?? null}
      dailyCommitment={settings?.daily_commitment ?? 5}
    />
  );
}
