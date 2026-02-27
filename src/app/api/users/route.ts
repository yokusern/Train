import { NextResponse } from 'next/server'
import { initialTeam } from '@/lib/mockData'
import type { User } from '@/components/shared/types'

// GET /api/users - Fetch all users for ranking/leaderboard (demo)
export async function GET() {
  return NextResponse.json([...initialTeam].sort((a, b) => b.points - a.points))
}

// POST /api/users - Create/Login user (demo)
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const role = body?.role === 'ADMIN' || body?.role === 'MEMBER' ? body.role : null

    if (!name || !role) {
      return NextResponse.json({ error: 'name and role are required' }, { status: 400 })
    }

    const avatar = name.slice(0, 2).toUpperCase()
    const user: User = {
      id: Date.now(),
      name,
      avatar,
      points: 0,
      pendingPoints: 0,
      rank: role === 'ADMIN' ? 'Admin' : 'Member',
      role,
      skillScore: {},
    }

    return NextResponse.json(user)
  } catch (error: unknown) {
    console.error('Create/Login user error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
