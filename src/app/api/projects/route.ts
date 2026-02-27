import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/projects - Fetch all projects with their tasks
export async function GET() {
    try {
        const projects = await prisma.project.findMany({
            include: {
                tasks: {
                    include: {
                        assignee: true
                    }
                }
            }
        })

        // Convert BigInt to Number for JSON serialization
        const serializedProjects = JSON.parse(
            JSON.stringify(projects, (key, value) =>
                typeof value === 'bigint' ? Number(value) : value
            )
        )

        return NextResponse.json(serializedProjects)
    } catch (error: any) {
        console.error('Fetch projects error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST /api/projects - Create a new project
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, description, icon } = body

        if (!name) {
            return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
        }

        const project = await prisma.project.create({
            data: {
                name,
                description,
                icon,
                status: 'active'
            }
        })

        const serializedProject = JSON.parse(
            JSON.stringify(project, (key, value) =>
                typeof value === 'bigint' ? Number(value) : value
            )
        )

        return NextResponse.json(serializedProject)
    } catch (error: any) {
        console.error('Create project error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
