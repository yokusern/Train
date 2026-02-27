import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/users - Fetch all users for ranking/leaderboard
export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                total_points: 'desc'
            }
        });

        // Transform Prisma model to frontend type (Role enum and field names)
        const transformedUsers = users.map(user => ({
            id: Number(user.id),
            name: user.name,
            avatar: user.avatar_url || '👤',
            points: user.total_points,
            pendingPoints: user.pending_points,
            rank: 'Bronze', // Default rank for now
            role: user.role.toUpperCase(),
            skillScore: user.skill_score || {}
        }));

        return NextResponse.json(transformedUsers);
    } catch (error) {
        console.error('Fetch users error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

// POST /api/users - Create or Login user
export async function POST(request: Request) {
    try {
        const { name, role } = await request.json();

        if (!name || !role) {
            return NextResponse.json({ error: 'Name and role are required' }, { status: 400 });
        }

        // Find or create user
        let user = await prisma.user.findFirst({
            where: { name: name }
        });

        if (!user) {
            // Create new user if not exists
            user = await prisma.user.create({
                data: {
                    name,
                    email: `${name.toLowerCase().replace(/\s/g, '_')}@example.com`, // Dummy email
                    role: role.toLowerCase() === 'admin' ? 'admin' : 'member',
                    avatar_url: role.toLowerCase() === 'admin' ? '🛡️' : '👤',
                }
            });
        }

        // Return transformed user
        const transformedUser = {
            id: Number(user.id),
            name: user.name,
            avatar: user.avatar_url || '👤',
            points: user.total_points,
            pendingPoints: user.pending_points,
            rank: 'Bronze',
            role: user.role.toUpperCase(),
            skillScore: user.skill_score || {}
        };

        return NextResponse.json(transformedUser);
    } catch (error) {
        console.error('Login/Signup error:', error);
        return NextResponse.json({ error: 'Failed to login/signup' }, { status: 500 });
    }
}
