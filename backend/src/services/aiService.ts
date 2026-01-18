import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const translateToPidgin = async (text: string) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Translate this into authentic Nigerian Street Pidgin: "${text}". Just return the translation, no extra yarn.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("AI Banter error:", error);
        return text; // Fallback to original
    }
};

export const getStreetBanter = async (context: string) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `You are a street-smart Nigerian kid. Comment on this game event in Pidgin slang: "${context}". One short sentence only.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        return "Oya, let's go!";
    }
};
