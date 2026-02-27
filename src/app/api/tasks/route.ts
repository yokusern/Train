import { NextResponse } from 'next/server'

// POST /api/tasks - Create a new task (demo; no persistence)
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const projectId = body?.project_id
    const title = typeof body?.title === 'string' ? body.title.trim() : ''

    if (!projectId || !title) {
      return NextResponse.json({ error: 'プロジェクトIDとタイトルが必要です' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    console.error('Create task error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH /api/tasks - Update an existing task (demo; no persistence)
export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const id = body?.id

    if (!id) {
      return NextResponse.json({ error: 'タスクIDが必要です' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    console.error('Update task error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
