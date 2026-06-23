import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { calculateNextReview } from "@/lib/fsrs";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing token" },
        { status: 401, headers: corsHeaders() },
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("user_id")
      .eq("api_token", token)
      .single();

    if (settingsError || !settings) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401, headers: corsHeaders() },
      );
    }

    const userId = settings.user_id;
    const body = await request.json();
    const { slug, url, title, hint_used, felt_difficulty, difficulty } = body;

    if (
      !slug ||
      !url ||
      !title ||
      hint_used === undefined ||
      !felt_difficulty ||
      !difficulty
    ) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400, headers: corsHeaders() },
      );
    }

    // check if problem already exists
    const { data: existing } = await supabase
      .from("problems")
      .select("id, review_count, stability")
      .eq("user_id", userId)
      .eq("leetcode_slug", slug)
      .maybeSingle();

    if (existing) {
      // update existing problem
      const { newStability, nextReviewDate } = calculateNextReview({
        stability: existing.stability,
        feltDifficulty: felt_difficulty,
        hintUsed: hint_used,
      });

      await supabase
        .from("problems")
        .update({
          hint_used,
          felt_difficulty,
          stability: newStability,
          next_review_date: nextReviewDate,
          last_reviewed_at: new Date().toISOString(),
          review_count: existing.review_count + 1,
        })
        .eq("id", existing.id);

      await supabase.from("review_logs").insert({
        problem_id: existing.id,
        user_id: userId,
        hint_used,
        felt_difficulty,
      });

      return NextResponse.json(
        { success: true, next_review_date: nextReviewDate },
        { headers: corsHeaders() },
      );
    }

    const { newStability, nextReviewDate } = calculateNextReview({
      stability: 1,
      feltDifficulty: felt_difficulty,
      hintUsed: hint_used,
    });

    const { error: insertError } = await supabase.from("problems").insert({
      user_id: userId,
      leetcode_slug: slug,
      title,
      leetcode_url: url,
      difficulty,
      hint_used,
      felt_difficulty,
      stability: newStability,
      next_review_date: nextReviewDate,
      last_reviewed_at: new Date().toISOString(),
      review_count: 0,
    });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500, headers: corsHeaders() },
      );
    }

    return NextResponse.json(
      { success: true, next_review_date: nextReviewDate },
      { headers: corsHeaders() },
    );
  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: corsHeaders() },
    );
  }
}
