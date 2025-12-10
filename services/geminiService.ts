
// ... existing imports
import { GoogleGenAI, Schema, Type } from "@google/genai";
import { 
  AiResponse, 
  GameDetails, 
  CpeEvent, 
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
  VideoAnalysisResponse,
  StoryboardShot,
  AdCreative,
  CopyVariant
} from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Generic helper for text generation
async function generateContentWithMeta<T>(modelName: string, prompt: string | any, schema?: Schema, systemInstruction?: string): Promise<AiResponse<T>> {
  try {
    const config: any = {};
    if (schema) {
      config.responseMimeType = "application/json";
      config.responseSchema = schema;
    }
    if (systemInstruction) {
        config.systemInstruction = systemInstruction;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: typeof prompt === 'string' ? prompt : prompt,
      config: config
    });

    let data: T;
    if (schema) {
       const text = response.text || "{}";
       data = JSON.parse(text) as T;
    } else {
       data = (response.text || "") as unknown as T;
    }

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || 'Source',
        url: chunk.web?.uri || ''
    })).filter((s: any) => s.url) || [];

    return {
      data,
      meta: {
        model: modelName,
        sources,
        reasoning: "Analysis provided by Gemini.",
        prompt: typeof prompt === 'string' ? prompt : "Complex Prompt"
      }
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export const generateMarketingPlan = async (details: GameDetails, platform: string, language: string, modelName: string): Promise<AiResponse<string>> => {
    const prompt = `Create a detailed ${platform} marketing strategy for the game "${details.name}".
    Genre: ${details.genre}
    Target Audience: ${details.targetAudience}
    Budget: $${details.budget}
    Markets: ${details.market}
    USP: ${details.usp}
    Goal: ${details.promotionGoal}
    Language: ${language}
    
    Include specific campaign structure, audience targeting, creative suggestions, and budget allocation. Format as Markdown.`;
    return generateContentWithMeta<string>(modelName, prompt);
};

export const generateAsoAnalysis = async (details: GameDetails, language: string, modelName: string): Promise<AiResponse<string>> => {
    const prompt = `Perform an ASO analysis for "${details.name}" (${details.genre}).
    USP: ${details.usp}
    Markets: ${details.market}
    Language: ${language}
    Provide keyword suggestions, title/subtitle optimization, and description improvements. Format as Markdown.`;
    return generateContentWithMeta<string>(modelName, prompt);
};

export const generateAdCopy = async (gameDetails: GameDetails, concept: string, cta: string, language: string, modelName: string) => {
    const prompt = `Write a Facebook ad copy for "${gameDetails.name}".
    Concept: ${concept}
    CTA: ${cta}
    Language: ${language}
    Output JSON with body, headline, and cta.`;
    
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            body: { type: Type.STRING },
            headline: { type: Type.STRING },
            cta: { type: Type.STRING }
        }
    };
    
    const result = await generateContentWithMeta<{body: string, headline: string, cta: string}>(modelName, prompt, schema);
    return result.data;
};

export const generateAdImage = async (prompt: string, aspectRatio: string, style: string, visualDetails: string, language: string, includeText: boolean, includeCharacters: boolean, modelName: string) => {
    if (modelName.includes('imagen')) {
       try {
           const response = await ai.models.generateImages({
               model: 'imagen-4.0-generate-001', // Enforce supported model or use mapped one
               prompt: `${prompt}. Style: ${style}. ${visualDetails}`,
               config: {
                   numberOfImages: 1,
                   aspectRatio: aspectRatio === '1:1' ? '1:1' : aspectRatio === '16:9' ? '16:9' : aspectRatio === '9:16' ? '9:16' : '3:4',
               }
           });
           const b64 = response.generatedImages[0].image.imageBytes;
           return { imageUrl: `data:image/png;base64,${b64}`, prompt: prompt, promptZh: "" };
       } catch (e) {
           console.error(e);
           throw e;
       }
    } else {
        const fullPrompt = `Generate an image for a mobile game ad. 
        Description: ${prompt}
        Style: ${style}
        Visual Details: ${visualDetails}
        Aspect Ratio: ${aspectRatio}
        ${includeText ? "Include text." : "No text."}
        ${includeCharacters ? "Include characters." : "No characters."}`;
        
        const response = await ai.models.generateContent({
            model: modelName,
            contents: fullPrompt,
        });
        
        let imageUrl = "";
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    break;
                }
            }
        }
        
        return { imageUrl, prompt: fullPrompt, promptZh: "" };
    }
};

export const generateCompositeImage = async (
    images: { label: string, data: string, mimeType: string }[],
    prompt: string,
    aspectRatio: string,
    style: string,
    modelName: string
) => {
    // Construct the prompt combining text and image parts
    const textPrompt = `Compose a high-quality mobile game ad creative using the provided reference images. 
    Aspect Ratio: ${aspectRatio}. 
    Style: ${style}. 
    
    Instructions:
    ${prompt}
    
    References provided (use these elements):
    ${images.map(img => `- ${img.label}`).join('\n')}
    
    Ensure the composition is coherent, visually appealing, and looks like a finished advertisement.`;

    const contents = [];
    
    // Add text instructions first
    contents.push({ text: textPrompt });

    // Add images
    images.forEach(img => {
        contents.push({ text: `Reference for ${img.label}:` });
        contents.push({
            inlineData: {
                mimeType: img.mimeType,
                data: img.data
            }
        });
    });

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: contents
        });

        let imageUrl = "";
        let generatedText = "";

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                } else if (part.text) {
                    generatedText += part.text;
                }
            }
        }

        return { imageUrl, prompt: textPrompt, debugText: generatedText };
    } catch (e) {
        console.error("Composite image generation error:", e);
        throw e;
    }
};

export const analyzeVisualDetailsFromUrl = async (gameName: string, storeUrl: string): Promise<string> => {
    const prompt = `Analyze the visual style of the game "${gameName}" from its store page or general knowledge. URL: ${storeUrl}. Provide a short visual description suitable for image generation prompts.`;
    const result = await generateContentWithMeta<string>('gemini-2.5-flash', prompt);
    return result.data;
};

export const generateAppIcon = async (gameName: string, genre: string, style: string, elements: string): Promise<string> => {
    const prompt = `App Icon for "${gameName}" (${genre}). Style: ${style}. Elements: ${elements}. High quality, 512x512.`;
    const result = await generateAdImage(prompt, '1:1', style, '', 'English', false, true, 'gemini-2.5-flash-image');
    return result.imageUrl;
};

export const analyzeIconElementsFromUrl = async (gameName: string, storeUrl: string): Promise<string> => {
    const prompt = `Suggest core visual elements for an app icon for "${gameName}" based on its genre and store presence. URL: ${storeUrl}. Return a comma-separated list of elements.`;
    const result = await generateContentWithMeta<string>('gemini-2.5-flash', prompt);
    return result.data;
};

export const generateFacebookAdCopies = async (productName: string, description: string, language: string, includeEmojis: boolean, storeUrl: string, style: string, modelName: string): Promise<CopyVariant[]> => {
    const prompt = `Generate 20 distinct Facebook ad copies for "${productName}".
    Description: ${description}
    Language: ${language}
    Style: ${style}
    Include Emojis: ${includeEmojis}
    Store URL: ${storeUrl}
    
    Output JSON array.`;
    
    const schema: Schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                sourceText: { type: Type.STRING },
                targetText: { type: Type.STRING }
            }
        }
    };
    
    const result = await generateContentWithMeta<CopyVariant[]>(modelName, prompt, schema);
    return result.data;
};

export const analyzeSellingPointsFromUrl = async (productName: string, storeUrl: string): Promise<string> => {
    const prompt = `Analyze the selling points of "${productName}" from ${storeUrl}. Output a summary in Simplified Chinese.`;
    const result = await generateContentWithMeta<string>('gemini-2.5-flash', prompt);
    return result.data;
};

export const generateCpeEvents = async (gameName: string, genre: string, gameplay: string, acquisitionGoal: string, singleCount: number, comboCount: number, modelName: string) => {
    const prompt = `Generate CPE events for "${gameName}" (${genre}). 
    Gameplay: ${gameplay}
    Goal: ${acquisitionGoal}
    Generate ${singleCount} single events and ${comboCount} combo events.`;
    
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            singleEvents: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        eventName: { type: Type.STRING },
                        difficulty: { type: Type.STRING },
                        estimatedTime: { type: Type.STRING },
                        descriptionZh: { type: Type.STRING },
                        descriptionEn: { type: Type.STRING },
                        completionRate: { type: Type.STRING },
                        timeLimit: { type: Type.STRING },
                        uaValueZh: { type: Type.STRING },
                        uaValueEn: { type: Type.STRING }
                    }
                } 
            },
            comboEvents: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        eventName: { type: Type.STRING },
                        difficulty: { type: Type.STRING },
                        estimatedTime: { type: Type.STRING },
                        descriptionZh: { type: Type.STRING },
                        descriptionEn: { type: Type.STRING },
                        completionRate: { type: Type.STRING },
                        timeLimit: { type: Type.STRING },
                        uaValueZh: { type: Type.STRING },
                        uaValueEn: { type: Type.STRING }
                    }
                } 
            }
        }
    };
    return generateContentWithMeta<{singleEvents: CpeEvent[], comboEvents: CpeEvent[]}>(modelName, prompt, schema);
};

export const analyzeGameplayFromUrl = async (gameName: string, storeUrl: string): Promise<string> => {
    const prompt = `Analyze gameplay of "${gameName}" from ${storeUrl}. Describe core loop and mechanics.`;
    const result = await generateContentWithMeta<string>('gemini-2.5-flash', prompt);
    return result.data;
};

export const generateAsmrPlan = async (gameName: string, genre: string, type: string, url: string, language: string) => {
    const prompt = `Create an ASMR marketing plan for "${gameName}" (${genre}). Type: ${type}. URL: ${url}. Language: ${language}.`;
    const result = await generateContentWithMeta<string>('gemini-3-pro-preview', prompt);
    return result.data;
};

export const generateAbacrAnalysis = async (gameName: string, genre: string, gameplay: string, url: string, purpose: string, language: string) => {
    const prompt = `Analyze "${gameName}" using the A-B-A-C-R model. Gameplay: ${gameplay}. Purpose: ${purpose}. Language: ${language}.`;
    const result = await generateContentWithMeta<string>('gemini-3-pro-preview', prompt);
    return result.data;
};

export const expandDesignPurpose = async (purpose: string, gameName: string) => {
    const prompt = `Expand the design purpose "${purpose}" for game "${gameName}" into a detailed statement.`;
    const result = await generateContentWithMeta<string>('gemini-2.5-flash', prompt);
    return result.data;
};

export const analyzeGameEconomics = async (metrics: any, countries: string) => {
    const prompt = `Analyze game economics based on these metrics: ${JSON.stringify(metrics)}. Target countries: ${countries}. Provide insights on LTV, ROAS, and payback period.`;
    const result = await generateContentWithMeta<string>('gemini-3-pro-preview', prompt);
    return result.data;
};

export const analyzeCompetitor = async (gameName: string, storeUrl: string, language: string, modelName: string) => {
    const prompt = `Analyze competitor "${gameName}" from ${storeUrl}. Provide report, metrics estimate, audience persona, and market performance. Language: ${language}. Return JSON.`;
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            report: { type: Type.OBJECT, properties: { marketAnalysis: {type: Type.STRING}, productAnalysis: {type: Type.STRING}, coreGameplay: {type: Type.STRING}, abacrAnalysis: {type: Type.STRING}, hookedModel: {type: Type.STRING}, emotionalAttachment: {type: Type.STRING}, pushStrategy: {type: Type.STRING}, asmrPotential: {type: Type.STRING}, monetization: {type: Type.STRING}, liveOps: {type: Type.STRING}, gameEvents: {type: Type.STRING}, branding: {type: Type.STRING}, community: {type: Type.STRING}, ipPotential: {type: Type.STRING}, techStack: {type: Type.STRING}, localization: {type: Type.STRING}, userReviews: {type: Type.STRING}, swot: {type: Type.STRING} } },
            metrics: { type: Type.OBJECT, properties: { d1: {type: Type.STRING}, d7: {type: Type.STRING}, d30: {type: Type.STRING}, avgSessionDuration: {type: Type.STRING}, estimatedDau: {type: Type.STRING}, topCountries: {type: Type.ARRAY, items: {type: Type.STRING}} } },
            audience: { type: Type.OBJECT, properties: { age: {type: Type.STRING}, gender: {type: Type.STRING}, countries: {type: Type.ARRAY, items: {type: Type.STRING}}, occupation: {type: Type.ARRAY, items: {type: Type.STRING}}, income: {type: Type.STRING}, interests: {type: Type.ARRAY, items: {type: Type.STRING}}, relationship: {type: Type.STRING} } },
            market: { type: Type.OBJECT, properties: { 
                financialTrends: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {month: {type: Type.STRING}, downloads: {type: Type.NUMBER}, revenue: {type: Type.NUMBER}}}},
                rankingHistory: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {month: {type: Type.STRING}, freeRank: {type: Type.NUMBER}, grossingRank: {type: Type.NUMBER}}}},
                genderDistribution: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {name: {type: Type.STRING}, value: {type: Type.NUMBER}}}},
                ageDistribution: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {name: {type: Type.STRING}, value: {type: Type.NUMBER}}}}
            }}
        }
    };
    return generateContentWithMeta<{ report: CompetitorReport, metrics: CompetitorMetrics, audience: TargetAudience, market: MarketPerformance }>(modelName, prompt, schema);
};

export const extractGameNameFromUrl = async (url: string) => {
    const prompt = `Extract game name from ${url}.`;
    const result = await generateContentWithMeta<string>('gemini-2.5-flash', prompt);
    return result.data;
};

export const compareStorePages = async (url1: string, url2: string, language: string, modelName: string) => {
    const prompt = `Compare store pages ${url1} and ${url2}. Language: ${language}. Return JSON.`;
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            game1Name: { type: Type.STRING },
            game2Name: { type: Type.STRING },
            comparisonTable: { 
                type: Type.ARRAY, 
                items: {
                    type: Type.OBJECT,
                    properties: {
                        dimension: { type: Type.STRING },
                        game1Content: { type: Type.STRING },
                        game2Content: { type: Type.STRING },
                        winner: { type: Type.STRING },
                        insight: { type: Type.STRING }
                    }
                }
            },
            detailedAnalysis: { type: Type.STRING }
        }
    };
    return generateContentWithMeta<StoreComparisonResponse>(modelName, prompt, schema);
};

export const generatePushStrategy = async (gameName: string, genre: string, tone: string, language: string, storeUrl: string, includeEmojis: boolean, count: number, timing: boolean, triggers: string[], modelName: string) => {
    const prompt = `Generate push notification strategy for ${gameName}. Genre: ${genre}. Tone: ${tone}. Language: ${language}. Triggers: ${triggers.join(',')}.`;
    const schema: Schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                category: { type: Type.STRING },
                notifications: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            body: { type: Type.STRING },
                            emoji: { type: Type.STRING },
                            translation: { type: Type.STRING },
                            timing: { type: Type.STRING },
                            triggerCondition: { type: Type.STRING }
                        }
                    }
                }
            }
        }
    };
    return generateContentWithMeta<PushStrategyResponse>(modelName, prompt, schema);
};

export const generateLiveOpsContent = async (gameName: string, storeUrl: string, eventType: string, eventTheme: string, language: string, includeText: boolean, includeCharacters: boolean, modelName: string) => {
    const prompt = `Generate LiveOps content for ${gameName}. Event: ${eventType} - ${eventTheme}. Language: ${language}.`;
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            eventName: { type: Type.STRING },
            shortDescription: { type: Type.STRING },
            longDescription: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            translation: { type: Type.OBJECT, properties: { eventName: { type: Type.STRING }, shortDescription: { type: Type.STRING }, longDescription: { type: Type.STRING } } }
        }
    };
    return generateContentWithMeta<LiveOpsContent>(modelName, prompt, schema);
};

export const generateHookedAnalysis = async (gameName: string, gameplay: string, storeUrl: string, targetAudience: string, language: string, modelName: string) => {
    const prompt = `Analyze "${gameName}" using Hooked Model. Gameplay: ${gameplay}. Audience: ${targetAudience}. Language: ${language}. Format as Markdown.`;
    return generateContentWithMeta<string>(modelName, prompt);
};

export const generateDeepAsoAnalysis = async (gameName: string, genre: string, storeUrl: string, competitors: string, market: string) => {
    const prompt = `Deep ASO analysis for ${gameName} (${genre}). Competitors: ${competitors}. Market: ${market}. Format as Markdown.`;
    const result = await generateContentWithMeta<string>('gemini-3-pro-preview', prompt);
    return result.data;
};

export const generateMdaAnalysis = async (gameName: string, genre: string, gameplay: string, storeUrl: string, language: string) => {
    const prompt = `MDA Framework analysis for ${gameName}. Gameplay: ${gameplay}. Language: ${language}. Format as Markdown.`;
    const result = await generateContentWithMeta<string>('gemini-3-pro-preview', prompt);
    return result.data;
};

export const generateOctalysisAnalysis = async (gameName: string, gameplay: string, storeUrl: string, targetAudience: string, language: string) => {
    const prompt = `Octalysis analysis for ${gameName}. Gameplay: ${gameplay}. Language: ${language}. Format as Markdown.`;
    const result = await generateContentWithMeta<string>('gemini-3-pro-preview', prompt);
    return result.data;
};

export const generateFoggBehaviorAnalysis = async (gameName: string, gameplay: string, storeUrl: string, targetAudience: string, language: string) => {
    const prompt = `Fogg Behavior Model analysis for ${gameName}. Gameplay: ${gameplay}. Language: ${language}. Format as Markdown.`;
    const result = await generateContentWithMeta<string>('gemini-3-pro-preview', prompt);
    return result.data;
};

export const generateFlowAnalysis = async (gameName: string, gameplay: string, storeUrl: string, playerSkill: string, language: string) => {
    const prompt = `Flow Theory analysis for ${gameName}. Gameplay: ${gameplay}. Skill: ${playerSkill}. Language: ${language}. Format as Markdown.`;
    const result = await generateContentWithMeta<string>('gemini-3-pro-preview', prompt);
    return result.data;
};

export const generateFourElementsAnalysis = async (gameName: string, gameplay: string, storeUrl: string, genre: string, language: string) => {
    const prompt = `Four Elements (Caillois) analysis for ${gameName}. Gameplay: ${gameplay}. Language: ${language}. Return JSON with scores and analysis string.`;
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            scores: { type: Type.OBJECT, properties: { agon: { type: Type.NUMBER }, alea: { type: Type.NUMBER }, mimicry: { type: Type.NUMBER }, ilinx: { type: Type.NUMBER } } },
            analysis: { type: Type.STRING }
        }
    };
    return generateContentWithMeta<{scores: FourElementsScore, analysis: string}>('gemini-3-pro-preview', prompt, schema);
};

export const generateSkinnerBoxAnalysis = async (gameName: string, gameplay: string, storeUrl: string, language: string) => {
    const prompt = `Skinner Box analysis for ${gameName}. Gameplay: ${gameplay}. Language: ${language}. Return JSON.`;
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            analysis: { type: Type.STRING },
            schedules: { type: Type.OBJECT, properties: { fixedRatio: { type: Type.STRING }, variableRatio: { type: Type.STRING }, fixedInterval: { type: Type.STRING }, variableInterval: { type: Type.STRING } } }
        }
    };
    const result = await generateContentWithMeta<SkinnerBoxResponse>('gemini-3-pro-preview', prompt, schema);
    return result.data;
};

export const generateDopamineLoopAnalysis = async (gameName: string, gameplay: string, storeUrl: string, rewardMechanics: string, language: string) => {
    const prompt = `Dopamine Loop analysis for ${gameName}. Gameplay: ${gameplay}. Rewards: ${rewardMechanics}. Language: ${language}. Return JSON.`;
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            analysis: { type: Type.STRING },
            loop: { type: Type.OBJECT, properties: { goal: { type: Type.STRING }, reward: { type: Type.STRING }, feedback: { type: Type.STRING } } }
        }
    };
    const result = await generateContentWithMeta<DopamineLoopResponse>('gemini-3-pro-preview', prompt, schema);
    return result.data;
};

export const generateBartleAnalysis = async (gameName: string, gameplay: string, storeUrl: string, language: string) => {
    const prompt = `Bartle Player Type analysis for ${gameName}. Gameplay: ${gameplay}. Language: ${language}. Return JSON.`;
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            analysis: { type: Type.STRING },
            scores: { type: Type.OBJECT, properties: { achievers: { type: Type.NUMBER }, explorers: { type: Type.NUMBER }, socializers: { type: Type.NUMBER }, killers: { type: Type.NUMBER } } }
        }
    };
    const result = await generateContentWithMeta<BartleResponse>('gemini-3-pro-preview', prompt, schema);
    return result.data;
};

export const generateNarrativeAnalysis = async (gameName: string, gameplay: string, storeUrl: string, genre: string, language: string) => {
    const prompt = `Narrative Design analysis for ${gameName}. Gameplay: ${gameplay}. Language: ${language}. Return JSON.`;
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            analysis: { type: Type.STRING },
            scores: { type: Type.OBJECT, properties: { threeAct: { type: Type.NUMBER }, nonLinear: { type: Type.NUMBER }, circular: { type: Type.NUMBER }, interactive: { type: Type.NUMBER } } }
        }
    };
    const result = await generateContentWithMeta<NarrativeResponse>('gemini-3-pro-preview', prompt, schema);
    return result.data;
};

export const generateIaaPlan = async (gameName: string, genre: string, gameplay: string, targetMarket: string, language: string) => {
    const prompt = `IAA Monetization plan for ${gameName}. Genre: ${genre}. Market: ${targetMarket}. Language: ${language}. Format as Markdown.`;
    const result = await generateContentWithMeta<string>('gemini-3-pro-preview', prompt);
    return result.data;
};

export const generateIapPlan = async (gameName: string, genre: string, gameplay: string, targetAudience: string, language: string) => {
    const prompt = `IAP Monetization plan for ${gameName}. Genre: ${genre}. Audience: ${targetAudience}. Language: ${language}. Format as Markdown.`;
    const result = await generateContentWithMeta<string>('gemini-3-pro-preview', prompt);
    return result.data;
};

export const generateGooglePlayNews = async (language: string) => {
    const prompt = `Summarize recent Google Play news (policies, algo updates) in ${language}. Use Google Search tool. Format as Markdown.`;
    return generateContentWithMeta<string>('gemini-2.5-flash', prompt, undefined, undefined);
};

export const generateAppStoreNews = async (language: string) => {
    const prompt = `Summarize recent App Store news in ${language}. Format as Markdown.`;
    const result = await generateContentWithMeta<string>('gemini-2.5-flash', prompt);
    return result.data;
};

export const generateAdTechNews = async (platform: string, language: string) => {
    const prompt = `Summarize recent ${platform} news in ${language}. Format as Markdown.`;
    const result = await generateContentWithMeta<string>('gemini-2.5-flash', prompt);
    return result.data;
};

export const generateMarketingCalendar = async (countries: string, year: number, quarter: string, language: string, modelName: string) => {
    const prompt = `Marketing Calendar for ${countries}. Year: ${year}, ${quarter}. Language: ${language}. Return JSON with markdown and chart data.`;
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            markdown: { type: Type.STRING },
            chartData: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { month: {type: Type.STRING}, keyEvent: {type: Type.STRING}, intensity: {type: Type.NUMBER}, historicalRoas: {type: Type.NUMBER}, historicalCtr: {type: Type.NUMBER}, pastCampaignInsight: {type: Type.STRING} } } }
        }
    };
    return generateContentWithMeta<{markdown: string, chartData: MarketingCalendarData[]}>(modelName, prompt, schema);
};

export const generateAdBiddingStrategy = async (gameName: string, genre: string, platform: string, market: string, language: string) => {
    const prompt = `Ad Bidding Strategy for ${gameName} (${platform}). Market: ${market}. Language: ${language}. Format as Markdown.`;
    const result = await generateContentWithMeta<string>('gemini-3-pro-preview', prompt);
    return result.data;
};

export const generateIapPricingStrategy = async (gameName: string, genre: string, region: string, language: string) => {
    const prompt = `IAP Pricing Strategy for ${gameName} in ${region}. Language: ${language}. Format as Markdown.`;
    const result = await generateContentWithMeta<string>('gemini-3-pro-preview', prompt);
    return result.data;
};

export const generateAiNews = async (timeRange: string, language: string) => {
    const prompt = `AI News for ${timeRange}. Language: ${language}. Format as Markdown.`;
    const result = await generateContentWithMeta<string>('gemini-2.5-flash', prompt);
    return result.data;
};

export const generateOmnichannelStrategy = async (details: GameDetails, gpUrl: string, iosUrl: string, language: string, modelName: string) => {
    const prompt = `Omnichannel Strategy for ${details.name}. GP: ${gpUrl}, iOS: ${iosUrl}. Language: ${language}. Format as Markdown.`;
    return generateContentWithMeta<string>(modelName, prompt);
};

export const describeImageForRecreation = async (base64Data: string, mimeType: string, modelName: string) => {
    const prompt = "Describe this image in detail for recreation.";
    const contents = [
        {
            inlineData: {
                mimeType: mimeType,
                data: base64Data
            }
        },
        { text: prompt }
    ];
    const response = await ai.models.generateContent({
        model: modelName,
        contents: contents
    });
    return response.text || "";
};

export const analyzeVideoFrames = async (frames: string[], context: string, scriptLang: string, storyboardLang: string, promptLang: string, modelName: string) => {
    const prompt = `Analyze video frames. Context: ${context}. Script Lang: ${scriptLang}, Storyboard Lang: ${storyboardLang}, Prompt Lang: ${promptLang}. Return JSON.`;
    const contents = [
        { text: prompt },
        ...frames.map(f => ({ inlineData: { mimeType: 'image/jpeg', data: f } }))
    ];
    
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            script: { type: Type.STRING },
            storyboard: { 
                type: Type.ARRAY, 
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        shotNumber: { type: Type.NUMBER },
                        description: { type: Type.STRING },
                        audio: { type: Type.STRING },
                        visualPrompt: { type: Type.STRING }
                    }
                }
            }
        }
    };
    
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        const data = JSON.parse(response.text || "{}") as VideoAnalysisResponse;
        return { data, meta: { model: modelName, reasoning: "Video analysis", prompt: "Video frames + prompt" } };
    } catch (e) {
        throw e;
    }
};

export const analyzeVideoUrl = async (videoUrl: string, context: string, scriptLang: string, storyboardLang: string, promptLang: string, modelName: string) => {
    const prompt = `Analyze video at ${videoUrl}. Context: ${context}. Langs: ${scriptLang}, ${storyboardLang}, ${promptLang}. Return JSON VideoAnalysisResponse.`;
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            script: { type: Type.STRING },
            storyboard: { 
                type: Type.ARRAY, 
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        shotNumber: { type: Type.NUMBER },
                        description: { type: Type.STRING },
                        audio: { type: Type.STRING },
                        visualPrompt: { type: Type.STRING }
                    }
                }
            }
        }
    };
    return generateContentWithMeta<VideoAnalysisResponse>(modelName, prompt, schema);
};

export const generateVideoFromImage = async (prompt: string, imageUrl: string, modelName: string) => {
    const base64Data = imageUrl.split(',')[1];
    const mimeType = imageUrl.substring(imageUrl.indexOf(':') + 1, imageUrl.indexOf(';'));
    
    let operation = await ai.models.generateVideos({
        model: modelName,
        prompt: prompt,
        image: {
            imageBytes: base64Data,
            mimeType: mimeType
        },
        config: {
        }
    });
    
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({operation: operation});
    }
    
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
        return `${downloadLink}&key=${process.env.API_KEY}`;
    }
    throw new Error("Video generation failed");
};

export const generatePlayableConcept = async (gameName: string, description: string, language: string, modelName: string) => {
    const prompt = `Playable Ad Concept for ${gameName}. Description: ${description}. Language: ${language}. Format as Markdown.`;
    return generateContentWithMeta<string>(modelName, prompt);
};

export const generatePlayableCode = async (concept: string, modelName: string) => {
    const prompt = `Generate HTML5 code for playable ad based on: ${concept}. Single file HTML.`;
    const result = await generateContentWithMeta<string>(modelName, prompt);
    let code = result.data;
    if (code.startsWith("```html")) {
        code = code.replace(/^```html\n/, "").replace(/\n```$/, "");
    }
    return code;
};

export const generatePersonalizationStrategy = async (
    gameName: string, 
    genre: string, 
    storeUrl: string,
    monetizationModel: string,
    segments: string, 
    focusArea: string, 
    language: string, 
    modelName: string
): Promise<AiResponse<string>> => {
    const prompt = `Create a Personalization and A/B Testing strategy for the mobile game "${gameName}" (${genre}).
    Store URL: ${storeUrl}
    Monetization Model: ${monetizationModel}
    Target Segments: ${segments}.
    Focus Area: ${focusArea}.
    Language: ${language}.
    
    Include:
    1. User & Device Segmentation (Behavioral, Demographic, Device Model/Performance).
    2. "Personalized Experience" implementation logic (Difficulty, Ad Waterfall/Placement, IAP Pricing, Offers, Push Notifications) tailored to ${monetizationModel}.
    3. A/B Testing Experiments (Hypothesis, Variants A/B/C, Success Metrics).
    Format as Markdown.`;
    return generateContentWithMeta<string>(modelName, prompt);
};