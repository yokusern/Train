import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/projects - Fetch projects for a specific team
export async function GET(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database connection not available at build time' }, { status: 503 });
  }
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get('teamId');

  if (!teamId || isNaN(parseInt(teamId))) {
    return NextResponse.json({ error: 'Valid teamId is required' }, { status: 400 });
  }

  try {
    const projects = await (prisma as any).project.findMany({
      where: { teamId: parseInt(teamId) },
      include: { tasks: true },
    });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST /api/projects - Create a new project
export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database connection not available at build time' }, { status: 503 });
  }
  try {
    const body = await req.json().catch(() => null);
    const { name, icon, teamId, createdByUserId } = body || {};

    if (!name || !teamId || !createdByUserId || isNaN(parseInt(teamId)) || isNaN(parseInt(createdByUserId))) {
      return NextResponse.json({ error: 'name, valid teamId, and valid createdByUserId are required' }, { status: 400 });
    }

    const resProject = await (prisma as any).project.create({
      data: {
        name,
        icon: icon || '📁',
        teamId: parseInt(teamId),
        createdByUserId: parseInt(createdByUserId),
      },
    });

    return NextResponse.json(resProject);
  } catch (error: any) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
