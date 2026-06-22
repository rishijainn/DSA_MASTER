import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { calculateNextReview } from '@/lib/fsrs'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '').trim()

    const supabase = await createClient()

    // find user by token
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('user_id')
      .eq('api_token', token)
      .single()

    if (settingsError || !settings) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = settings.user_id

    const body = await request.json()
    const { slug, url, title, hint_used, felt_difficulty, difficulty } = body

    if (!slug || !url || !title || hint_used === undefined || !felt_difficulty || !difficulty) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const { newStability, nextReviewDate } = calculateNextReview({
      stability: 1,
      feltDifficulty: felt_difficulty,
      hintUsed: hint_used
    })

    const { error: insertError } = await supabase.from('problems').insert({
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
      review_count: 0
    })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, next_review_date: nextReviewDate })

  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}