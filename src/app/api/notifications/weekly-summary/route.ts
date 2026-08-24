import { NextResponse } from 'next/server'
import { sendWeeklySummaries } from '@/lib/notifications'

async function handler(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await sendWeeklySummaries()
    return NextResponse.json(result)
  } catch (e) {
    console.error('Weekly summary error:', e)
    return NextResponse.json({ error: 'Failed to send weekly summaries' }, { status: 500 })
  }
}

export async function GET(request: Request) { return handler(request) }
export async function POST(request: Request) { return handler(request) }
