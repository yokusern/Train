import { NextResponse } from 'next/server'

// POST /api/tasks - Create a new task
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { project_id, title } = body

        if (!project_id || !title) {
            return NextResponse.json({ error: 'Project ID and title are required' }, { status: 400 })
        }

        // Demo mode: no DB persistence
        return NextResponse.json({ ok: true })
    } catch (error: any) {
        console.error('Create task error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PATCH /api/tasks - Update an existing task
export async function PATCH(req: Request) {
    try {
        const body = await req.json()
        const { id } = body

        if (!id) {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
        }

        // Demo mode: no DB persistence
        return NextResponse.json({ ok: true })
    } catch (error: any) {
        console.error('Update task error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
