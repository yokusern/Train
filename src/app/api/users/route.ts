import { NextResponse } from 'next/server'
import { initialTeam } from '@/lib/mockData'

// GET /api/users - Fetch all users for ranking
export async function GET() {
    return NextResponse.json(initialTeam)
}
