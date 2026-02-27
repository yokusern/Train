import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/tasks - Create a new task
export async function POST(req: Request) {
    try {
        const { project_id, title, points, assignee_id, category, deadline } = await req.json();

        if (!project_id || !title) {
            return NextResponse.json({ error: 'プロジェクトIDとタイトルが必要です' }, { status: 400 });
        }

        const task = await prisma.task.create({
            data: {
                project_id: BigInt(project_id),
                title,
                difficulty_points: points || 10,
                assignee_id: assignee_id ? BigInt(assignee_id) : null,
                category,
                deadline: deadline ? new Date(deadline) : null,
                status: 'todo'
            }
        });

        return NextResponse.json({
            id: Number(task.id),
            title: task.title,
            status: task.status,
            points: task.difficulty_points
        });
    } catch (error) {
        console.error('Create task error:', error);
        return NextResponse.json({ error: 'タスクの作成に失敗しました' }, { status: 500 });
    }
}

// PATCH /api/tasks - Update an existing task
export async function PATCH(req: Request) {
    try {
        const { id, status, assignee_id, title, points } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'タスクIDが必要です' }, { status: 400 });
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (assignee_id) updateData.assignee_id = BigInt(assignee_id);
        if (title) updateData.title = title;
        if (points) updateData.difficulty_points = points;

        const task = await prisma.task.update({
            where: { id: BigInt(id) },
            data: updateData
        });

        return NextResponse.json({
            id: Number(task.id),
            status: task.status,
            ok: true
        });
    } catch (error) {
        console.error('Update task error:', error);
        return NextResponse.json({ error: 'タスクの更新に失敗しました' }, { status: 500 });
    }
}
