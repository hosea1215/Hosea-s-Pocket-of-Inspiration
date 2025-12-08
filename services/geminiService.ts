
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { 
  GameDetails, 
  CpeResponse, 
  AdCreative, 
  CopyVariant, 
  CompetitorReport, 
  CompetitorMetrics, 
  TargetAudience, 
  MarketPerformance, 
  StoreComparisonResponse, 
  PushStrategyResponse, 
  LiveOpsContent, 
  FourElementsScore, 
  SkinnerBoxResponse, 
  DopamineLoopResponse, 
  BartleResponse, 
  NarrativeResponse, 
  MarketingCalendarData, 
  EconomicMetrics,
  CompetitorAnalysisResponse,
  FourElementsResponse
} from '../types';

const PRO_MODEL = 'gemini-3-pro-preview';
const FLASH_MODEL = 'gemini-2.5-flash';
const IMAGE_MODEL = 'gemini-2.5-flash-image';

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const describeImageForRecreation = async (base64Data: string, mimeType: string): Promise<string> => {
    const ai = getAi();
    // Using flash for fast vision analysis
    const prompt = `Describe this image in extreme detail for the purpose of recreating it with an AI image generator. 
    Focus on composition, lighting, art style, key subjects, colors, and perspective. 
    Do not output conversational text, just the detailed prompt description.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                    }
                },
                { text: prompt }
            ]
        }
    });
    return response.text || "";
};

export const generateAppStoreNews = async (language: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Summarize the latest Apple App Store Connect, Policy, ASA, and iOS Market news (last 30 days). Language: ${language}. Output Markdown. Use Google Search.`;
    
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateOmnichannelStrategy = async (details: GameDetails, gpUrl: string, iosUrl: string, language: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Generate a comprehensive Omnichannel Publishing & Growth Strategy for the game "${details.name}".
    
    Game Details:
    - Target Audience: ${details.targetAudience}
    - Quarterly Budget: $${details.budget}
    - Target Markets: ${details.market}
    - Promotion Purpose: ${details.promotionPurpose}
    - Goal: ${details.promotionGoal}
    - Google Play Link: ${gpUrl}
    - App Store Link: ${iosUrl}
    
    Language: ${language}.
    Output format: Markdown.
    
    Please include the following sections in detail:
    1. **Omnichannel Channel Mix (全渠道组合):**
       - App Stores (Organic & Paid)
       - Media Channels (Social Media, Influencers)
       - Pre-install Channels (OEMs)
       - Ad Networks (Video networks, SDK networks)
       - DSP (Programmatic buying)
       - Brand Advertising (Awareness campaigns)
       - Offerwalls (积分墙)
       - Rewarded Apps/Webs (网赚)
       - Budget Allocation split by these channels and phase.
    2. **Media Buying Strategy (买量策略):**
       - Targeting strategy per channel.
       - Bidding strategies.
    3. **App Store Optimization (ASO) Strategy (双端 ASO 策略):**
       - Specific keywords and metadata suggestions for Google Play.
       - Specific keywords and metadata suggestions for App Store (iOS).
       - Creative asset optimization (Icon, Screenshots, Video) differences for both stores.
    4. **Creative Strategy (素材策略):**
       - Key angles and hooks based on the target audience.
       - Format recommendations (Video, Static, Playable).
    5. **Phasing & Timeline (推广节奏):**
       - Launch/Scale-up timeline for the quarter.
    6. **KPI Benchmarks (核心指标):**
       - Expected CPI, ROAS, and Retention goals for the target markets.
    
    Use the provided store links to infer game genre and visual style context using Google Search.`;

    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateMarketingPlan = async (details: GameDetails, platform: string, language: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Generate a specific ${platform} User Acquisition Strategy for the game "${details.name}".
    
    Game Details:
    - Genre: ${details.genre}
    - Target Audience: ${details.targetAudience}
    - Budget: $${details.budget}
    - Market: ${details.market}
    - USP: ${details.usp}
    - Goal: ${details.promotionGoal}
    
    Language: ${language}.
    Output format: Markdown.
    
    Include:
    1. Campaign Structure (Campaigns, Ad Sets)
    2. Targeting Strategy (Interests, Lookalikes, Behaviors specific to ${platform})
    3. Budget Allocation & Bidding Strategy
    4. Creative Recommendations for ${platform}
    5. Expected KPIs`;

    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
    });
    return response.text || "";
};

export const generateAsoAnalysis = async (details: GameDetails, language: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Perform an ASO Keyword Analysis for the game "${details.name}".
    
    Genre: ${details.genre}
    Gameplay: ${details.gameplay}
    Market: ${details.market}
    
    Language: ${language}.
    Output format: Markdown.
    
    Provide:
    1. Short-tail Keywords (High Volume)
    2. Long-tail Keywords (High Conversion)
    3. Competitor Keywords
    4. Title & Subtitle Suggestions`;

    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
    });
    return response.text || "";
};

export const generateAdCopy = async (gameDetails: GameDetails, concept: string, cta: string, language: string): Promise<{headline: string, body: string, cta: string}> => {
    const ai = getAi();
    const prompt = `Write a Facebook Ad Copy for a mobile game.
    Game: ${gameDetails.name}
    Concept: ${concept}
    CTA: ${cta}
    Language: ${language}
    
    Return JSON format: { "headline": "...", "body": "...", "cta": "..." }`;

    const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    
    try {
        return JSON.parse(response.text || "{}");
    } catch (e) {
        return { headline: "", body: response.text || "", cta };
    }
};

export const generateAdImage = async (
    promptText: string, 
    aspectRatio: string, 
    style: string, 
    visualDetails: string, 
    language: string, 
    includeText: boolean, 
    includeCharacters: boolean, 
    model: string = 'gemini-2.5-flash-image'
): Promise<{imageUrl: string, prompt: string, promptZh: string}> => {
    const ai = getAi();
    
    const finalPrompt = `Mobile game ad creative. ${promptText}. Style: ${style}. Details: ${visualDetails}. ${includeText ? 'Include text overlays.' : 'No text overlays.'} ${includeCharacters ? 'Include characters.' : 'No characters.'}`;
    
    let imageUrl = '';

    if (model.includes('imagen')) {
        const response = await ai.models.generateImages({
            model: model,
            prompt: finalPrompt,
            config: {
                numberOfImages: 1,
                aspectRatio: aspectRatio === '9:16' ? '9:16' : (aspectRatio === '16:9' ? '16:9' : (aspectRatio === '4:5' ? '4:5' : '1:1')),
            }
        });
        const base64 = response.generatedImages[0].image.imageBytes;
        imageUrl = `data:image/png;base64,${base64}`;
    } else {
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [{ text: finalPrompt }]
            },
            config: {
               // imageConfig is not available for gemini-2.5-flash-image directly in the same way as imagen, 
               // but for gemini-3-pro-image-preview it uses generateContent.
               // gemini-2.5-flash-image output fits in 1:1 by default usually.
            }
        });
        
        // Find image part
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
            }
        }
    }

    return { imageUrl, prompt: finalPrompt, promptZh: "翻译提示词..." };
};

export const analyzeVisualDetailsFromUrl = async (gameName: string, storeUrl: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Analyze the visual style of the game "${gameName}" from its store URL: ${storeUrl}. Describe color palette, art style, and key visual elements. Use Google Search.`;
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateAppIcon = async (gameName: string, genre: string, style: string, elements: string): Promise<string> => {
    const ai = getAi();
    const prompt = `App Icon for mobile game "${gameName}" (${genre}). Style: ${style}. Elements: ${elements}. High quality, 512x512.`;
    
    // Using gemini-2.5-flash-image for icons as default
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] }
    });

    let imageUrl = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
        }
    }
    return imageUrl;
};

export const analyzeIconElementsFromUrl = async (gameName: string, storeUrl: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Analyze the app icon elements of "${gameName}" from ${storeUrl}. Suggest key visual elements for a new icon. Use Google Search.`;
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateFacebookAdCopies = async (productName: string, description: string, language: string, includeEmojis: boolean, storeUrl: string, copyStyle: string): Promise<CopyVariant[]> => {
    const ai = getAi();
    const prompt = `Generate 20 distinct Facebook Ad Copy variants for the game "${productName}".
    Description: ${description}
    Store URL: ${storeUrl}
    Target Language: ${language}
    Include Emojis: ${includeEmojis}
    Style: ${copyStyle}
    
    Return a JSON array of objects with "id" (string), "targetText" (the ad copy in target language), and "sourceText" (Simplified Chinese translation).`;

    const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    try {
        return JSON.parse(response.text || "[]");
    } catch (e) {
        return [];
    }
};

export const analyzeSellingPointsFromUrl = async (productName: string, storeUrl: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Analyze the selling points of "${productName}" from ${storeUrl}. Summarize into a concise description. Use Google Search.`;
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateCpeEvents = async (gameName: string, genre: string, gameplay: string, acquisitionGoal: string, singleCount: number, comboCount: number): Promise<CpeResponse> => {
    const ai = getAi();
    const prompt = `Generate a list of CPE (Cost Per Engagement) events for the game "${gameName}" (${genre}).
    Gameplay: ${gameplay}
    UA Goal: ${acquisitionGoal}
    
    Generate ${singleCount} Single Events and ${comboCount} Combo Events.
    Return JSON format with "singleEvents" and "comboEvents" arrays. Each event has: id, eventName, descriptionZh, descriptionEn, difficulty, estimatedTime, uaValueZh, uaValueEn, completionRate, timeLimit.`;

    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    try {
        return JSON.parse(response.text || "{\"singleEvents\":[], \"comboEvents\":[]}");
    } catch (e) {
        return { singleEvents: [], comboEvents: [] };
    }
};

export const analyzeGameplayFromUrl = async (gameName: string, storeUrl: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Analyze the gameplay mechanics of "${gameName}" from ${storeUrl}. Describe the core loop and features. Use Google Search.`;
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateAsmrPlan = async (gameName: string, genre: string, asmrType: string, storeUrl: string, language: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Create an ASMR Marketing Plan for "${gameName}" (${genre}). Focus on "${asmrType}". Store URL: ${storeUrl}. Language: ${language}. Use Google Search to understand the game audio style.`;
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateAbacrAnalysis = async (gameName: string, genre: string, gameplay: string, storeUrl: string, designPurpose: string, language: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Analyze "${gameName}" using the ABACR Level Design Loop model. Genre: ${genre}. Gameplay: ${gameplay}. Design Purpose: ${designPurpose}. Store URL: ${storeUrl}. Language: ${language}. Use Google Search.`;
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const expandDesignPurpose = async (designPurpose: string, gameName: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Expand the game design purpose: "${designPurpose}" for game "${gameName}". Make it more detailed and strategic.`;
    const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: prompt,
    });
    return response.text || "";
};

export const analyzeGameEconomics = async (metrics: EconomicMetrics, countries: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Analyze the provided game economic metrics for markets: ${countries}.
    Metrics: ${JSON.stringify(metrics)}
    Provide insights on LTV, Payback period, and ROAS optimization.`;
    
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
    });
    return response.text || "";
};

export const analyzeCompetitor = async (gameName: string, storeUrl: string): Promise<CompetitorAnalysisResponse> => {
    const ai = getAi();
    const prompt = `Analyze competitor game "${gameName}" from ${storeUrl}.
    Return JSON with fields:
    - metrics: { d1, d7, d30, avgSessionDuration, estimatedDau, topCountries (array) }
    - market: { financialTrends (array of {month, downloads, revenue}), rankingHistory (array of {month, freeRank, grossingRank}), genderDistribution (array of {name, value}), ageDistribution (array of {name, value}) }
    - audience: { countries (array), gender, age, interests (array), income, occupation (array), relationship }
    - report: { marketAnalysis, productAnalysis, coreGameplay, abacrAnalysis, hookedModel, emotionalAttachment, pushStrategy, asmrPotential, monetization, liveOps, branding, community, ipPotential, techStack, localization, gameEvents, userReviews, swot } (all strings)`;

    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { 
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json"
        }
    });

    try {
        return JSON.parse(response.text || "{}");
    } catch (e) {
        console.error("JSON parse error", e);
        throw new Error("Failed to parse analysis");
    }
};

export const extractGameNameFromUrl = async (storeUrl: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Extract the game name from this store URL: ${storeUrl}. Return only the name.`;
    const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: prompt,
    });
    return response.text?.trim() || "";
};

export const compareStorePages = async (url1: string, url2: string, language: string): Promise<StoreComparisonResponse> => {
    const ai = getAi();
    const prompt = `Compare two mobile game store pages. URL 1: ${url1}. URL 2: ${url2}. Language: ${language}.
    Return JSON: { "game1Name": "...", "game2Name": "...", "comparisonTable": [ { "dimension": "...", "game1Content": "...", "game2Content": "...", "winner": "Game 1"|"Game 2"|"Tie", "insight": "..." } ], "detailedAnalysis": "..." }`;

    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { 
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json" 
        }
    });

    try {
        return JSON.parse(response.text || "{}");
    } catch (e) {
        throw new Error("Failed to parse comparison");
    }
};

export const generatePushStrategy = async (gameName: string, genre: string, tone: string, language: string, storeUrl: string, includeEmojis: boolean, countPerCategory: number, includeTiming: boolean): Promise<PushStrategyResponse> => {
    const ai = getAi();
    const prompt = `Generate a Push Notification Strategy for "${gameName}" (${genre}).
    Tone: ${tone}. Language: ${language}. Store URL: ${storeUrl}. Emojis: ${includeEmojis}. Include Timing: ${includeTiming}.
    Generate ${countPerCategory} notifications per category.
    Categories: Onboarding, Retention, monetization, Win-back.
    Return JSON array of sections: [{ "category": "...", "notifications": [{ "title": "...", "body": "...", "emoji": "...", "translation": "...", "timing": "..." }] }]`;

    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    try {
        return JSON.parse(response.text || "[]");
    } catch (e) {
        return [];
    }
};

export const generateLiveOpsContent = async (gameName: string, storeUrl: string, eventType: string, eventTheme: string, language: string, includeText: boolean, includeCharacters: boolean): Promise<LiveOpsContent> => {
    const ai = getAi();
    const prompt = `Generate Google Play LiveOps content for "${gameName}". Event Type: ${eventType}. Theme: ${eventTheme}. Language: ${language}.
    Return JSON: { "eventName": "...", "shortDescription": "...", "longDescription": "...", "imagePrompt": "...", "translation": { "eventName": "...", "shortDescription": "...", "longDescription": "..." } }`;

    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    try {
        return JSON.parse(response.text || "{}");
    } catch (e) {
        return { eventName: "", shortDescription: "", longDescription: "", imagePrompt: "" };
    }
};

export const generateHookedAnalysis = async (gameName: string, gameplay: string, storeUrl: string, targetAudience: string, language: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Analyze "${gameName}" using the Hooked Model. Gameplay: ${gameplay}. Audience: ${targetAudience}. Store: ${storeUrl}. Language: ${language}. Output Markdown. Use Google Search.`;
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateDeepAsoAnalysis = async (gameName: string, genre: string, storeUrl: string, competitors: string, market: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Perform Deep ASO Analysis for "${gameName}" (${genre}). Competitors: ${competitors}. Market: ${market}. Store: ${storeUrl}. Output Markdown. Use Google Search.`;
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateMdaAnalysis = async (gameName: string, genre: string, gameplay: string, storeUrl: string, language: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Analyze "${gameName}" using MDA Framework. Genre: ${genre}. Gameplay: ${gameplay}. Store: ${storeUrl}. Language: ${language}. Output Markdown. Use Google Search.`;
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateOctalysisAnalysis = async (gameName: string, gameplay: string, storeUrl: string, targetAudience: string, language: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Analyze "${gameName}" using Octalysis Framework. Gameplay: ${gameplay}. Audience: ${targetAudience}. Store: ${storeUrl}. Language: ${language}. Output Markdown. Use Google Search.`;
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateFoggBehaviorAnalysis = async (gameName: string, gameplay: string, storeUrl: string, targetAudience: string, language: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Analyze "${gameName}" using Fogg Behavior Model. Gameplay: ${gameplay}. Audience: ${targetAudience}. Store: ${storeUrl}. Language: ${language}. Output Markdown. Use Google Search.`;
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateFlowAnalysis = async (gameName: string, gameplay: string, storeUrl: string, playerSkill: string, language: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Analyze "${gameName}" using Flow Theory. Gameplay: ${gameplay}. Skill: ${playerSkill}. Store: ${storeUrl}. Language: ${language}. Output Markdown. Use Google Search.`;
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateFourElementsAnalysis = async (gameName: string, gameplay: string, storeUrl: string, genre: string, language: string): Promise<FourElementsResponse> => {
    const ai = getAi();
    const prompt = `Analyze "${gameName}" using Caillois' Four Elements (Agon, Alea, Mimicry, Ilinx). Gameplay: ${gameplay}. Store: ${storeUrl}. Language: ${language}.
    Return JSON: { "scores": { "agon": number (0-10), "alea": number, "mimicry": number, "ilinx": number }, "analysis": string (markdown) }. Use Google Search.`;
    
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { 
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json"
        }
    });

    try {
        return JSON.parse(response.text || "{}");
    } catch (e) {
        throw new Error("Failed to parse analysis");
    }
};

export const generateSkinnerBoxAnalysis = async (gameName: string, gameplay: string, storeUrl: string, language: string): Promise<SkinnerBoxResponse> => {
    const ai = getAi();
    const prompt = `Analyze "${gameName}" using Skinner Box theory. Gameplay: ${gameplay}. Store: ${storeUrl}. Language: ${language}.
    Return JSON: { "schedules": { "fixedRatio": "...", "variableRatio": "...", "fixedInterval": "...", "variableInterval": "..." }, "analysis": "..." (markdown) }. Use Google Search.`;
    
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { 
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json"
        }
    });

    try {
        return JSON.parse(response.text || "{}");
    } catch (e) {
        throw new Error("Failed to parse analysis");
    }
};

export const generateDopamineLoopAnalysis = async (gameName: string, gameplay: string, storeUrl: string, rewardMechanics: string, language: string): Promise<DopamineLoopResponse> => {
    const ai = getAi();
    const prompt = `Analyze Dopamine Loops in "${gameName}". Gameplay: ${gameplay}. Rewards: ${rewardMechanics}. Store: ${storeUrl}. Language: ${language}.
    Return JSON: { "loop": { "goal": "...", "reward": "...", "feedback": "..." }, "analysis": "..." (markdown) }. Use Google Search.`;
    
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { 
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json"
        }
    });

    try {
        return JSON.parse(response.text || "{}");
    } catch (e) {
        throw new Error("Failed to parse analysis");
    }
};

export const generateBartleAnalysis = async (gameName: string, gameplay: string, storeUrl: string, language: string): Promise<BartleResponse> => {
    const ai = getAi();
    const prompt = `Analyze "${gameName}" using Bartle Taxonomy. Gameplay: ${gameplay}. Store: ${storeUrl}. Language: ${language}.
    Return JSON: { "scores": { "achievers": number (%), "explorers": number, "socializers": number, "killers": number }, "analysis": "..." (markdown) }. Use Google Search.`;
    
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { 
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json"
        }
    });

    try {
        return JSON.parse(response.text || "{}");
    } catch (e) {
        throw new Error("Failed to parse analysis");
    }
};

export const generateNarrativeAnalysis = async (gameName: string, gameplay: string, storeUrl: string, genre: string, language: string): Promise<NarrativeResponse> => {
    const ai = getAi();
    const prompt = `Analyze Narrative Design of "${gameName}". Gameplay: ${gameplay}. Store: ${storeUrl}. Language: ${language}.
    Return JSON: { "scores": { "threeAct": number (0-10), "nonLinear": number, "circular": number, "interactive": number }, "analysis": "..." (markdown) }. Use Google Search.`;
    
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { 
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json"
        }
    });

    try {
        return JSON.parse(response.text || "{}");
    } catch (e) {
        throw new Error("Failed to parse analysis");
    }
};

export const generateIaaPlan = async (gameName: string, genre: string, gameplay: string, targetMarket: string, language: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Create IAA Monetization Plan for "${gameName}" (${genre}). Gameplay: ${gameplay}. Market: ${targetMarket}. Language: ${language}. Output Markdown.`;
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
    });
    return response.text || "";
};

export const generateIapPlan = async (gameName: string, genre: string, gameplay: string, targetAudience: string, language: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Create IAP Monetization Plan for "${gameName}" (${genre}). Gameplay: ${gameplay}. Audience: ${targetAudience}. Language: ${language}. Output Markdown.`;
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
    });
    return response.text || "";
};

export const generateGooglePlayNews = async (language: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Summarize latest Google Play Console, Policy, and Market news (last 30 days). Language: ${language}. Output Markdown. Use Google Search.`;
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateAdTechNews = async (platform: string, language: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Summarize latest AdTech news for ${platform} (last 30 days). Language: ${language}. Output Markdown. Use Google Search.`;
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};

export const generateMarketingCalendar = async (countriesStr: string, year: number, quarter: string, language: string): Promise<{markdown: string, chartData: MarketingCalendarData[]}> => {
    const ai = getAi();
    const prompt = `Create Marketing Calendar for ${countriesStr}. Period: ${year} ${quarter}. Language: ${language}.
    Return JSON: { "markdown": "...", "chartData": [{ "month": "...", "intensity": number (0-100), "keyEvent": "...", "count": number, "historicalRoas": number, "historicalCtr": number, "pastCampaignInsight": "..." }] }. Use Google Search for events and historical data estimation.`;
    
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { 
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json"
        }
    });

    try {
        const json = JSON.parse(response.text || "{}");
        return { markdown: json.markdown || "", chartData: json.chartData || [] };
    } catch (e) {
        return { markdown: response.text || "", chartData: [] };
    }
};

export const generateAdBiddingStrategy = async (gameName: string, genre: string, platform: string, market: string, language: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Create Ad Bidding Strategy (Waterfall/Hybrid) for "${gameName}" (${genre}) on ${platform} in ${market}. Language: ${language}. Output Markdown.`;
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
    });
    return response.text || "";
};

export const generateIapPricingStrategy = async (gameName: string, genre: string, region: string, language: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Create IAP Pricing Strategy for "${gameName}" (${genre}) in ${region}. Language: ${language}. Output Markdown.`;
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
    });
    return response.text || "";
};

export const generateAiNews = async (timeRange: string, language: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Summarize latest AI news (Gemini, ChatGPT, Claude, etc.) for ${timeRange}. Language: ${language}. Output Markdown. Use Google Search.`;
    const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
};
