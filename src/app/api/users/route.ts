import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/users - Fetch all users for ranking
export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                total_points: 'desc'
            }
        })

        const serializedUsers = JSON.parse(
            JSON.stringify(users, (key, value) =>
                typeof value === 'bigint' ? Number(value) : value
            )
        )

        return NextResponse.json(serializedUsers)
    } catch (error: any) {
        console.error('Fetch users error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
