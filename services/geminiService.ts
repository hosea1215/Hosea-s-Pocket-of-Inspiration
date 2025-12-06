import { GoogleGenAI } from "@google/genai";
import { 
  MarketingCalendarData, 
  GameDetails, 
  CopyVariant, 
  CpeResponse, 
  EconomicMetrics, 
  CompetitorAnalysisResponse, 
  StoreComparisonResponse, 
  PushStrategyResponse, 
  LiveOpsContent, 
  FourElementsResponse, 
  SkinnerBoxResponse, 
  DopamineLoopResponse, 
  BartleResponse, 
  NarrativeResponse
} from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean JSON string if markdown code blocks are present
const cleanJson = (text: string) => {
  return text.replace(/```json\n?|\n?```/g, '').trim();
};

export const generateMarketingCalendar = async (countriesStr: string, year: number, quarter: string, language: string): Promise<{markdown: string, chartData: MarketingCalendarData[]}> => {
    const prompt = `Marketing Calendar for ${countriesStr}, ${year} ${quarter}. Language: ${language}. 
    
    Structure the response as a JSON object with two keys:
    1. "markdown": A comprehensive Markdown string detailing the marketing calendar, holidays, and strategy.
    2. "chartData": An array of objects representing monthly data. Each object must have:
       - "month": string (e.g., 'Jan')
       - "intensity": number (0-100, estimated marketing competition/activity level)
       - "keyEvent": string (Name of the main event)
       - "count": number (Total significant events)
       - "historicalRoas": number (Estimated historical ROAS benchmark for this month/events in these regions, e.g., 1.5)
       - "historicalCtr": number (Estimated historical CTR benchmark, e.g., 2.2)
       - "pastCampaignInsight": string (A short insight on why past campaigns performed this way during this period, e.g., "High CPMs during holidays but high conversion rate.")
    `;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(cleanJson(response.text || "{}"));
};

export const generateMarketingPlan = async (details: GameDetails, platform: string, language: string): Promise<string> => {
  const prompt = `Generate a ${platform} Marketing Strategy for the game "${details.name}" in ${language}.
  Details:
  - Genre: ${details.genre}
  - Target Audience: ${details.targetAudience}
  - Market: ${details.market}
  - Budget: ${details.budget}
  - Goal: ${details.promotionGoal}
  - Purpose: ${details.promotionPurpose}
  - USP: ${details.usp}
  - Gameplay: ${details.gameplay}
  
  Output a comprehensive Markdown formatted plan.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text || "";
};

export const generateAsoAnalysis = async (details: GameDetails, language: string): Promise<string> => {
  const prompt = `Perform an ASO Keyword Analysis for "${details.name}" (${details.genre}) in ${language}. 
  Market: ${details.market}. USP: ${details.usp}.
  Output in Markdown.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text || "";
};

export const generateAdCopy = async (gameDetails: Partial<GameDetails>, concept: string, cta: string, language: string): Promise<{headline: string, body: string, cta: string}> => {
  const prompt = `Write a Facebook Ad Copy for "${gameDetails.name}".
  Concept: ${concept}.
  CTA: ${cta}.
  Language: ${language}.
  Output JSON with keys: headline, body, cta.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(cleanJson(response.text || "{}"));
};

export const generateAdImage = async (
  prompt: string, 
  aspectRatio: string, 
  style: string, 
  visualDetails: string, 
  language: string, 
  includeText: boolean, 
  includeCharacters: boolean,
  model: string = 'gemini-2.5-flash-image'
): Promise<{imageUrl: string, prompt: string, promptZh?: string}> => {
  
  const fullPrompt = `Ad Creative Image for mobile game.
  Style: ${style}.
  Aspect Ratio: ${aspectRatio}.
  Visual Details: ${visualDetails}.
  Include Text: ${includeText}.
  Include Characters: ${includeCharacters}.
  Prompt: ${prompt}.
  Language context: ${language}.`;

  let imageUrl = "";
  
  if (model.includes('imagen')) {
    const response = await ai.models.generateImages({
      model: model,
      prompt: fullPrompt,
      config: { numberOfImages: 1, aspectRatio: aspectRatio as any } 
    });
    if (response.generatedImages && response.generatedImages[0]?.image?.imageBytes) {
       const base64 = response.generatedImages[0].image.imageBytes;
       imageUrl = `data:image/png;base64,${base64}`;
    }
  } else {
    // gemini-2.5-flash-image or gemini-3-pro-image-preview
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: fullPrompt }] },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }

  return { imageUrl, prompt: fullPrompt, promptZh: "" };
};

export const analyzeVisualDetailsFromUrl = async (gameName: string, url: string): Promise<string> => {
  const prompt = `Analyze the visual style of the game "${gameName}" from its store URL: ${url}. Describe it in 2 sentences.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text || "";
};

export const generateAppIcon = async (name: string, genre: string, style: string, elements: string): Promise<string> => {
  const prompt = `App Icon for "${name}". Genre: ${genre}. Style: ${style}. Elements: ${elements}. High quality, app store standard.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] }
  });
  
  let imageUrl = "";
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return imageUrl;
};

export const analyzeIconElementsFromUrl = async (name: string, url: string): Promise<string> => {
  const prompt = `Suggest icon elements for game "${name}" based on store URL: ${url}.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text || "";
};

export const generateFacebookAdCopies = async (productName: string, description: string, language: string, emojis: boolean, url: string, style: string): Promise<CopyVariant[]> => {
  const prompt = `Generate 6 Facebook Ad Copies for "${productName}". 
  Description: ${description}. 
  Language: ${language}. 
  Style: ${style}. 
  Use Emojis: ${emojis}.
  URL context: ${url}.
  Output JSON array of objects with "id", "targetText" (the copy), "sourceText" (explanation or translation).`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(cleanJson(response.text || "[]"));
};

export const analyzeSellingPointsFromUrl = async (name: string, url: string): Promise<string> => {
  const prompt = `Extract 5 key selling points for "${name}" from ${url}.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text || "";
};

export const generateCpeEvents = async (name: string, genre: string, gameplay: string, goal: string, singleCount: number, comboCount: number): Promise<CpeResponse> => {
  const prompt = `Generate CPE (Cost Per Engagement) events for "${name}". 
  Genre: ${genre}. Gameplay: ${gameplay}. UA Goal: ${goal}.
  Generate ${singleCount} single events and ${comboCount} combo events.
  Output JSON with keys: "singleEvents" and "comboEvents". Each event object matches CpeEvent interface.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(cleanJson(response.text || "{\"singleEvents\": [], \"comboEvents\": []}"));
};

export const analyzeGameplayFromUrl = async (name: string, url: string): Promise<string> => {
  const prompt = `Describe the gameplay of "${name}" based on ${url}.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text || "";
};

export const generateAsmrPlan = async (name: string, genre: string, type: string, url: string, language: string): Promise<string> => {
  const prompt = `Create an ASMR Marketing Plan for "${name}" (${genre}). ASMR Type: ${type}. Language: ${language}. Store URL: ${url}. Output Markdown.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text || "";
};

export const generateAbacrAnalysis = async (name: string, genre: string, gameplay: string, url: string, purpose: string, language: string): Promise<string> => {
  const prompt = `Analyze "${name}" using the ABACR Loop model. 
  Genre: ${genre}. Gameplay: ${gameplay}. Purpose: ${purpose}. Language: ${language}. Output Markdown.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text || "";
};

export const expandDesignPurpose = async (purpose: string, name: string): Promise<string> => {
  const prompt = `Expand the design purpose "${purpose}" for game "${name}" into a detailed paragraph.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text || "";
};

export const analyzeGameEconomics = async (metrics: EconomicMetrics): Promise<string> => {
  const prompt = `Analyze these game economic metrics and provide LTV/ROAS insights in Markdown: ${JSON.stringify(metrics)}`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text || "";
};

export const analyzeCompetitor = async (name: string, url: string): Promise<CompetitorAnalysisResponse> => {
  const prompt = `Analyze competitor "${name}" from ${url}. 
  Return JSON with "metrics" (CompetitorMetrics), "market" (MarketPerformance), "audience" (TargetAudience), "report" (CompetitorReport).
  Estimate values if real data is unavailable.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(cleanJson(response.text || "{}"));
};

export const extractGameNameFromUrl = async (url: string): Promise<string> => {
  const prompt = `Extract game name from URL: ${url}. Return just the name.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text?.trim() || "";
};

export const compareStorePages = async (url1: string, url2: string, language: string): Promise<StoreComparisonResponse> => {
  const prompt = `Compare store pages ${url1} and ${url2}. Language: ${language}.
  Return JSON matching StoreComparisonResponse interface.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(cleanJson(response.text || "{}"));
};

export const generatePushStrategy = async (name: string, genre: string, tone: string, language: string, url: string, emojis: boolean): Promise<PushStrategyResponse> => {
  const prompt = `Generate Push Notification Strategy for "${name}". Tone: ${tone}. Language: ${language}. Emojis: ${emojis}.
  Output JSON array of objects (sections) matching PushStrategyResponse type.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(cleanJson(response.text || "[]"));
};

export const generateLiveOpsContent = async (name: string, url: string, type: string, theme: string, language: string, text: boolean, chars: boolean): Promise<LiveOpsContent> => {
  const prompt = `Generate LiveOps content for "${name}". Event: ${type}. Theme: ${theme}. Language: ${language}.
  Return JSON matching LiveOpsContent interface.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(cleanJson(response.text || "{}"));
};

export const generateHookedAnalysis = async (name: string, gameplay: string, url: string, audience: string, language: string): Promise<string> => {
  const prompt = `Analyze "${name}" using Hooked Model. Gameplay: ${gameplay}. Audience: ${audience}. Language: ${language}. Output Markdown.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text || "";
};

export const generateDeepAsoAnalysis = async (name: string, genre: string, url: string, competitors: string, market: string): Promise<string> => {
  const prompt = `Deep ASO Analysis for "${name}". Genre: ${genre}. Competitors: ${competitors}. Market: ${market}. Output Markdown.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text || "";
};

export const generateMdaAnalysis = async (name: string, genre: string, gameplay: string, url: string, language: string): Promise<string> => {
  const prompt = `MDA Framework Analysis for "${name}". Genre: ${genre}. Gameplay: ${gameplay}. Language: ${language}. Output Markdown.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text || "";
};

export const generateOctalysisAnalysis = async (name: string, gameplay: string, url: string, audience: string, language: string): Promise<string> => {
  const prompt = `Octalysis Analysis for "${name}". Gameplay: ${gameplay}. Language: ${language}. Output Markdown.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text || "";
};

export const generateFoggBehaviorAnalysis = async (name: string, gameplay: string, url: string, audience: string, language: string): Promise<string> => {
  const prompt = `Fogg Behavior Model Analysis for "${name}". Language: ${language}. Output Markdown.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text || "";
};

export const generateFlowAnalysis = async (name: string, gameplay: string, url: string, skill: string, language: string): Promise<string> => {
  const prompt = `Flow Theory Analysis for "${name}". Skill Level: ${skill}. Language: ${language}. Output Markdown.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text || "";
};

export const generateFourElementsAnalysis = async (name: string, gameplay: string, url: string, genre: string, language: string): Promise<FourElementsResponse> => {
  const prompt = `Four Elements (Caillois) Analysis for "${name}". Language: ${language}.
  Return JSON with "scores" (FourElementsScore) and "analysis" (string).`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(cleanJson(response.text || "{}"));
};

export const generateSkinnerBoxAnalysis = async (name: string, gameplay: string, url: string, language: string): Promise<SkinnerBoxResponse> => {
  const prompt = `Skinner Box Analysis for "${name}". Language: ${language}.
  Return JSON matching SkinnerBoxResponse interface.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(cleanJson(response.text || "{}"));
};

export const generateDopamineLoopAnalysis = async (name: string, gameplay: string, url: string, rewards: string, language: string): Promise<DopamineLoopResponse> => {
  const prompt = `Dopamine Loop Analysis for "${name}". Rewards: ${rewards}. Language: ${language}.
  Return JSON matching DopamineLoopResponse interface.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(cleanJson(response.text || "{}"));
};

export const generateBartleAnalysis = async (name: string, gameplay: string, url: string, language: string): Promise<BartleResponse> => {
  const prompt = `Bartle Taxonomy Analysis for "${name}". Language: ${language}.
  Return JSON matching BartleResponse interface.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(cleanJson(response.text || "{}"));
};

export const generateNarrativeAnalysis = async (name: string, gameplay: string, url: string, genre: string, language: string): Promise<NarrativeResponse> => {
  const prompt = `Narrative Design Analysis for "${name}". Language: ${language}.
  Return JSON matching NarrativeResponse interface.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(cleanJson(response.text || "{}"));
};

export const generateIaaPlan = async (name: string, genre: string, gameplay: string, market: string, language: string): Promise<string> => {
  const prompt = `IAA Monetization Plan for "${name}". Genre: ${genre}. Market: ${market}. Language: ${language}. Output Markdown.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text || "";
};

export const generateIapPlan = async (name: string, genre: string, gameplay: string, audience: string, language: string): Promise<string> => {
  const prompt = `IAP Monetization Plan for "${name}". Genre: ${genre}. Audience: ${audience}. Language: ${language}. Output Markdown.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text || "";
};

export const generateGooglePlayNews = async (language: string): Promise<string> => {
  const prompt = `Google Play News Briefing (Last 30 days). Language: ${language}. Output Markdown.`;
  const response = await ai.models.generateContent({ 
    model: 'gemini-2.5-flash', 
    contents: prompt,
    config: {
        tools: [{googleSearch: {}}]
    }
  });
  return response.text || "";
};

export const generateAppStoreNews = async (language: string): Promise<string> => {
  const prompt = `App Store News Briefing (Last 30 days). Language: ${language}. Output Markdown.`;
  const response = await ai.models.generateContent({ 
    model: 'gemini-2.5-flash', 
    contents: prompt,
    config: {
        tools: [{googleSearch: {}}]
    }
  });
  return response.text || "";
};

export const generateAdTechNews = async (platform: string, language: string): Promise<string> => {
  const prompt = `${platform} Ad Tech News Briefing (Last 30 days). Language: ${language}. Output Markdown.`;
  const response = await ai.models.generateContent({ 
    model: 'gemini-2.5-flash', 
    contents: prompt,
    config: {
        tools: [{googleSearch: {}}]
    }
  });
  return response.text || "";
};

export const generateAdBiddingStrategy = async (name: string, genre: string, platform: string, market: string, language: string): Promise<string> => {
  const prompt = `Ad Bidding Strategy for "${name}". Platform: ${platform}. Market: ${market}. Language: ${language}. Output Markdown.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text || "";
};

export const generateIapPricingStrategy = async (name: string, genre: string, region: string, language: string): Promise<string> => {
  const prompt = `IAP Pricing Strategy for "${name}". Region: ${region}. Language: ${language}. Output Markdown.`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text || "";
};
