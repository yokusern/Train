import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST /api/tasks - Create a new task
export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database connection not available at build time' }, { status: 503 });
  }
  try {
    const body = await req.json().catch(() => null);
    const { projectId, teamId, title, points, createdByUserId, deadline, category } = body || {};

    if (!projectId || !teamId || !title || !createdByUserId || isNaN(parseInt(projectId)) || isNaN(parseInt(teamId)) || isNaN(parseInt(createdByUserId))) {
      return NextResponse.json({ error: 'Valid projectId, teamId, title, and createdByUserId are required' }, { status: 400 });
    }

    const taskRes = await (prisma as any).task.create({
      data: {
        title,
        points: points || 10,
        projectId: parseInt(projectId),
        teamId: parseInt(teamId),
        createdByUserId: parseInt(createdByUserId),
        deadline: deadline ? new Date(deadline) : null,
        category,
      },
    });

    return NextResponse.json(taskRes);
  } catch (error: any) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/tasks - Update an existing task
export async function PATCH(req: Request) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl === 'undefined' || dbUrl === 'null') {
    return NextResponse.json({ error: 'Database connection (DATABASE_URL) is not defined' }, { status: 503 });
  }
  try {
    const body = await req.json().catch(() => null);
    const { id, status, assigneeId } = body || {};

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ error: 'Valid id is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (assigneeId) updateData.assigneeId = parseInt(assigneeId);
    if (status === 'done') updateData.completedAt = new Date();

    const taskRes = await (prisma as any).task.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json(taskRes);
  } catch (error: any) {
    console.error('Update task error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
