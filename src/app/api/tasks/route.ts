import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/tasks - Create a new task
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { project_id, title, content, assignee_id, difficulty_points, category, deadline } = body

        if (!project_id || !title) {
            return NextResponse.json({ error: 'Project ID and title are required' }, { status: 400 })
        }

        const task = await prisma.task.create({
            data: {
                project_id: BigInt(project_id),
                title,
                content,
                assignee_id: assignee_id ? BigInt(assignee_id) : null,
                difficulty_points: difficulty_points || 10,
                category,
                deadline: deadline ? new Date(deadline) : null,
                status: 'todo'
            }
        })

        const serializedTask = JSON.parse(
            JSON.stringify(task, (key, value) =>
                typeof value === 'bigint' ? Number(value) : value
            )
        )

        return NextResponse.json(serializedTask)
    } catch (error: any) {
        console.error('Create task error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PATCH /api/tasks - Update an existing task
export async function PATCH(req: Request) {
    try {
        const body = await req.json()
        const { id, status, assignee_id, completed_at } = body

        if (!id) {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
        }

        const updateData: any = {}
        if (status) updateData.status = status
        if (assignee_id !== undefined) updateData.assignee_id = assignee_id ? BigInt(assignee_id) : null
        if (completed_at !== undefined) updateData.completed_at = completed_at ? new Date(completed_at) : null

        const task = await prisma.task.update({
            where: { id: BigInt(id) },
            data: updateData
        })

        const serializedTask = JSON.parse(
            JSON.stringify(task, (key, value) =>
                typeof value === 'bigint' ? Number(value) : value
            )
        )

        return NextResponse.json(serializedTask)
    } catch (error: any) {
        console.error('Update task error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
