import { GoogleGenAI } from "@google/genai";

if (typeof window !== "undefined") {
  throw new Error("Gemini SDK cannot be executed on the client side.");
}

let cachedAi: GoogleGenAI | null = null;
let lastKey: string | undefined = undefined;

export function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!cachedAi || lastKey !== apiKey) {
    lastKey = apiKey;
    cachedAi = new GoogleGenAI({
      apiKey: apiKey || "",
    });
  }
  return cachedAi;
}

// Transparent proxy for seamless backward compatibility with direct `ai.models.generateContent` calls
export const ai = new Proxy({} as GoogleGenAI, {
  get(_target, prop) {
    const client = getAiClient();
    const val = Reflect.get(client, prop);
    return typeof val === "function" ? val.bind(client) : val;
  },
});

export default ai;
