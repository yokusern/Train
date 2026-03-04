import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/activity?teamId=... - Fetch recent activities for a team
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
    const activities = await (prisma as any).activityLog.findMany({
      where: { teamId: parseInt(teamId) },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { user: true }
    });
    return NextResponse.json(activities);
  } catch (error: any) {
    console.error('Fetch activity error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/activity - Log a new activity
export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database connection not available at build time' }, { status: 503 });
  }
  try {
    const body = await req.json().catch(() => null);
    const { userId, teamId, projectId, action, target, pointsEarned } = body || {};

    if (!userId || !teamId || !action || !target) {
      return NextResponse.json({ error: 'userId, teamId, action, and target are required' }, { status: 400 });
    }

    const resLog = await (prisma as any).activityLog.create({
      data: {
        userId: parseInt(userId),
        teamId: parseInt(teamId),
        projectId: projectId ? parseInt(projectId) : null,
        action,
        target,
        pointsEarned: pointsEarned || 0,
      }
    });

    return NextResponse.json(resLog);
  } catch (error: any) {
    console.error('Log activity error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
