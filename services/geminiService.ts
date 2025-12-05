
import { GoogleGenAI } from "@google/genai";
import { 
  GameDetails, CopyVariant, CpeResponse, EconomicMetrics, 
  CompetitorReport, CompetitorMetrics, TargetAudience, MarketPerformance, 
  StoreComparisonResponse, PushStrategyResponse, LiveOpsContent, 
  FourElementsResponse, SkinnerBoxResponse, DopamineLoopResponse, 
  BartleResponse, NarrativeResponse 
} from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseJson = (text: string | undefined): any => {
  if (!text) return null;
  try {
    let cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
    cleanText = cleanText.replace(/```\n?|\n?```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    return null;
  }
};

export const generateMarketingPlan = async (details: GameDetails, language: string): Promise<string> => {
  const prompt = `Generate a comprehensive Facebook UA marketing strategy for a game with the following details:
  Name: ${details.name}
  Genre: ${details.genre}
  Target Audience: ${details.targetAudience}
  Budget: ${details.budget}
  Market: ${details.market}
  USP: ${details.usp}
  Gameplay: ${details.gameplay}
  Goal: ${details.promotionGoal}
  Purpose: ${details.promotionPurpose}
  Store URL: ${details.storeUrl || 'N/A'}

  Output Language: ${language}.
  Format: Markdown. Include sections for Campaign Structure, Audience Targeting, Creative Strategy, and Budget Allocation.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
  });
  return response.text || "";
};

export const generateAsoAnalysis = async (details: GameDetails, language: string): Promise<string> => {
  const prompt = `Perform an ASO keyword analysis for the game "${details.name}" (${details.storeUrl || ''}).
  Genre: ${details.genre}.
  Gameplay: ${details.gameplay}.
  Market: ${details.market}.
  
  Output Language: ${language}.
  Format: Markdown. Provide a list of high-volume, low-competition keywords, and suggestions for Title, Short Description, and Long Description.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] }
  });
  return response.text || "";
};

export const generateAdCopy = async (details: GameDetails, concept: string, cta: string, language: string): Promise<{headline: string, body: string, cta: string}> => {
  const prompt = `Write a Facebook ad copy for the mobile game "${details.name}".
  Concept: ${concept}
  CTA: ${cta}
  Language: ${language}
  
  Return a JSON object with keys: "headline", "body", "cta".`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  });
  return parseJson(response.text) || { headline: "", body: "", cta: "" };
};

export const generateAdImage = async (
  prompt: string, 
  aspectRatio: string, 
  style: string, 
  details: string, 
  language: string, 
  includeText: boolean, 
  includeCharacters: boolean,
  model: string = 'gemini-2.5-flash-image'
): Promise<{imageUrl: string, prompt: string, promptZh?: string}> => {
  
  const fullPrompt = `Create a mobile game ad image. 
  Description: ${prompt}. 
  Style: ${style}. 
  Details: ${details}.
  Include Text: ${includeText}.
  Include Characters: ${includeCharacters}.
  Aspect Ratio: ${aspectRatio}.`;

  // Handle Imagen model
  if (model.includes('imagen')) {
     const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: fullPrompt,
        config: {
            numberOfImages: 1,
            aspectRatio: aspectRatio === '1:1' ? '1:1' : '1:1' // Simplified fallback as aspect ratio mapping might vary
        } 
     });
     
     const b64 = response.generatedImages?.[0]?.image?.imageBytes;
     if (b64) {
         return { imageUrl: `data:image/png;base64,${b64}`, prompt: fullPrompt };
     }
     throw new Error("No image generated");
  }

  // Handle Gemini models
  const response = await ai.models.generateContent({
    model: model,
    contents: {
        parts: [{ text: fullPrompt }]
    },
    // DO NOT set responseMimeType for gemini-2.5-flash-image
  });
  
  let imageUrl = '';
  if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
              imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              break;
          }
      }
  }
  
  if (!imageUrl) throw new Error("No image generated");

  return { imageUrl, prompt: fullPrompt };
};

export const analyzeVisualDetailsFromUrl = async (gameName: string, url: string): Promise<string> => {
    const prompt = `Analyze the visual style and key elements of the game "${gameName}" from its store page: ${url}. 
    Describe the art style, color palette, characters, and environment.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateAppIcon = async (gameName: string, genre: string, style: string, elements: string): Promise<string> => {
    const prompt = `App Icon for "${gameName}" (${genre}). Style: ${style}. Elements: ${elements}. High quality, 512x512.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: prompt
    });
    
    let imageUrl = '';
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
            }
        }
    }
    return imageUrl;
};

export const analyzeIconElementsFromUrl = async (gameName: string, url: string): Promise<string> => {
    const prompt = `Suggest icon elements for "${gameName}" based on its store page: ${url}. What are the iconic characters or items?`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateFacebookAdCopies = async (productName: string, description: string, language: string, includeEmojis: boolean, storeUrl: string, style: string): Promise<CopyVariant[]> => {
    const prompt = `Generate 20 distinct Facebook ad copies for "${productName}".
    Description: ${description}
    Store URL: ${storeUrl}
    Language: ${language}
    Include Emojis: ${includeEmojis}
    Style: ${style}
    
    Return a JSON array of objects with keys: "id" (string), "targetText" (the ad copy), "sourceText" (explanation or translation in Simplified Chinese).`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return parseJson(response.text) || [];
};

export const analyzeSellingPointsFromUrl = async (productName: string, url: string): Promise<string> => {
    const prompt = `Analyze selling points for "${productName}" from ${url}. Summary in Simplified Chinese.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateCpeEvents = async (gameName: string, genre: string, gameplay: string, goal: string, singleCount: number, comboCount: number): Promise<CpeResponse> => {
    const prompt = `Generate CPE (Cost Per Engagement) events for "${gameName}" (${genre}).
    Gameplay: ${gameplay}
    UA Goal: ${goal}
    Generate ${singleCount} single events and ${comboCount} combo events.
    
    Return JSON with keys: "singleEvents" (array), "comboEvents" (array).
    Each event object: id, eventName, descriptionZh, descriptionEn, difficulty, estimatedTime, uaValueZh, uaValueEn, completionRate, timeLimit.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return parseJson(response.text) || { singleEvents: [], comboEvents: [] };
};

export const analyzeGameplayFromUrl = async (gameName: string, url: string): Promise<string> => {
    const prompt = `Describe the core gameplay of "${gameName}" based on ${url}.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateAsmrPlan = async (gameName: string, genre: string, type: string, url: string, language: string): Promise<string> => {
    const prompt = `Create an ASMR marketing plan for "${gameName}" (${genre}, URL: ${url}).
    ASMR Type: ${type}
    Language: ${language}
    Format: Markdown.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateAbacrAnalysis = async (gameName: string, genre: string, gameplay: string, url: string, purpose: string, language: string): Promise<string> => {
    const prompt = `Analyze "${gameName}" using the A-B-A-C-R level design model.
    Gameplay: ${gameplay}
    Design Purpose: ${purpose}
    URL: ${url}
    Language: ${language}
    Format: Markdown.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const expandDesignPurpose = async (purpose: string, gameName: string): Promise<string> => {
    const prompt = `Expand the design purpose "${purpose}" for game "${gameName}".`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text || "";
};

export const analyzeGameEconomics = async (metrics: EconomicMetrics): Promise<string> => {
    const prompt = `Analyze the game economics based on these metrics: ${JSON.stringify(metrics)}. Provide insights on LTV, payback, and profitability.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt
    });
    return response.text || "";
};

export const analyzeCompetitor = async (gameName: string, url: string): Promise<{
    report: CompetitorReport; 
    metrics: CompetitorMetrics;
    audience: TargetAudience;
    market: MarketPerformance;
}> => {
    const prompt = `Perform a deep competitor analysis for "${gameName}" (${url}).
    
    Return a JSON object containing:
    1. "report": object with keys (marketAnalysis, productAnalysis, coreGameplay, abacrAnalysis, hookedModel, emotionalAttachment, pushStrategy, asmrPotential, monetization, liveOps, branding, community, ipPotential, techStack, localization, gameEvents, userReviews, swot) - all strings (markdown allowed).
    2. "metrics": object with keys (d1, d7, d30, avgSessionDuration, estimatedDau, topCountries (array of strings)).
    3. "audience": object with keys (countries (array), gender, age, interests (array), income, occupation (array), relationship).
    4. "market": object with keys (
        financialTrends (array of {month: string (e.g. 'Jan'), downloads: number, revenue: number}), 
        rankingHistory (array of {month: string, freeRank: number, grossingRank: number}), 
        genderDistribution (array of {name: string, value: number}), 
        ageDistribution (array of {name: string, value: number})
    ).
    
    IMPORTANT: For 'market' data, ensure 'downloads', 'revenue', 'freeRank', 'grossingRank', and 'value' are pure NUMBERS (no 'k', '$' or '%' symbols). Use Google Search to find real or estimated data.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { 
            tools: [{ googleSearch: {} }],
            responseMimeType: 'application/json'
        }
    });

    const data = parseJson(response.text);
    return data || { report: {}, metrics: {}, audience: {}, market: {} };
};

export const extractGameNameFromUrl = async (url: string): Promise<string> => {
    const prompt = `Extract game name from URL: ${url}. Return just the name.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text?.trim() || "";
};

export const compareStorePages = async (url1: string, url2: string, language: string): Promise<StoreComparisonResponse> => {
    const prompt = `Compare store pages ${url1} and ${url2}. Language: ${language}. Return JSON: {game1Name, game2Name, comparisonTable: [{dimension, game1Content, game2Content, winner, insight}], detailedAnalysis}.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }], responseMimeType: 'application/json' }
    });
    return parseJson(response.text) || {};
};

export const generatePushStrategy = async (gameName: string, genre: string, tone: string, language: string, url: string, emoji: boolean): Promise<PushStrategyResponse> => {
    const prompt = `Generate push notification strategy for ${gameName} (${genre}, ${url}). Tone: ${tone}. Language: ${language}. Emoji: ${emoji}. Return JSON array of categories, each with notifications list.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }], responseMimeType: 'application/json' }
    });
    return parseJson(response.text) || [];
};

export const generateLiveOpsContent = async (gameName: string, url: string, type: string, theme: string, language: string, text: boolean, chars: boolean): Promise<LiveOpsContent> => {
    const prompt = `Generate LiveOps content for ${gameName} (${url}). Type: ${type}. Theme: ${theme}. Language: ${language}. Include Image Prompt. Return JSON.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }], responseMimeType: 'application/json' }
    });
    return parseJson(response.text) || {};
};

export const generateHookedAnalysis = async (gameName: string, gameplay: string, url: string, audience: string, language: string): Promise<string> => {
    const prompt = `Analyze ${gameName} using Hooked Model. Gameplay: ${gameplay}. URL: ${url}. Audience: ${audience}. Language: ${language}. Format: Markdown.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateDeepAsoAnalysis = async (gameName: string, genre: string, url: string, competitors: string, market: string): Promise<string> => {
    const prompt = `Deep ASO Analysis for ${gameName} (${url}). Genre: ${genre}. Competitors: ${competitors}. Market: ${market}. Format: Markdown.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateMdaAnalysis = async (gameName: string, genre: string, gameplay: string, url: string, language: string): Promise<string> => {
    const prompt = `MDA Framework Analysis for ${gameName} (${url}). Gameplay: ${gameplay}. Language: ${language}. Format: Markdown.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateOctalysisAnalysis = async (gameName: string, gameplay: string, url: string, audience: string, language: string): Promise<string> => {
    const prompt = `Octalysis Analysis for ${gameName} (${url}). Gameplay: ${gameplay}. Audience: ${audience}. Language: ${language}. Format: Markdown.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateFoggBehaviorAnalysis = async (gameName: string, gameplay: string, url: string, audience: string, language: string): Promise<string> => {
    const prompt = `Fogg Behavior Model Analysis for ${gameName} (${url}). Gameplay: ${gameplay}. Audience: ${audience}. Language: ${language}. Format: Markdown.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateFlowAnalysis = async (gameName: string, gameplay: string, url: string, skill: string, language: string): Promise<string> => {
    const prompt = `Flow Theory Analysis for ${gameName} (${url}). Gameplay: ${gameplay}. Skill: ${skill}. Language: ${language}. Format: Markdown.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateFourElementsAnalysis = async (gameName: string, gameplay: string, url: string, genre: string, language: string): Promise<FourElementsResponse> => {
    const prompt = `Four Elements (Caillois) Analysis for ${gameName} (${url}). Gameplay: ${gameplay}. Language: ${language}. Return JSON: {scores: {agon, alea, mimicry, ilinx}, analysis}. Scores 0-10.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }], responseMimeType: 'application/json' }
    });
    return parseJson(response.text) || { scores: { agon: 0, alea: 0, mimicry: 0, ilinx: 0 }, analysis: "" };
};

export const generateSkinnerBoxAnalysis = async (gameName: string, gameplay: string, url: string, language: string): Promise<SkinnerBoxResponse> => {
    const prompt = `Skinner Box Analysis for ${gameName} (${url}). Gameplay: ${gameplay}. Language: ${language}. Return JSON: {schedules: {fixedRatio, variableRatio, fixedInterval, variableInterval}, analysis}.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }], responseMimeType: 'application/json' }
    });
    return parseJson(response.text) || { schedules: { fixedRatio: "", variableRatio: "", fixedInterval: "", variableInterval: "" }, analysis: "" };
};

export const generateDopamineLoopAnalysis = async (gameName: string, gameplay: string, url: string, mechanics: string, language: string): Promise<DopamineLoopResponse> => {
    const prompt = `Dopamine Loop Analysis for ${gameName} (${url}). Gameplay: ${gameplay}. Mechanics: ${mechanics}. Language: ${language}. Return JSON: {loop: {goal, reward, feedback}, analysis}.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }], responseMimeType: 'application/json' }
    });
    return parseJson(response.text) || { loop: { goal: "", reward: "", feedback: "" }, analysis: "" };
};

export const generateBartleAnalysis = async (gameName: string, gameplay: string, url: string, language: string): Promise<BartleResponse> => {
    const prompt = `Bartle Taxonomy Analysis for ${gameName} (${url}). Gameplay: ${gameplay}. Language: ${language}. Return JSON: {scores: {achievers, explorers, socializers, killers}, analysis}. Scores are percentages summing to 100.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }], responseMimeType: 'application/json' }
    });
    return parseJson(response.text) || { scores: { achievers: 0, explorers: 0, socializers: 0, killers: 0 }, analysis: "" };
};

export const generateNarrativeAnalysis = async (gameName: string, gameplay: string, url: string, genre: string, language: string): Promise<NarrativeResponse> => {
    const prompt = `Narrative Design Analysis for ${gameName} (${url}). Gameplay: ${gameplay}. Language: ${language}. Return JSON: {scores: {threeAct, nonLinear, circular, interactive}, analysis}. Scores 0-10.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }], responseMimeType: 'application/json' }
    });
    return parseJson(response.text) || { scores: { threeAct: 0, nonLinear: 0, circular: 0, interactive: 0 }, analysis: "" };
};

export const generateIaaPlan = async (gameName: string, genre: string, gameplay: string, region: string, language: string): Promise<string> => {
  const prompt = `Design a comprehensive IAA (In-App Advertising) Monetization Strategy for the mobile game "${gameName}".
  Genre: ${genre}
  Gameplay: ${gameplay}
  Target Market: ${region}
  Language: ${language}

  Format: Markdown.
  Include sections:
  1. Ad Formats Strategy (Rewarded Video, Interstitial, Banner, Native) - specific placement suggestions.
  2. Frequency & Pacing configuration (Capping, Cooldown).
  3. Ad Logic & Triggers (Where and when to show).
  4. Hybrid potential (How to transition users to IAP).
  5. eCPM Optimization Tips for the target market.
  6. User Experience Protection (Avoiding churn).`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
  });
  return response.text || "";
};

export const generateIapPlan = async (gameName: string, genre: string, gameplay: string, audience: string, language: string): Promise<string> => {
  const prompt = `Design a comprehensive IAP (In-App Purchase) Monetization Strategy for the mobile game "${gameName}".
  Genre: ${genre}
  Gameplay: ${gameplay}
  Target Audience: ${audience}
  Language: ${language}

  Format: Markdown.
  Include sections:
  1. Core Economy Loop (Currency sinks and sources).
  2. SKU Design (Starter Packs, Monthly Cards, Currencies).
  3. Pricing Strategy (Price points, psychological pricing).
  4. Battle Pass / Season Pass Design.
  5. Gacha / Loot Box Mechanics (if applicable).
  6. LiveOps Sales Strategy (Holiday events, flash sales).
  7. LTV Maximization Techniques.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
  });
  return response.text || "";
};

export const generateGooglePlayNews = async (language: string): Promise<string> => {
  const prompt = `Search for the latest news, policy updates, algorithm changes, and trending features for Google Play Store developers and marketers from the last 30 days. 
  Summarize the key points into a professional briefing in ${language}. 
  Include specific dates where possible. 
  Format as Markdown with headings like:
  - Policy Updates (政策更新)
  - Algorithm & Ranking (算法与排名)
  - New Features (新功能)
  - Market Trends (市场趋势)
  
  Ensure the information is up-to-date and relevant for mobile game professionals.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] }
  });
  return response.text || "";
};

export const generateAppStoreNews = async (language: string): Promise<string> => {
  const prompt = `Search for the latest news, policy updates, algorithm changes, and trending features for Apple App Store (iOS) developers and marketers from the last 30 days. 
  Summarize the key points into a professional briefing in ${language}. 
  Include specific dates where possible. 
  Format as Markdown with headings like:
  - Policy Updates (政策更新)
  - Algorithm & ASO (算法与ASO)
  - New Features (新功能)
  - Market Trends (市场趋势)
  
  Ensure the information is up-to-date and relevant for mobile game professionals.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] }
  });
  return response.text || "";
};

export const generateAdTechNews = async (platform: string, language: string): Promise<string> => {
  const prompt = `Search for the latest news, policy updates, algorithm changes, best practices, and trending features for ${platform} for mobile game marketers and developers from the last 30 days. 
  Summarize the key points into a professional briefing in ${language}. 
  Include specific dates where possible. 
  Format as Markdown with headings like:
  - Policy & Compliance (政策与合规)
  - Algorithm & Performance (算法与表现)
  - New Features & Tools (新功能与工具)
  - Industry Trends (行业趋势)
  
  Ensure the information is up-to-date and highly relevant for mobile game advertising and user acquisition.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] }
  });
  return response.text || "";
};
