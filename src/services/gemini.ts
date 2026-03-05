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
    You are 'Radar Local AI', a business consultant who explains complex digital problems in simple, money-focused terms to business owners.
    
    I am providing you with a URL or Business Name to analyze: ${url}
    
    IMPORTANT: The entire JSON content MUST be in ${language === 'es' ? 'SPANISH' : 'ENGLISH'}.
    
    Your goal is to tell the business owner WHY they are losing customers to competitors in the AI Era (Google Maps, Siri, ChatGPT).
    
    CRITICAL INSTRUCTIONS:
    1. **NO TECHNICAL JARGON**: Do NOT use words like "JSON-LD", "Schema", "Knowledge Graph", "Crawlers", "Algorithms", "Backlinks".
    2. **FOCUS ON BUSINESS VALUE**: Talk about "Customers", "Calls", "Reservations", "Visibility", "Reputation".
    3. **BE DIRECT & URGENT**: Explain that if AI can't "see" them, customers can't find them.
    
    Analyze the following:
    1. **Clarity**: Is it clear what they sell? (e.g., "AI is confused if you are a gym or a cafe").
    2. **Reputation**: Do people trust them? (e.g., "Customers love your service but complain about wait times").
    3. **Voice Search**: If I ask Siri, do they show up? (e.g., "Invisible to voice search").
    4. **Competitors**: Who is stealing their customers and why? (e.g., "Competitor X has better photos and more recent reviews").
    
    Return the response in this STRICT JSON format:
    {
      "gemini_maps_diagnosis": {
        "score": number (0-100),
        "entity_clarity": string ("High", "Moderate", "Low"),
        "entity_clarity_reason": string (Simple explanation: "Google doesn't know your opening hours" or "Your menu is hard to read for AI"),
        "sentiment_analysis": {
          "score": number (0-100),
          "summary": string (What customers are actually saying in plain language),
          "keywords": string[] (5-7 simple themes like "Price", "Service", "Location")
        },
        "voice_search_readiness": {
          "score": number (0-100),
          "status": string (e.g., "Invisible", "Visible", "Dominant"),
          "reason": string (e.g., "Siri can't find your phone number" or "Alexa doesn't know your menu")
        },
        "competitor_gap": {
          "main_competitor": string (Name of a likely top competitor),
          "why_they_win": string (Simple reason: "They have 50 more photos" or "They reply to every review")
        },
        "missing_data_points": string[] (Critical missing info: 'Menu Photos', 'Holiday Hours', 'Wheelchair Access'),
        "ai_recommendation_likelihood": string ("High", "Low", "Critical"),
        "improvement_plan": {
          "immediate_actions": string[] (3 Simple tasks: "Upload 5 photos of food", "Reply to last 3 reviews", "Update Sunday hours"),
          "long_term_strategy": string[] (3 Business goals: "Get 10 reviews this month", "Post weekly updates", "Add a Q&A section")
        }
      },
      "lead_magnet_hook": {
        "headline": string (Shocking/Urgent headline about lost customers),
        "subheadline": string (Simple reason they need to act now),
        "estimated_lost_revenue": string (e.g., "$2,000/month")
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
