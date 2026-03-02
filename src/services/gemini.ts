import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const models = {
  flash: "gemini-3.1-pro-preview",
  pro: "gemini-3.1-pro-preview",
  tts: "gemini-2.5-flash-preview-tts",
  audio: "gemini-2.5-flash-native-audio-preview-12-2025",
};

export async function analyzeContent(url: string, type: 'seo' | 'geo' | 'full', language: 'es' | 'en' = 'es') {
  const prompt = `
    You are 'Radar Local AI', an elite auditor specializing in Local SEO and Generative Engine Optimization (GEO). Your goal is to generate a high-stakes, irresistible audit that convinces a business owner they are losing money by ignoring AI.

    I am providing you with a URL or Business Name to analyze: ${url}
    
    IMPORTANT: The entire JSON content MUST be in ${language === 'es' ? 'SPANISH' : 'ENGLISH'}.

    Your task is to analyze this business entity specifically for its visibility in the AI Era (Google Maps, Gemini, ChatGPT, Voice Search).
    
    Analyze the following deep metrics:
    1. **Entity Clarity & Knowledge Graph**: Does AI know *exactly* what this business is? Or is it confused?
    2. **Review Sentiment for AI**: AI recommends "trusted" businesses. Analyze sentiment depth, not just star rating.
    3. **Voice Search Readiness**: If someone asks Siri/Gemini "Best [service] near me", will this business appear?
    4. **Visual Appeal (Inferred)**: Do they have high-quality images that AI can "see" and describe?
    5. **Competitor Gap**: Who is winning in this niche and why?

    Return the response in this STRICT JSON format:
    {
      "gemini_maps_diagnosis": {
        "score": number (0-100),
        "entity_clarity": string ("High", "Moderate", "Low"),
        "entity_clarity_reason": string (Detailed technical reason),
        "sentiment_analysis": {
          "score": number (0-100),
          "summary": string (Punchy summary of reputation),
          "keywords": string[] (5-7 key themes)
        },
        "voice_search_readiness": {
          "score": number (0-100),
          "status": string (e.g., "Invisible", "Optimized", "Needs Work"),
          "reason": string
        },
        "competitor_gap": {
          "main_competitor": string (Name of a likely top competitor),
          "why_they_win": string (What they are doing better)
        },
        "missing_data_points": string[] (Critical missing info like 'Menu', 'Services', 'Attributes'),
        "ai_recommendation_likelihood": string ("High", "Low", "Critical"),
        "improvement_plan": {
          "immediate_actions": string[] (3 "Quick Wins" to do TODAY),
          "long_term_strategy": string[] (3 Strategic moves for dominance)
        }
      },
      "lead_magnet_hook": {
        "headline": string (Shocking/Urgent headline about lost revenue),
        "subheadline": string (Data-backed reason they need to act now),
        "estimated_lost_revenue": string (e.g., "$5,000/month")
      }
    }
  `;

  const response = await ai.models.generateContent({
    model: models.flash,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || "{}";
  // Extract JSON from Markdown code block if present
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
  const jsonString = jsonMatch ? jsonMatch[1] : text;

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse JSON response:", e);
    return {};
  }
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
