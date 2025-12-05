
import { GoogleGenAI } from "@google/genai";
import { 
  GameDetails, AdCreative, CopyVariant, CpeEvent, CpeResponse, 
  EconomicMetrics, CompetitorAnalysisResponse, StoreComparisonResponse, 
  PushStrategyResponse, LiveOpsContent, AppIcon, CompetitorMetrics, MarketPerformance, TargetAudience, CompetitorReport,
  FourElementsResponse, SkinnerBoxResponse, DopamineLoopResponse, BartleResponse, NarrativeResponse
} from "../types";

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseJSON = (text: string) => {
  try {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON", e);
    return null;
  }
};

// --- Game Design Analysis Frameworks ---

export const generateMdaAnalysis = async (
  gameName: string,
  genre: string,
  gameplay: string,
  storeUrl: string
): Promise<string> => {
  const prompt = `
    Act as a Senior Game Designer. Analyze the mobile game '${gameName}' using the MDA Framework (Mechanics-Dynamics-Aesthetics).
    Game Name: ${gameName}
    Genre: ${genre}
    Store URL: ${storeUrl}
    Gameplay: ${gameplay}

    Provide the analysis in Simplified Chinese (Markdown).
    1. Mechanics: Rules, data, algorithms.
    2. Dynamics: Run-time behavior, player strategies.
    3. Aesthetics: Emotional response (e.g., Sensation, Fantasy, Challenge).
  `;

  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "MDA 分析生成失败。";
  } catch (error) {
    console.error("Error generating MDA analysis:", error);
    return "发生错误，无法生成分析报告。";
  }
};

export const generateOctalysisAnalysis = async (
  gameName: string,
  gameplay: string,
  storeUrl: string,
  targetAudience: string
): Promise<string> => {
  const prompt = `
    Analyze '${gameName}' using Yu-kai Chou's Octalysis Framework.
    Gameplay: ${gameplay}
    Target Audience: ${targetAudience}
    Store URL: ${storeUrl}

    Provide analysis in Simplified Chinese (Markdown) covering the 8 Core Drives.
  `;

  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "八角行为模型分析生成失败。";
  } catch (error) {
    console.error("Error generating Octalysis analysis:", error);
    return "发生错误，无法生成分析报告。";
  }
};

export const generateFoggBehaviorAnalysis = async (
  gameName: string,
  gameplay: string,
  storeUrl: string,
  targetAudience: string
): Promise<string> => {
  const prompt = `
    Analyze '${gameName}' using BJ Fogg's Behavior Model (B=MAP).
    Gameplay: ${gameplay}
    Target Audience: ${targetAudience}
    Store URL: ${storeUrl}

    Provide analysis in Simplified Chinese (Markdown) covering Motivation, Ability, and Prompts.
  `;

  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "Fogg 行为模型分析生成失败。";
  } catch (error) {
    console.error("Error generating Fogg analysis:", error);
    return "发生错误，无法生成分析报告。";
  }
};

export const generateFlowAnalysis = async (
  gameName: string,
  gameplay: string,
  storeUrl: string,
  playerSkill: string
): Promise<string> => {
  const prompt = `
    Analyze '${gameName}' using Flow Theory (Csikszentmihalyi).
    Gameplay: ${gameplay}
    Player Skill Context: ${playerSkill}
    Store URL: ${storeUrl}

    Provide analysis in Simplified Chinese (Markdown) focusing on Challenge-Skill balance, goals, and feedback.
  `;

  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "心流理论分析生成失败。";
  } catch (error) {
    console.error("Error generating Flow analysis:", error);
    return "发生错误，无法生成分析报告。";
  }
};

export const generateFourElementsAnalysis = async (
  gameName: string,
  gameplay: string,
  storeUrl: string,
  genre: string
): Promise<FourElementsResponse> => {
  const prompt = `
    Analyze '${gameName}' using Roger Caillois' Four Elements of Play: Agon (Competition), Alea (Chance), Mimicry (Simulation), Ilinx (Vertigo).
    Gameplay: ${gameplay}
    Genre: ${genre}
    Store URL: ${storeUrl}

    Return JSON:
    {
      "scores": { "agon": 0-10, "alea": 0-10, "mimicry": 0-10, "ilinx": 0-10 },
      "analysis": "Markdown analysis in Simplified Chinese"
    }
  `;

  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: 'application/json',
        tools: [{ googleSearch: {} }]
      }
    });
    const result = parseJSON(response.text || "{}");
    return {
        scores: result?.scores || { agon: 0, alea: 0, mimicry: 0, ilinx: 0 },
        analysis: result?.analysis || "生成分析失败。"
    };
  } catch (error) {
    console.error("Error generating Four Elements analysis:", error);
    return {
        scores: { agon: 0, alea: 0, mimicry: 0, ilinx: 0 },
        analysis: "发生错误，无法生成分析报告。"
    };
  }
};

export const generateSkinnerBoxAnalysis = async (
  gameName: string,
  gameplay: string,
  storeUrl: string
): Promise<SkinnerBoxResponse> => {
  const prompt = `
    Analyze '${gameName}' using Skinner Box principles (Operant Conditioning).
    Gameplay: ${gameplay}
    Store URL: ${storeUrl}

    Return JSON:
    {
      "schedules": { "fixedRatio": "string", "variableRatio": "string", "fixedInterval": "string", "variableInterval": "string" },
      "analysis": "Markdown analysis in Simplified Chinese"
    }
  `;

  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: 'application/json',
        tools: [{ googleSearch: {} }]
      }
    });
    const result = parseJSON(response.text || "{}");
    return {
        schedules: result?.schedules || { fixedRatio: '', variableRatio: '', fixedInterval: '', variableInterval: '' },
        analysis: result?.analysis || "分析生成失败。"
    };
  } catch (error) {
    console.error("Error generating Skinner Box analysis:", error);
    return {
        schedules: { fixedRatio: '', variableRatio: '', fixedInterval: '', variableInterval: '' },
        analysis: "发生错误，无法生成分析报告。"
    };
  }
};

export const generateDopamineLoopAnalysis = async (
  gameName: string,
  gameplay: string,
  storeUrl: string,
  rewardMechanics: string
): Promise<DopamineLoopResponse> => {
  const prompt = `
    Analyze '${gameName}' using the Dopamine Loop framework.
    Gameplay: ${gameplay}
    Rewards: ${rewardMechanics}
    Store URL: ${storeUrl}

    Return JSON:
    {
      "loop": { "goal": "string", "reward": "string", "feedback": "string" },
      "analysis": "Markdown analysis in Simplified Chinese"
    }
  `;

  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: 'application/json',
        tools: [{ googleSearch: {} }]
      }
    });
    const result = parseJSON(response.text || "{}");
    return {
        loop: result?.loop || { goal: '', reward: '', feedback: '' },
        analysis: result?.analysis || "分析生成失败。"
    };
  } catch (error) {
    console.error("Error generating Dopamine Loop analysis:", error);
    return {
        loop: { goal: '', reward: '', feedback: '' },
        analysis: "发生错误，无法生成分析报告。"
    };
  }
};

export const generateBartleAnalysis = async (
  gameName: string,
  gameplay: string,
  storeUrl: string
): Promise<BartleResponse> => {
  const prompt = `
    Analyze '${gameName}' using Bartle's Taxonomy of Player Types.
    Gameplay: ${gameplay}
    Store URL: ${storeUrl}

    Return JSON:
    {
      "scores": { "achievers": number, "explorers": number, "socializers": number, "killers": number },
      "analysis": "Markdown analysis in Simplified Chinese"
    }
  `;

  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: 'application/json',
        tools: [{ googleSearch: {} }]
      }
    });
    const result = parseJSON(response.text || "{}");
    return {
        scores: result?.scores || { achievers: 0, explorers: 0, socializers: 0, killers: 0 },
        analysis: result?.analysis || "分析生成失败。"
    };
  } catch (error) {
    console.error("Error generating Bartle analysis:", error);
    return {
        scores: { achievers: 0, explorers: 0, socializers: 0, killers: 0 },
        analysis: "发生错误，无法生成分析报告。"
    };
  }
};

export const generateNarrativeAnalysis = async (
  gameName: string,
  gameplay: string,
  storeUrl: string,
  genre: string
): Promise<NarrativeResponse> => {
  const prompt = `
    Act as a Senior Game Narrative Designer.
    Analyze the mobile game '${gameName}' using **Narrative Design Theory**.
    Determine the suitability and implementation potential of four common narrative structures for this game:

    1. **Three-Act Structure (三幕结构)**: Linear progression (Setup -> Confrontation -> Resolution).
    2. **Non-linear Narrative (非线性叙事)**: Branching paths, multiple endings.
    3. **Circular Narrative (循环叙事)**: Loop-based storytelling (Roguelike/Lite style).
    4. **Interactive Narrative (互动叙事)**: Heavy emphasis on player choice and consequence.

    Game Name: ${gameName}
    Genre: ${genre}
    Store URL: ${storeUrl}
    Gameplay: ${gameplay}

    **Return JSON format**:
    {
      "scores": {
        "threeAct": number (0-10 suitability),
        "nonLinear": number (0-10 suitability),
        "circular": number (0-10 suitability),
        "interactive": number (0-10 suitability)
      },
      "analysis": "Markdown string in Simplified Chinese. detailed analysis of how to implement the best-fitting structures or improve existing narrative elements to enhance emotional resonance and immersion."
    }
  `;

  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: 'application/json',
        tools: [{ googleSearch: {} }]
      }
    });
    const result = parseJSON(response.text || "{}");
    return {
        scores: result?.scores || { threeAct: 0, nonLinear: 0, circular: 0, interactive: 0 },
        analysis: result?.analysis || "生成分析失败。"
    };
  } catch (error) {
    console.error("Error generating Narrative analysis:", error);
    return {
        scores: { threeAct: 0, nonLinear: 0, circular: 0, interactive: 0 },
        analysis: "发生错误，无法生成分析报告。"
    };
  }
};

export const generateAbacrAnalysis = async (
  gameName: string,
  genre: string,
  gameplay: string,
  storeUrl: string,
  designPurpose: string
): Promise<string> => {
  const prompt = `
    Analyze '${gameName}' using the ABACR Level Design Pattern (A-B-A-C-R).
    Genre: ${genre}
    Gameplay: ${gameplay}
    Store URL: ${storeUrl}
    Design Purpose: ${designPurpose}

    Provide analysis in Simplified Chinese (Markdown) explaining how the game uses:
    A (Intro/Base), B (Variation), A (Reinforcement), C (Complex Challenge), R (Reward/Rest).
  `;

  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "ABACR 分析生成失败。";
  } catch (error) {
    console.error("Error generating ABACR analysis:", error);
    return "发生错误，无法生成分析报告。";
  }
};

export const generateHookedAnalysis = async (
  gameName: string,
  gameplay: string,
  storeUrl: string,
  targetAudience: string
): Promise<string> => {
  const prompt = `
    Analyze '${gameName}' using Nir Eyal's Hooked Model.
    Gameplay: ${gameplay}
    Store URL: ${storeUrl}
    Audience: ${targetAudience}

    Provide analysis in Simplified Chinese (Markdown) covering: Trigger, Action, Variable Reward, Investment.
  `;

  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "Hooked 模型分析生成失败。";
  } catch (error) {
    console.error("Error generating Hooked analysis:", error);
    return "发生错误，无法生成分析报告。";
  }
};

// --- Economics & Marketing ---

export const analyzeGameEconomics = async (metrics: EconomicMetrics): Promise<string> => {
  const prompt = `
    Act as a Game Economy Designer. Analyze the following LTV metrics:
    CPI: $${metrics.cpi}
    Retention: D1 ${metrics.retentionD1}%, D7 ${metrics.retentionD7}%, D30 ${metrics.retentionD28}%, D90 ${metrics.retentionD90}%
    ARPDAU: $${metrics.arpdau}
    Organic Ratio: ${metrics.organicRatio}%
    
    Provide a diagnosis of the game's economic health in Simplified Chinese.
  `;

  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "无法生成经济模型分析。";
  } catch (error) {
    console.error("Error analyzing economics:", error);
    return "分析失败。";
  }
};

export const generateMarketingPlan = async (details: GameDetails): Promise<string> => {
  const prompt = `
    Act as a Senior UA Manager. Create a Facebook User Acquisition Strategy for:
    Game: ${details.name}
    Genre: ${details.genre}
    Audience: ${details.targetAudience}
    Budget: $${details.budget}
    Market: ${details.market}
    USP: ${details.usp}
    Goal: ${details.promotionGoal}

    Output Markdown in Simplified Chinese covering: Campaign Structure, Creative Strategy, Audience Targeting, and Budget Allocation.
  `;
  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "策略生成失败";
  } catch (e) {
    console.error(e);
    return "生成错误";
  }
};

export const generateAsoAnalysis = async (details: GameDetails): Promise<string> => {
  const prompt = `
    Act as an ASO Expert. Provide a Keyword Analysis and Optimization Strategy for:
    Game: ${details.name}
    Genre: ${details.genre}
    Gameplay: ${details.gameplay}
    Store URL: ${details.storeUrl}
    
    Output Markdown in Simplified Chinese.
  `;
  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "ASO 分析生成失败";
  } catch (e) {
    console.error(e);
    return "生成错误";
  }
};

export const generateDeepAsoAnalysis = async (
  gameName: string,
  genre: string,
  storeUrl: string,
  competitors: string,
  market: string
): Promise<string> => {
  const prompt = `
    Act as an ASO Expert. Perform a deep keyword mining and metadata optimization analysis.
    Game: ${gameName} (${genre})
    URL: ${storeUrl}
    Competitors: ${competitors}
    Target Market: ${market}

    Output Markdown in Simplified Chinese covering: High volume keywords, long-tail opportunities, Title/Subtitle recommendations.
  `;
  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "ASO 深度分析生成失败";
  } catch (e) {
    console.error(e);
    return "生成错误";
  }
};

// --- Creative & Assets ---

export const generateAdCopy = async (
  gameDetails: any,
  concept: string,
  cta: string,
  language: string
): Promise<{ headline: string, body: string, cta: string }> => {
  const prompt = `
    Write a Facebook Ad Copy for mobile game '${gameDetails.name}'.
    Concept: ${concept}
    Language: ${language}
    CTA: ${cta}

    Return JSON: { "headline": "string", "body": "string", "cta": "string" }
  `;
  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    const json = parseJSON(response.text || "{}");
    return {
      headline: json?.headline || "Play Now!",
      body: json?.body || "Best game ever.",
      cta: json?.cta || cta
    };
  } catch (e) {
    console.error(e);
    return { headline: "", body: "Error generating copy", cta: cta };
  }
};

export const generateAdImage = async (
  promptText: string,
  aspectRatio: string,
  style: string,
  visualDetails: string,
  language: string,
  includeText: boolean = false,
  includeCharacters: boolean = true,
  model: string = 'gemini-2.5-flash-image'
): Promise<{ imageUrl: string, prompt: string, promptZh: string }> => {
  
  const ratioMap: Record<string, string> = {
    '1:1': '1080x1080 (Square)',
    '4:5': '1080x1350 (Vertical Feed)',
    '9:16': '1080x1920 (Story/Reels)',
    '1.91:1': '1200x628 (Link Ad)'
  };
  const dimensions = ratioMap[aspectRatio] || aspectRatio;

  // 1. Generate the optimized English prompt and Chinese translation using a text model
  const refinementPrompt = `
    You are an expert AI Art Prompter. 
    Create a detailed image generation prompt based on the following requirements:
    
    Context/Concept: ${promptText}
    Visual Style: ${style}
    Visual Details: ${visualDetails}
    Target Aspect Ratio: ${aspectRatio}
    Target Dimensions: ${dimensions}
    Target Language for Text in Image (if any): ${language}
    Include Text in Image: ${includeText ? 'YES' : 'NO'}
    Include Characters/Animals: ${includeCharacters ? 'YES' : 'NO'}

    Please output a JSON object with the following fields:
    - "englishPrompt": A detailed, high-quality prompt in English optimized for an AI image generator (like Midjourney or Imagen). Include keywords for the style (${style}) and mention the aspect ratio/dimensions (${dimensions}).
    - "chineseTranslation": A direct translation of the English prompt into Simplified Chinese.
  `;

  let englishPrompt = "";
  let chineseTranslation = "";

  try {
    const textResponse = await getAiClient().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: refinementPrompt,
      config: { responseMimeType: 'application/json' }
    });
    
    const json = parseJSON(textResponse.text || "{}");
    englishPrompt = json?.englishPrompt || `Mobile game ad creative. Style: ${style}. ${visualDetails}. ${promptText}`;
    chineseTranslation = json?.chineseTranslation || "无法生成中文翻译";

  } catch (e) {
    console.error("Prompt refinement failed", e);
    // Fallback
    englishPrompt = `Mobile game ad creative. Style: ${style}. Details: ${visualDetails}. Context: ${promptText}.`;
    chineseTranslation = "Prompt generation failed.";
  }

  // 2. Generate Image using the refined English prompt
  let validRatio = '1:1';
  if (aspectRatio === '9:16') validRatio = '9:16';
  else if (aspectRatio === '16:9' || aspectRatio === '1.91:1') validRatio = '16:9';
  else if (aspectRatio === '4:5' || aspectRatio === '3:4') validRatio = '3:4';
  else if (aspectRatio === '4:3') validRatio = '4:3';

  try {
    let imageUrl = "";
    
    // Check if using Imagen
    if (model.includes('imagen')) {
       const response = await getAiClient().models.generateImages({
          model: model,
          prompt: englishPrompt,
          config: {
            numberOfImages: 1,
            aspectRatio: validRatio,
            outputMimeType: 'image/jpeg'
          }
       });
       if (response.generatedImages?.[0]?.image?.imageBytes) {
           imageUrl = `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
       }
    } else {
       // Default Gemini content generation
       const response = await getAiClient().models.generateContent({
          model: model,
          contents: { parts: [{ text: englishPrompt }] },
          config: {
            imageConfig: {
                aspectRatio: validRatio,
            }
          }
       });
       for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData && part.inlineData.data) {
              imageUrl = `data:image/png;base64,${part.inlineData.data}`;
              break;
          }
       }
    }
    return { imageUrl, prompt: englishPrompt, promptZh: chineseTranslation };
  } catch (e) {
    console.error(e);
    return { imageUrl: "", prompt: englishPrompt, promptZh: chineseTranslation };
  }
};

export const generateAppIcon = async (
  gameName: string,
  genre: string,
  style: string,
  elements: string
): Promise<string> => {
  const prompt = `
    App Icon for mobile game '${gameName}' (${genre}).
    Style: ${style}.
    Visual Elements: ${elements}.
    High quality, icon design, 512x512.
  `;
  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: '1:1', imageSize: '1K' }
      }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
       if (part.inlineData && part.inlineData.data) {
           return `data:image/png;base64,${part.inlineData.data}`;
       }
    }
    return "";
  } catch (e) {
    console.error(e);
    return "";
  }
};

export const generateFacebookAdCopies = async (
  productName: string,
  description: string,
  language: string,
  includeEmojis: boolean,
  storeUrl: string,
  style: string
): Promise<CopyVariant[]> => {
  const prompt = `
    Generate 6 distinct Facebook Ad Copies for '${productName}'.
    Description: ${description}
    Language: ${language}
    Style: ${style}
    Include Emojis: ${includeEmojis}
    Store URL: ${storeUrl}

    Return JSON array of objects: [{ "id": "1", "targetText": "Ad copy in target language", "sourceText": "Simplified Chinese translation" }]
  `;
  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    const json = parseJSON(response.text || "[]");
    return Array.isArray(json) ? json : [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const generatePushStrategy = async (
  gameName: string,
  genre: string,
  tone: string,
  language: string,
  storeUrl: string,
  includeEmojis: boolean
): Promise<PushStrategyResponse> => {
  const prompt = `
    Create a Push Notification Strategy for '${gameName}' (${genre}).
    Tone: ${tone}
    Language: ${language}
    Emojis: ${includeEmojis}
    Store URL: ${storeUrl}

    Return JSON structure (PushStrategyResponse):
    [
      {
        "category": "string (e.g. Retention)",
        "notifications": [
           { "title": "string", "body": "string", "emoji": "string", "translation": "Simplified Chinese", "timing": "string" }
        ]
      }
    ]
  `;
  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: 'application/json',
        tools: [{ googleSearch: {} }]
      }
    });
    const json = parseJSON(response.text || "[]");
    return Array.isArray(json) ? json : [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const generateLiveOpsContent = async (
  gameName: string,
  storeUrl: string,
  eventType: string,
  eventTheme: string,
  language: string,
  includeText: boolean,
  includeCharacters: boolean
): Promise<LiveOpsContent> => {
  const prompt = `
    Generate Google Play LiveOps (Promotional Content) material for '${gameName}'.
    Event Type: ${eventType}
    Theme: ${eventTheme}
    Language: ${language}
    
    Return JSON (LiveOpsContent):
    {
      "eventName": "Max 80 chars",
      "shortDescription": "Max 80 chars",
      "longDescription": "Full detail",
      "imagePrompt": "Prompt to generate a 16:9 feature graphic. Include characters: ${includeCharacters}. Include text: ${includeText}.",
      "translation": { "eventName": "Chinese", "shortDescription": "Chinese", "longDescription": "Chinese" }
    }
  `;
  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: 'application/json',
        tools: [{ googleSearch: {} }]
      }
    });
    return parseJSON(response.text || "{}");
  } catch (e) {
    console.error(e);
    return { eventName: "Error", shortDescription: "", longDescription: "", imagePrompt: "" };
  }
};

// --- Analysis & Research ---

export const analyzeCompetitor = async (
  gameName: string,
  storeUrl: string
): Promise<CompetitorAnalysisResponse> => {
  const prompt = `
    Analyze competitor game '${gameName}' from Store URL: ${storeUrl}.
    
    Return JSON (CompetitorAnalysisResponse) containing:
    metrics (d1, d7, d30, avgSessionDuration, estimatedDau, topCountries),
    market (financialTrends, rankingHistory, genderDistribution, ageDistribution),
    audience (TargetAudience fields),
    report (CompetitorReport fields: marketAnalysis, productAnalysis, coreGameplay, abacrAnalysis, etc.)
  `;
  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: 'application/json',
        tools: [{ googleSearch: {} }]
      }
    });
    const result = parseJSON(response.text || "{}");
    return {
       metrics: result?.metrics || {},
       market: result?.market || {},
       audience: result?.audience || {},
       report: result?.report || {}
    } as CompetitorAnalysisResponse;
  } catch (e) {
    console.error(e);
    return {} as CompetitorAnalysisResponse;
  }
};

export const compareStorePages = async (
  url1: string,
  url2: string,
  language: string
): Promise<StoreComparisonResponse> => {
  const prompt = `
    Compare two mobile game store pages.
    Game 1: ${url1}
    Game 2: ${url2}
    Output Language: ${language}

    Return JSON (StoreComparisonResponse):
    {
      "game1Name": "string",
      "game2Name": "string",
      "comparisonTable": [ { "dimension": "string", "game1Content": "string", "game2Content": "string", "winner": "Game 1 | Game 2 | Tie", "insight": "string" } ],
      "detailedAnalysis": "Markdown string"
    }
  `;
  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: 'application/json',
        tools: [{ googleSearch: {} }]
      }
    });
    return parseJSON(response.text || "{}");
  } catch (e) {
    console.error(e);
    return { game1Name: "", game2Name: "", comparisonTable: [], detailedAnalysis: "Error" };
  }
};

export const generateCpeEvents = async (
  gameName: string,
  genre: string,
  gameplay: string,
  acquisitionGoal: string
): Promise<CpeResponse> => {
  const prompt = `
    Design CPE (Cost Per Engagement) events for UA campaigns.
    Game: ${gameName} (${genre})
    Gameplay: ${gameplay}
    Goal: ${acquisitionGoal}

    Return JSON (CpeResponse): { "singleEvents": [CpeEvent], "comboEvents": [CpeEvent] }
  `;
  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return parseJSON(response.text || "{ \"singleEvents\": [], \"comboEvents\": [] }");
  } catch (e) {
    console.error(e);
    return { singleEvents: [], comboEvents: [] };
  }
};

export const generateAsmrPlan = async (
  gameName: string,
  genre: string,
  asmrType: string,
  storeUrl: string
): Promise<string> => {
  const prompt = `
    Create an ASMR Marketing Plan for mobile game '${gameName}'.
    Genre: ${genre}
    ASMR Type: ${asmrType}
    Store URL: ${storeUrl}

    Output Markdown in Simplified Chinese.
  `;
  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "ASMR 方案生成失败";
  } catch (e) {
    console.error(e);
    return "生成错误";
  }
};

// --- Utils & Extractors ---

export const analyzeGameplayFromUrl = async (gameName: string, storeUrl: string): Promise<string> => {
  const prompt = `Describe the core gameplay loop and mechanics of '${gameName}' based on its store page: ${storeUrl}. Output in Simplified Chinese.`;
  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
  } catch (e) { return ""; }
};

export const analyzeVisualDetailsFromUrl = async (gameName: string, storeUrl: string): Promise<string> => {
  const prompt = `Describe the visual style, color palette, and key art elements of '${gameName}' based on its store page: ${storeUrl}. Output in Simplified Chinese.`;
  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
  } catch (e) { return ""; }
};

export const analyzeIconElementsFromUrl = async (gameName: string, storeUrl: string): Promise<string> => {
  const prompt = `Describe the key elements found in the app icon and screenshots of '${gameName}' from: ${storeUrl}. Output in Simplified Chinese.`;
  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
  } catch (e) { return ""; }
};

export const analyzeSellingPointsFromUrl = async (gameName: string, storeUrl: string): Promise<string> => {
  const prompt = `Identify the Unique Selling Points (USPs) and hook of '${gameName}' from: ${storeUrl}. Output in Simplified Chinese.`;
  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
  } catch (e) { return ""; }
};

export const extractGameNameFromUrl = async (storeUrl: string): Promise<string> => {
  const prompt = `Extract the official game name from this URL: ${storeUrl}. Return ONLY the name.`;
  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || "";
  } catch (e) { return ""; }
};

export const expandDesignPurpose = async (purpose: string, gameName: string): Promise<string> => {
  const prompt = `Expand on this design purpose for game '${gameName}': "${purpose}". Make it more specific and actionable in Simplified Chinese.`;
  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || purpose;
  } catch (e) { return purpose; }
};
