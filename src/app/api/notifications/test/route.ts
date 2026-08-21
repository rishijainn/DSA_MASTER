import { NextResponse } from 'next/server'
import { sendMail } from '@/lib/mailer'
import {
  reviewReminderEmail,
  streakNudgeEmail,
  weeklySummaryEmail,
  type WeeklyStats,
} from '@/lib/email-templates'

export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email, type } = await request.json()
  if (!email || !type) {
    return NextResponse.json({ error: 'Missing email or type' }, { status: 400 })
  }

  let html: string
  let subject: string

  switch (type) {
    case 'review-reminder':
      html = reviewReminderEmail('Test User', 5, [
        'Two Sum', 'Add Two Numbers', 'Longest Substring Without Repeating',
        'Container With Most Water', '3Sum', 'Letter Combinations of a Phone Number',
        'Generate Parentheses', 'Search in Rotated Sorted Array', 'Combination Sum',
      ])
      subject = '📝 5 reviews due today — DSA Master (test)'
      break
    case 'streak-nudge':
      html = streakNudgeEmail('Test User', 12)
      subject = "🔥 Don't break your 12-day streak — DSA Master (test)"
      break
    case 'weekly-summary':
      html = weeklySummaryEmail('Test User', {
        problemsSolved: 14,
        reviewsCompleted: 23,
        currentStreak: 12,
        longestStreak: 18,
        easyCount: 5,
        mediumCount: 7,
        hardCount: 2,
      } satisfies WeeklyStats)
      subject = '📊 Your weekly summary — DSA Master (test)'
      break
    default:
      return NextResponse.json({ error: 'Invalid type. Use: review-reminder, streak-nudge, weekly-summary' }, { status: 400 })
  }

  try {
    await sendMail(email, subject, html)
    return NextResponse.json({ success: true, sentTo: email, type })
  } catch (e) {
    console.error('Test email error:', e)
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 })
  }
}
