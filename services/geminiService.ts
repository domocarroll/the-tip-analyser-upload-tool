import { GoogleGenAI } from "@google/genai";
import { RaceCategory, RaceTips } from "../types";

const MODEL = 'gemini-2.5-flash';

const getAi = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API key is not configured.");
  }
  return new GoogleGenAI({ apiKey });
};

const raceTipsSystemPrompt = `You are a highly accurate data extraction specialist. Your task is to analyze images of horse racing tip sheets and extract all tips into a structured JSON format.
- A tipster is a person or publication providing tips (e.g., "Ray Thomas", "SMH Craig Kerry", "SKY Sports Radio").
- For each tipster, you must list their selections in the exact order they appear: 1st (win), 2nd, 3rd, 4th, etc.
- You must capture both the horse's number and name for each selection if they are available.
- Combine information from all provided images into a single valid JSON array.
- Do not omit any tipsters or races.
- Your final output must only be the JSON array, with no other text, commentary, or markdown formatting. The JSON should be an array of objects, where each object represents a race and has 'raceNumber' and 'tips' properties. The 'tips' property is an array of tipster objects, each with 'tipsterName' and their 'selections' array. Each selection should have 'horseName' and optional 'horseNumber'.`;

export const processTipSheets = async (base64Images: string[], category: RaceCategory): Promise<RaceTips[]> => {
    const ai = getAi();
    
    const imageParts = base64Images.map(img => ({
        inlineData: {
            data: img,
            mimeType: 'image/jpeg',
        },
    }));
    
    const textPart = {
        text: `Analyze the provided images of horse racing tip sheets for the '${category}' meeting and provide the data in the specified JSON format.`
    };

    const response = await ai.models.generateContent({
        model: MODEL,
        contents: { parts: [textPart, ...imageParts] },
        config: {
            systemInstruction: raceTipsSystemPrompt,
        }
    });

    let responseText = response.text.trim();
    if (responseText.startsWith('```json')) {
        responseText = responseText.substring(7, responseText.length - 3).trim();
    }
    if (responseText.startsWith('`')) {
        responseText = responseText.substring(1, responseText.length - 1).trim();
    }

    const parsedJson = JSON.parse(responseText);

    // Add category to each race object for context
    return parsedJson.map((race: Omit<RaceTips, 'category'>) => ({ ...race, category }));
};


const refineDataSystemPrompt = `You are an intelligent data cleaning assistant. The user will provide a JSON object containing horse racing tips and a request to modify it.
Apply the user's change to the JSON object.
Your response MUST be only the modified, valid JSON object as a string. Do not add any commentary, explanation, or markdown formatting.`;

export const refineExtractedData = async (currentJson: RaceTips[], prompt: string): Promise<string> => {
    const ai = getAi();

    const userPrompt = `User request: "${prompt}".\n\nCurrent JSON:\n${JSON.stringify(currentJson, null, 2)}`;
    
    const response = await ai.models.generateContent({
        model: MODEL,
        contents: userPrompt,
        config: {
            systemInstruction: refineDataSystemPrompt,
        }
    });
    
    return response.text;
};
