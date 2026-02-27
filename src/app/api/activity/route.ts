import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/activity - Log a new activity
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { user_id, project_id, action_type, target_id, points_earned, message } = body

        if (!user_id || !action_type) {
            return NextResponse.json({ error: 'User ID and action type are required' }, { status: 400 })
        }

        const activity = await prisma.activityLog.create({
            data: {
                user_id: BigInt(user_id),
                project_id: project_id ? BigInt(project_id) : null,
                action_type,
                target_id: target_id ? BigInt(target_id) : null,
                points_earned: points_earned || 0,
                message
            }
        })

        // If points were earned, update the user's total_points and pending_points logic
        if (points_earned && points_earned !== 0) {
            if (action_type === 'task_completed') {
                const points = Number(points_earned)
                await prisma.user.update({
                    where: { id: BigInt(user_id) },
                    data: {
                        pending_points: { increment: points }
                    }
                })
            } else if (action_type === 'points_awarded') {
                const points = Number(points_earned)
                await prisma.user.update({
                    where: { id: BigInt(user_id) },
                    data: {
                        total_points: { increment: points }
                    }
                })
            }
        }

        const serializedActivity = JSON.parse(
            JSON.stringify(activity, (key, value) =>
                typeof value === 'bigint' ? Number(value) : value
            )
        )

        return NextResponse.json(serializedActivity)
    } catch (error: any) {
        console.error('Log activity error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
