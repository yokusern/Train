import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/activity - Fetch recent activities
export async function GET() {
    try {
        const activities = await prisma.activityLog.findMany({
            take: 20,
            orderBy: { created_at: 'desc' },
            include: {
                user: true,
                project: true
            }
        });

        const transformed = activities.map(a => ({
            id: Number(a.id),
            user: a.user?.name || '不明なユーザー',
            avatar: a.user?.avatar_url || '👤',
            action: a.message || a.action_type.replace(/_/g, ' '),
            target: a.project?.name || '不明なプロジェクト',
            points: a.points_earned > 0 ? `+${a.points_earned}` : '-',
            time: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        return NextResponse.json(transformed);
    } catch (error) {
        console.error('Fetch activities error:', error);
        return NextResponse.json({ error: 'アクティビティの取得に失敗しました' }, { status: 500 });
    }
}

// POST /api/activity - Log a new activity
export async function POST(req: Request) {
    try {
        const { user_id, project_id, action_type, target_id, points_earned, message } = await req.json();

        if (!user_id || !action_type) {
            return NextResponse.json({ error: 'ユーザーIDとアクションタイプが必要です' }, { status: 400 });
        }

        const log = await prisma.activityLog.create({
            data: {
                user_id: BigInt(user_id),
                project_id: project_id ? BigInt(project_id) : null,
                action_type,
                target_id: target_id ? BigInt(target_id) : null,
                points_earned: points_earned || 0,
                message
            }
        });

        // Update user total points if points were earned
        if (points_earned > 0) {
            await prisma.user.update({
                where: { id: BigInt(user_id) },
                data: {
                    total_points: { increment: points_earned }
                }
            });
        }

        return NextResponse.json({ ok: true, id: Number(log.id) });
    } catch (error) {
        console.error('Log activity error:', error);
        return NextResponse.json({ error: 'アクティビティの記録に失敗しました' }, { status: 500 });
    }
}
