import { NextResponse } from 'next/server'
import { initialChatMessages } from '@/lib/mockData'

// GET /api/chat - Fetch demo chat messages
export async function GET() {
  return NextResponse.json(initialChatMessages)
}

