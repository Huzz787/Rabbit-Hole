import { GoogleGenAI } from "@google/genai";

if (typeof window !== "undefined") {
  throw new Error("Gemini SDK cannot be executed on the client side.");
}

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey && process.env.NODE_ENV === "production") {
  console.warn("GEMINI_API_KEY is not defined in environment variables.");
}

export const ai = new GoogleGenAI({
  apiKey: apiKey || "",
});

export default ai;
