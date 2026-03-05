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
                    some: {
                        userId: parseInt(userId),
                        isActive: true
                    }
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
            return NextResponse.json({
                ...teamRes,
                role: 'ADMIN'
            });
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
                update: {
                    isActive: true, // Reactivate if previously left
                },
                create: {
                    userId: parseInt(userId),
                    teamId: teamRes.id,
                    role: 'MEMBER',
                    isActive: true,
                }
            });

            return NextResponse.json({
                ...teamRes,
                role: membership.role
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('Team action error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/teams - Leave a team
export async function DELETE(req: Request) {
    if (!process.env.DATABASE_URL) {
        return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
    }
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const teamId = searchParams.get('teamId');

        if (!userId || !teamId || isNaN(parseInt(userId)) || isNaN(parseInt(teamId))) {
            return NextResponse.json({ error: 'Valid userId and teamId are required' }, { status: 400 });
        }

        const uId = parseInt(userId);
        const tId = parseInt(teamId);

        // Check current membership and role
        const membership = await (prisma as any).teamMember.findUnique({
            where: { userId_teamId: { userId: uId, teamId: tId } }
        });

        if (!membership || !membership.isActive) {
            return NextResponse.json({ error: 'Not a member of this team' }, { status: 404 });
        }

        // Admin validation: if leaving user is ADMIN, check if other active ADMINs exist
        if (membership.role === 'ADMIN') {
            const otherAdmins = await (prisma as any).teamMember.count({
                where: {
                    teamId: tId,
                    role: 'ADMIN',
                    isActive: true,
                    userId: { not: uId }
                }
            });

            if (otherAdmins === 0) {
                return NextResponse.json({
                    error: 'You are the only administrator. Please transfer admin rights or ensure another admin exists before leaving.'
                }, { status: 403 });
            }
        }

        // Perform "soft delete" (deactivate)
        await (prisma as any).teamMember.update({
            where: { userId_teamId: { userId: uId, teamId: tId } },
            data: { isActive: false }
        });

        // Reassign team adminUserId if the leaving user was the primary admin
        const team = await (prisma as any).team.findUnique({ where: { id: tId } });
        if (team && team.adminUserId === uId) {
            const nextAdmin = await (prisma as any).teamMember.findFirst({
                where: {
                    teamId: tId,
                    role: 'ADMIN',
                    isActive: true,
                    userId: { not: uId }
                }
            });

            if (nextAdmin) {
                await (prisma as any).team.update({
                    where: { id: tId },
                    data: { adminUserId: nextAdmin.userId }
                });
            } else {
                // If no other admin, but membership check passed, 
                // it means there might be other members but no other admin.
                // Reassign to the first active member found.
                const nextMember = await (prisma as any).teamMember.findFirst({
                    where: {
                        teamId: tId,
                        isActive: true,
                        userId: { not: uId }
                    }
                });
                if (nextMember) {
                    await (prisma as any).team.update({
                        where: { id: tId },
                        data: { adminUserId: nextMember.userId }
                    });
                }
            }
        }

        return NextResponse.json({ message: 'Successfully left the team' });
    } catch (error: any) {
        console.error('Leave team error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
