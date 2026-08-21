import { NextResponse } from 'next/server'
import { sendReviewReminders } from '@/lib/notifications'

export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await sendReviewReminders()
    return NextResponse.json(result)
  } catch (e) {
    console.error('Review reminder error:', e)
    return NextResponse.json({ error: 'Failed to send review reminders' }, { status: 500 })
  }
}
