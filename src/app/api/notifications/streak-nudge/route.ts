import { NextResponse } from 'next/server'
import { sendStreakNudges } from '@/lib/notifications'

export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await sendStreakNudges()
    return NextResponse.json(result)
  } catch (e) {
    console.error('Streak nudge error:', e)
    return NextResponse.json({ error: 'Failed to send streak nudges' }, { status: 500 })
  }
}
