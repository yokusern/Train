import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini client.
// Note: This relies on the GEMINI_API_KEY environment variable.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Define the model we want to use.
export const geminiModel = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
});
