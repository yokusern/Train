import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/teams - Fetch teams for a user
export async function GET(req: Request) {
    if (!process.env.DATABASE_URL) {
        return NextResponse.json({ error: 'Database connection not available at build time' }, { status: 503 });
    }
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId || isNaN(parseInt(userId))) {
        return NextResponse.json({ error: 'Valid userId is required' }, { status: 400 });
    }

    try {
        const teamsRes = await (prisma as any).team.findMany({
            where: {
                members: {
                    some: { userId: parseInt(userId) }
                }
            },
            include: {
                members: true,
                projects: true,
            }
        });
        return NextResponse.json(teamsRes);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }
}

// POST /api/teams - Create a new team or join an existing one
export async function POST(req: Request) {
    if (!process.env.DATABASE_URL) {
        return NextResponse.json({ error: 'Database connection not available at build time' }, { status: 503 });
    }
    try {
        const body = await req.json().catch(() => null);
        const { action, name, joinCode, userId } = body || {};

        if (!userId || isNaN(parseInt(userId))) {
            return NextResponse.json({ error: 'Valid userId is required' }, { status: 400 });
        }

        if (action === 'create') {
            if (!name) return NextResponse.json({ error: 'Team name is required' }, { status: 400 });

            // Generate a random 6-digit join code
            const code = joinCode || Math.floor(100000 + Math.random() * 900000).toString();

            const teamRes = await (prisma as any).team.create({
                data: {
                    name,
                    joinCode: code,
                    adminUserId: parseInt(userId),
                    members: {
                        create: {
                            userId: parseInt(userId),
                            role: 'ADMIN',
                        }
                    }
                }
            });
            return NextResponse.json(teamRes);
        } else if (action === 'join') {
            if (!joinCode) return NextResponse.json({ error: 'Join code is required' }, { status: 400 });

            const teamRes = await (prisma as any).team.findUnique({
                where: { joinCode },
            });

            if (!teamRes) {
                return NextResponse.json({ error: 'Invalid join code' }, { status: 404 });
            }

            const membership = await (prisma as any).teamMember.upsert({
                where: {
                    userId_teamId: {
                        userId: parseInt(userId),
                        teamId: teamRes.id,
                    }
                },
                update: {},
                create: {
                    userId: parseInt(userId),
                    teamId: teamRes.id,
                    role: 'MEMBER',
                }
            });

            return NextResponse.json(teamRes);
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('Team action error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
