import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/chat?teamId=... - Fetch recent chat messages/comments for a team
// Note: Using comments as a proxy for chat messages in this simplified schema
export async function GET(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get('teamId');

  if (!teamId || isNaN(parseInt(teamId))) {
    return NextResponse.json({ error: 'Valid teamId is required' }, { status: 400 });
  }

  try {
    // In our schema, comments are linked to tasks. 
    // For a generic "chat", we might need a dedicated model, 
    // but for now, we'll fetch team-wide task comments.
    const comments = await (prisma as any).comment.findMany({
      where: {
        task: { teamId: parseInt(teamId) }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: true }
    });

    // Transform to ChatMessage format expected by frontend
    const messages = comments.map((c: any) => ({
      id: c.id,
      user: c.user.name,
      avatar: c.user.avatar,
      text: c.content,
      time: new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error('Fetch chat error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
