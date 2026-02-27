import { NextResponse } from 'next/server'
import { initialActivities } from '@/lib/mockData'

// GET /api/activity - Fetch recent activities (demo)
export async function GET() {
  return NextResponse.json(initialActivities)
}

// POST /api/activity - Log a new activity (demo; no persistence)
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body?.user_id || !body?.action_type) {
      return NextResponse.json({ error: 'ユーザーIDとアクションタイプが必要です' }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    console.error('Log activity error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
