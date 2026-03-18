import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/users - Fetch all users for ranking/leaderboard
export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database connection not available at build time' }, { status: 503 });
  }
  try {
    const users = await (prisma as any).user.findMany({
      orderBy: { points: 'desc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users - Create/Login user
export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database connection not available at build time' }, { status: 503 });
  }
  try {
    const body = await request.json().catch(() => null);
    const { name, email: bodyEmail } = body || {};
    const nameStr = typeof name === 'string' ? name.trim() : '';
    const email = typeof bodyEmail === 'string' ? bodyEmail.trim() : `${nameStr.toLowerCase()}@example.com`;

    if (!nameStr) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    // ログアウト/ログイン整合性のためのログ
    console.log('[API/USERS] Upserting user:', { name: nameStr, email });

    const resUser = await (prisma as any).user.upsert({
      where: { email: email },
      update: { name: nameStr },
      create: {
        name: nameStr,
        email: email,
        avatar: nameStr.slice(0, 2).toUpperCase(),
        role: 'MEMBER',
        skillScore: {},
      },
    });

    return NextResponse.json(resUser);
  } catch (error: any) {
    console.error('Create/Login user error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
