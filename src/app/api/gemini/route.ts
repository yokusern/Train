import { NextResponse } from 'next/server';
import { geminiModel } from '../../../lib/gemini';

export async function POST(req: Request) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'Server configuration error: GEMINI_API_KEY is not set.' },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { prompt, systemInstruction } = body;

        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt is required.' },
                { status: 400 }
            );
        }

        // Since we are using standard generateContent without specific system messages, 
        // we'll prepend instructions if they exist. (Alternatively, you can configure geminiModel with system_instruction).
        const fullPrompt = systemInstruction
            ? `[SYSTEM INSTRUCTION: ${systemInstruction}]\n\nUser Query: ${prompt}`
            : prompt;

        const result = await geminiModel.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ success: true, data: text });
    } catch (error: any) {
        console.error('Gemini API Error:', error);
        return NextResponse.json(
            { error: error.message || 'An error occurred during AI processing.' },
            { status: 500 }
        );
    }
}
