import { NextResponse } from 'next/server'
import { initialProjects } from '@/lib/mockData'

// GET /api/projects - Fetch all projects with their tasks (demo)
export async function GET() {
  return NextResponse.json(initialProjects)
}

// POST /api/projects - Create a new project (demo; no persistence)
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const icon = typeof body?.icon === 'string' ? body.icon : '📦'

    if (!name) {
      return NextResponse.json({ error: 'プロジェクト名が必要です' }, { status: 400 })
    }

    return NextResponse.json({
      id: Date.now(),
      name,
      icon,
      tasks: [],
    })
  } catch (error: unknown) {
    console.error('Create project error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
