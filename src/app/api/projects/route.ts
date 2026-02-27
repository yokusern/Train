import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/projects - Fetch all projects with their tasks
export async function GET() {
    try {
        const projects = await prisma.project.findMany({
            include: {
                tasks: {
                    orderBy: {
                        created_at: 'desc'
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        const transformedProjects = projects.map(p => ({
            id: Number(p.id),
            name: p.name,
            icon: p.icon || '📦',
            tasks: p.tasks.map(t => ({
                id: Number(t.id),
                title: t.title,
                status: t.status,
                points: t.difficulty_points,
                assigneeId: t.assignee_id ? Number(t.assignee_id) : null,
                deadline: t.deadline?.toISOString() || '',
                category: t.category
            }))
        }));

        return NextResponse.json(transformedProjects);
    } catch (error) {
        console.error('Fetch projects error:', error);
        return NextResponse.json({ error: 'プロジェクトの取得に失敗しました' }, { status: 500 });
    }
}

// POST /api/projects - Create a new project
export async function POST(req: Request) {
    try {
        const { name, icon, description } = await req.json();

        if (!name) {
            return NextResponse.json({ error: 'プロジェクト名が必要です' }, { status: 400 });
        }

        const project = await prisma.project.create({
            data: {
                name,
                icon: icon || '📦',
                description
            }
        });

        return NextResponse.json({
            id: Number(project.id),
            name: project.name,
            icon: project.icon,
            tasks: []
        });
    } catch (error) {
        console.error('Create project error:', error);
        return NextResponse.json({ error: 'プロジェクトの作成に失敗しました' }, { status: 500 });
    }
}
