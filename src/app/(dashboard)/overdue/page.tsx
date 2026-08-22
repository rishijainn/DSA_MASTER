import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OverdueClient from "./OverdueClient";

function localDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default async function OverduePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = localDateStr(new Date());

  const { data: overdueProblems } = await supabase
    .from("problems")
    .select("*")
    .eq("user_id", user.id)
    .lt("next_review_date", today)
    .order("next_review_date", { ascending: true });

  return <OverdueClient problems={overdueProblems ?? []} />;
}
