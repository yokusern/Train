import { NextResponse } from 'next/server'

// POST /api/activity - Log a new activity
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { user_id, action_type } = body

        if (!user_id || !action_type) {
            return NextResponse.json({ error: 'User ID and action type are required' }, { status: 400 })
        }

        // Demo mode: accept and no-op
        return NextResponse.json({ ok: true })
    } catch (error: any) {
        console.error('Log activity error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
