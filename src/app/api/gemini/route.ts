import { NextResponse } from 'next/server';
import { geminiModel } from '../../../lib/gemini';

export async function POST(req: Request) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'サーバー設定エラー: GEMINI_API_KEYが設定されていません。' },
                { status: 500 }
            );
        }

        const { prompt, systemInstruction } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: 'プロンプトが必要です。' },
                { status: 400 }
            );
        }

        const defaultSystemInstruction = "あなたはプロジェクト管理アシスタント『Train AI』です。回答はすべて日本語で行ってください。親切で励みになる口調で、チームの成長をサポートしてください。";

        const fullPrompt = `[システム指示: ${systemInstruction || defaultSystemInstruction}]\n\nユーザーの質問: ${prompt}`;

        const result = await geminiModel.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ success: true, data: text });
    } catch (error: unknown) {
        console.error('Gemini API Error:', error);
        const message = error instanceof Error ? error.message : 'AI処理中にエラーが発生しました。';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
