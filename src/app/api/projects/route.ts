import { NextResponse } from 'next/server'
import { initialProjects } from '@/lib/mockData'

// GET /api/projects - Fetch all projects with their tasks
export async function GET() {
    return NextResponse.json(initialProjects)
}

// POST /api/projects - Create a new project
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, description, icon } = body

        if (!name) {
            return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
        }

        // Demo mode: no DB persistence
        return NextResponse.json({
            id: Date.now(),
            name,
            icon: icon ?? '📦',
            tasks: [],
        })
    } catch (error: any) {
        console.error('Create project error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
