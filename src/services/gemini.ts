import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const models = {
  flash: "gemini-2.5-flash-latest",
  pro: "gemini-3.1-pro-preview",
  tts: "gemini-2.5-flash-preview-tts",
  audio: "gemini-2.5-flash-native-audio-preview-12-2025",
};

export async function analyzeContent(url: string, type: 'seo' | 'geo' | 'full') {
  const prompt = `
    You are 'Radar Local AI', an expert auditor in traditional Local SEO and the new GEO (Generative Engine Optimization).
    
    I am providing you with a URL to analyze: ${url}

    Your task is to analyze this entity and return a structured diagnosis.
    
    1. **Review & Rating Verification**: Search for the business on Google Maps/Search. Identify their average rating and total number of reviews. Explain the impact of these metrics on their local visibility and trust.
    2. **Web Content Audit**: Analyze the main heading (H1) and listed services on the landing page. Check for relevance and local SEO optimization. Provide specific suggestions.
    3. **Schema Markup Analysis**: Detect if JSON-LD structured data is present. Identify the types (e.g., LocalBusiness, MedicalBusiness). Explain why this is crucial for AI understanding.

    Return the response in JSON format with the following structure:
    {
      "seo_diagnosis": {
        "score": number (0-100),
        "issues": string[],
        "strengths": string[],
        "reviews": {
          "rating": number (e.g. 4.5, or 0 if not found),
          "count": number (e.g. 120, or 0 if not found),
          "impact_analysis": string (Explanation of impact)
        },
        "content_audit": {
          "h1": string (The main H1 detected),
          "services_found": string[] (List of services detected),
          "suggestions": string[] (Suggestions for improvement)
        }
      },
      "geo_diagnosis": {
        "score": number (0-100),
        "schema_detected": boolean,
        "schema_types": string[] (List of schema types found, e.g. ["LocalBusiness"]),
        "schema_analysis": string (Explanation of importance and status),
        "entity_clarity": string,
        "missing_data": string[]
      },
      "sales_pitch": {
        "package_1_seo": string,
        "package_2_geo": string,
        "package_3_bundle": string
      }
    }
  `;

  const response = await ai.models.generateContent({
    model: models.flash,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }, { googleMaps: {} }],
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generateTTS(text: string) {
  const response = await ai.models.generateContent({
    model: models.tts,
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: "Puck" },
        },
      },
    },
  });
  
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
}
