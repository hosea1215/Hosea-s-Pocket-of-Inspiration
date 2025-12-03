
import { GoogleGenAI, Type } from "@google/genai";
import { GameDetails, AdCreative, CopyVariant, CpeEvent, CpeResponse, EconomicMetrics } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMarketingPlan = async (details: GameDetails): Promise<string> => {
  const prompt = `
    作为世界一流的手游用户获取经理 (User Acquisition Manager)。
    为一款手游创建一个详细的 Facebook 广告投放策略。
    
    游戏信息:
    - 游戏名称: ${details.name}
    - 游戏商店页地址: ${details.storeUrl || '未提供'}
    - 类型: ${details.genre} (Google Play Category)
    - 推广目标 (Goal): ${details.promotionGoal}
    - 推广目的 (Objective): ${details.promotionPurpose}
    - 目标市场: ${details.market}
    - 目标受众: ${details.targetAudience}
    - 季度预算: $${details.budget} (Quarterly)
    - 独特卖点 (USP): ${details.usp}
    - 核心玩法: ${details.gameplay || '未提供'}

    **输出要求：**
    1. 必须使用简体中文。
    2. 采用 Markdown 格式，使用清晰的标题、列表和表格。
    3. 内容必须包含且不限于以下章节，每一节都需要深入具体的战术建议：

    ### 1. 执行摘要
    策略的简要概述，重点关注如何实现"${details.promotionGoal}"这一目标，以及选择"${details.promotionPurpose}"作为推广目的的原因。

    ### 2. Facebook 广告账户与系列搭建建议 (Account & Campaign Structure)
    *   **账户结构策略**：
        *   **分阶段账户架构**：
            *   **测试期 (Testing)**：建议使用单一账户，利用 ABO (Ad Set Budget Optimization) 测试素材和受众。
            *   **增长期 (Growth)**：根据预算 $${details.budget}，是否需要开设独立的扩量账户？如何利用 CBO (Campaign Budget Optimization) 进行规模化？
            *   **稳定/利润期**：如何整合账户结构以减少管理成本？
    *   **系列设置 (Campaign Setup) 具体战术**：
        *   **AAA 系列 (Advantage+ App Campaigns)**：针对"${details.genre}"类游戏，何时引入 AAA？建议预算占比是多少？
        *   **手动系列 (Manual Setup)**：在测试期，建议采用什么结构（例如 1 Campaign - 3 Ad Sets - 3-5 Ads）？
        *   **受众策略**：针对测试期、增长期、稳定期，分别给出 Broad (宽泛)、Interest (兴趣)、LAL (类似) 受众的具体配置建议。

    ### 3. 素材与商店详情页 (ASO) 协同深度分析 (针对 ${details.name} - ${details.genre})
    此部分至关重要，请基于提供的 URL: ${details.storeUrl} 进行模拟诊断。
    *   **商店页现有资产诊断 (ASO Audit)**：
        *   **Icon 视觉分析**：分析当前 Icon 的设计元素。针对"${details.genre}"品类，它是否具备高点击率特征（如：高饱和度色彩、面部情绪特写、核心道具展示）？有何优化建议？
        *   **首屏截图 (First Screen) 关键性分析**：用户点击广告后看到的前两张截图是决定转化率的生死线。分析它们是否直接展示了核心玩法"${details.gameplay}"？是否存在信息过载或与广告素材脱节的问题？
        *   **描述 (Description) 吸引力分析**：检查短描述 (Short Description) 和长描述的前三行。文案是否包含了"${details.usp}"？是否足够吸引人点击“更多”？
    *   **素材创意与商店页首屏的匹配建议 (Scent Match Strategy)**：
        *   **视觉锚点 (Visual Anchors)**：请具体定义 **3个必须一致的视觉元素**（例如：特定的UI配色#Hex、核心方块样式、标志性的通关庆祝画面）。这些元素必须在“广告视频最后3秒”和“商店页第一张截图”中完全一致，以建立视觉信任，降低跳出率。
    *   **具体创意方向与 ASO 配合方案**：
        *   **方向 1：核心爽感 (Core Gameplay)**：
            *   *广告创意*：展示高连击消除、全屏特效的爽快瞬间。
            *   *商店页配合*：建议将第 1 张截图替换为带有高数值反馈（如 "Combo x10"）的游戏截图。
        *   **方向 2：益智挑战 (Puzzle Solving/IQ)**：
            *   *广告创意*：展示“差一步就成功”的失败场景，激发胜负欲。
            *   *商店页配合*：第 2 张截图需展示看似简单实则烧脑的关卡布局，文案强调“Brain Training”。
        *   **方向 3：休闲解压 (Relaxation/ASMR)**：
            *   *广告创意*：强调治愈音效、无倒计时、纯粹的整理收纳感。
            *   *商店页配合*：商店页置顶文案需强调“No Wifi Needed, Relax Anytime”，截图色调需柔和。

    ### 4. 季度投放节奏与预算分配 (Quarterly Budget: $${details.budget})
    请以表格形式列出测试期、增长期、稳定期、利润期的时间跨度、预算占比 (%)、核心 KPI 目标及**关键操作动作**。
    *   **测试期**：注重 CTR 和 IPM，预算占比建议。
    *   **增长期**：注重 CPI 和量级，Bid Cap 或 Cost Cap 的介入时机。
    *   **稳定期/利润期**：注重 ROAS，如何利用 Min ROAS 策略锁定利润。

    ### 5. 受众细分
    详细的兴趣群体关键词、行为标签和 LAL 种子用户建议。

    ### 6. 创意策略
    推荐的广告格式（视频 vs 静态图）、视觉钩子 (Hooks) 和信息传递主题。

    ### 7. 预计 KPI
    基于"${details.genre}"类型的行业标准，估算 CPI、CTR、CVR 和 IPM。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "生成计划失败。";
  } catch (error) {
    console.error("Error generating plan:", error);
    throw error;
  }
};

export const generateAsoAnalysis = async (details: GameDetails): Promise<string> => {
  const prompt = `
    作为 ASO (应用商店优化) 专家，请为这款手游进行深入的关键词分析和元数据优化建议。

    游戏信息:
    - 游戏名称: ${details.name}
    - 游戏类型: ${details.genre}
    - 核心玩法: ${details.gameplay || details.usp}
    - 目标市场: ${details.market}

    **输出要求（简体中文，Markdown 格式）：**

    ### 1. 核心关键词研究 (Keyword Research)
    请分析 Google Play 和 App Store 的搜索趋势，提供以下三类关键词列表（每类至少 10 个）：
    *   **高热度关键词 (Head Keywords)**: 流量大但竞争激烈的词 (例如: "Puzzle", "Game")。
    *   **精准长尾词 (Long-tail Keywords)**: 流量适中但转化率高、竞争较小的词组 (例如: "relaxing block puzzle offline")。
    *   **竞品词 (Competitor Keywords)**: 类似玩法的头部竞品游戏名称。

    ### 2. 关键词组合建议 (Keyword Combinations)
    *   推荐 3-5 个高潜力的关键词组合，可用于标题或副标题。

    ### 3. 元数据优化建议 (Metadata Optimization)
    基于上述关键词，撰写以下内容的优化草稿：
    *   **Google Play Title (30字符)**: 包含最强品牌词+核心关键词。
    *   **Short Description (80字符)**: 极具诱惑力，包含次级核心词，强调 USP。
    *   **App Store Subtitle (30字符)**: 补充说明玩法，包含长尾词。

    ### 4. 转化率优化建议 (CRO)
    *   针对"${details.gameplay || details.genre}"类型，列出 Icon 和截图中最能吸引自然流量的视觉元素建议。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "生成 ASO 分析失败。";
  } catch (error) {
    console.error("Error generating ASO analysis:", error);
    throw error;
  }
};

export const generateAdCopy = async (
  details: GameDetails, 
  concept: string, 
  customCta?: string, 
  language: string = 'English'
): Promise<{ headline: string; body: string; cta: string }> => {
  const prompt = `
    为一款手游撰写高转化率的 Facebook 广告文案。
    **重要：所有输出内容（标题、正文、CTA）必须严格使用 ${language} 语言。**
    
    游戏: ${details.name} (${details.genre})
    商店链接: ${details.storeUrl || '未提供'}
    概念: ${concept}
    推广目标: ${details.promotionGoal}
    ${customCta ? `必须使用此行动号召 (CTA): "${customCta}" (请将其翻译为 ${language} 或保持原意)` : ''}
    
    仅返回一个 JSON 对象，包含以下键: 
    - "headline" (标题, 语言: ${language})
    - "body" (正文, 语言: ${language})
    - "cta" (行动号召, 语言: ${language})
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            body: { type: Type.STRING },
            cta: { type: Type.STRING },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating copy:", error);
    return {
      headline: "Game Title",
      body: "Play this amazing game now!",
      cta: customCta || "Play Game"
    };
  }
};

export const analyzeVisualDetailsFromUrl = async (
  gameName: string,
  storeUrl: string
): Promise<string> => {
  const prompt = `
    Act as a Game Art Director.
    Analyze the visual style and assets of the mobile game "${gameName}" found at this URL: ${storeUrl}.
    
    Extract key visual elements to create a detailed description for an ad creative image.
    Consider:
    - Art style (e.g., Cartoon, 3D, Pixel).
    - Main character appearance.
    - Typical environment or background.
    - Key objects or UI elements.
    
    Output in **Simplified Chinese**.
    Create a vivid, concise description (under 50 words) that can be used as an image generation prompt.
    Return ONLY the description text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || "多彩的游戏场景，包含核心角色和特效。";
  } catch (error) {
    console.error("Error analyzing visual details:", error);
    return "高品质游戏画面，色彩鲜艳。";
  }
};

export const analyzeGameplayFromUrl = async (
  gameName: string,
  storeUrl: string
): Promise<string> => {
  const prompt = `
    Act as a Game Designer.
    Analyze the mobile game "${gameName}" found at this URL: ${storeUrl}.
    
    Summarize its **Core Gameplay Loop** in one paragraph (approx 80-100 words).
    Focus on:
    - The primary mechanic (e.g., matching, shooting, running).
    - The goal of the level or session.
    - Any unique twists or mechanics mentioned in the store description.
    
    Output in **Simplified Chinese**.
    Return ONLY the description text. Do not add markdown formatting or labels.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || "无法分析该链接，请手动输入玩法。";
  } catch (error) {
    console.error("Error analyzing gameplay:", error);
    return "分析出错，请检查链接或重试。";
  }
};

export const expandDesignPurpose = async (
  currentPurpose: string,
  gameName: string
): Promise<string> => {
  const prompt = `
    Act as a Game Economy and Design Expert.
    Expand the following "Design Purpose" for the mobile game "${gameName}".
    
    Current Text: "${currentPurpose}"
    
    Goal: Make it more comprehensive, focusing on:
    1. Deepening player flow state (Immersion).
    2. Specific long-term retention strategies (Habit formation).
    3. Hybrid monetization (Ads + IAP) strategies that respect the user experience while maximizing LTV.
    4. Creating emotional attachment ("挂念感").
    
    Keep the tone professional and strategic.
    Output in Simplified Chinese.
    The output should be a cohesive paragraph or two, suitable for a design document.
    Return ONLY the expanded text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || currentPurpose;
  } catch (error) {
    console.error("Error expanding design purpose:", error);
    return currentPurpose;
  }
};

export const generateAdImage = async (
  promptText: string, 
  aspectRatio: string = '1:1', 
  style: string = '3D Render', 
  visualDetails: string = '',
  language: string = 'English'
): Promise<string> => {
  try {
    // Determine dimensions based on aspect ratio
    let width = 1024;
    let height = 1024;
    
    if (aspectRatio === '9:16') {
      width = 576;
      height = 1024;
    } else if (aspectRatio === '16:9') {
      width = 1024;
      height = 576;
    }

    const fullDescription = `
      Generate a mobile game ad image. 
      Art Style: ${style}. 
      Concept: ${promptText}.
      ${visualDetails ? `Specific Visual Details: ${visualDetails}.` : ''}
      
      **Text Requirement**: If the generated image contains ANY text (e.g., UI elements, speech bubbles, signs), that text MUST be written in ${language}.
      
      High quality, vibrant colors, engaging, optimized for Facebook Ad performance.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: fullDescription }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio === '1:1' ? '1:1' : aspectRatio === '9:16' ? '9:16' : '16:9',
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Error generating image:", error);
    return "https://via.placeholder.com/1024x1024?text=AI+Generation+Failed";
  }
};

export const generateAppIcon = async (gameName: string, genre: string, style: string, elements: string): Promise<string> => {
  try {
    const prompt = `
      Design a mobile app icon for a ${genre} game called "${gameName}".
      Style: ${style}.
      Elements: ${elements}.
      
      Requirements:
      - Full square image (do NOT round corners).
      - No text inside the icon.
      - High contrast, vibrant colors suitable for Google Play Store.
      - Professional game art quality.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No icon generated");
  } catch (error) {
    console.error("Error generating icon:", error);
    return "https://via.placeholder.com/512x512?text=Icon+Failed";
  }
};

export const analyzeIconElementsFromUrl = async (
  gameName: string,
  storeUrl: string
): Promise<string> => {
  const prompt = `
    Act as a Lead Game Artist.
    Analyze the mobile game "${gameName}" found at this URL: ${storeUrl}.
    
    Extract the 3 most important **Core Visual Elements** that should appear on the App Icon to maximize click-through rate (CTR).
    Consider:
    - Main character (face/emotion).
    - Key item or prop.
    - Color palette associated with the brand.
    
    Output in **Simplified Chinese**.
    Return ONLY a descriptive paragraph suitable for an image generation prompt. Keep it under 50 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || "无法分析该链接，请手动填写核心元素。";
  } catch (error) {
    console.error("Error analyzing icon elements:", error);
    return "分析出错，请检查链接或重试。";
  }
};

export const analyzeSellingPointsFromUrl = async (
  gameName: string,
  storeUrl: string
): Promise<string> => {
  const prompt = `
    Act as a Marketing Expert for mobile games.
    Analyze the mobile game "${gameName}" found at this URL: ${storeUrl}.
    
    Extract its **Key Selling Points (USPs)** and summarize them into a persuasive description suitable for ad copy generation.
    Focus on:
    - Unique gameplay mechanics.
    - Emotional benefits (relaxing, exciting, challenging).
    - Social features or progression elements.
    
    Output in **Simplified Chinese**.
    Return ONLY the text description (no markdown, no labels). Keep it under 100 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || "无法分析该链接，请手动填写卖点。";
  } catch (error) {
    console.error("Error analyzing selling points:", error);
    return "分析出错，请检查链接或重试。";
  }
};

export const generateFacebookAdCopies = async (
  productName: string, 
  description: string, 
  targetLanguage: string, 
  includeEmojis: boolean,
  storeUrl?: string
): Promise<CopyVariant[]> => {
  const prompt = `
    Act as a professional Facebook Ads Copywriter.
    Product: ${productName}
    Store URL: ${storeUrl || 'N/A'}
    Description: ${description}
    Target Language: ${targetLanguage}
    Include Emojis: ${includeEmojis}

    Generate 20 distinct Facebook ad copy variations in ${targetLanguage}.
    For each variation, provide:
    1. The ad copy in ${targetLanguage}.
    2. A Simplified Chinese translation of that copy (for reference).
    
    Ensure the tone varies (e.g., Urgent, Curiosity, Benefit-driven, Social Proof).
    Keep copies concise and optimized for conversions.

    Return JSON format:
    [
      { "targetText": "...", "sourceText": "..." },
      ...
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
           type: Type.ARRAY,
           items: {
             type: Type.OBJECT,
             properties: {
               targetText: { type: Type.STRING },
               sourceText: { type: Type.STRING },
             }
           }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    
    const parsed = JSON.parse(text);
    return parsed.map((item: any, index: number) => ({
      id: index.toString(),
      targetText: item.targetText,
      sourceText: item.sourceText
    }));

  } catch (error) {
    console.error("Error generating FB copies:", error);
    return [];
  }
};

export const generateCpeEvents = async (
  gameName: string,
  genre: string,
  gameplay: string,
  acquisitionGoal: string
): Promise<CpeResponse> => {
  const prompt = `
    作为移动广告变现与买量专家，请为游戏设计 CPE (Cost Per Engagement) 事件点。
    游戏名称: ${gameName}
    类型: ${genre}
    核心玩法: ${gameplay}
    买量目标: ${acquisitionGoal}

    请生成两组事件：
    1. **单一事件列表 (Single Events)**: 20 个按难度递增的标准事件（如：通过第X关，达到X级）。
    2. **组合事件列表 (Combo Events)**: 5 个高价值的复合行为事件（如：首日登录 + 通过第5关）。

    每个事件需包含：
    - eventName: 事件名称
    - description: 详细描述
    - difficulty: 难度 (Easy, Medium, Hard, Hardcore)
    - estimatedTime: 预计达成时间 (针对普通玩家)
    - uaValue: 为什么这个事件对 UA 买量有价值？

    返回 JSON 格式。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            singleEvents: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  eventName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  estimatedTime: { type: Type.STRING },
                  uaValue: { type: Type.STRING },
                }
              }
            },
            comboEvents: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  eventName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  estimatedTime: { type: Type.STRING },
                  uaValue: { type: Type.STRING },
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    
    const parsed = JSON.parse(text);
    // Add IDs
    parsed.singleEvents = parsed.singleEvents.map((e: any, i: number) => ({ ...e, id: `s-${i}` }));
    parsed.comboEvents = parsed.comboEvents.map((e: any, i: number) => ({ ...e, id: `c-${i}` }));
    
    return parsed as CpeResponse;

  } catch (error) {
    console.error("Error generating CPE events:", error);
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
    作为创意营销专家，请为这款手游设计一份 "ASMR 听觉营销方案"。
    游戏: ${gameName} (${genre})
    ASMR 风格倾向: ${asmrType}
    商店链接: ${storeUrl}

    请输出 Markdown 格式报告，包含：
    1. **听觉触发点分析 (Auditory Triggers)**: 基于游戏类型，列出可能存在的 3-5 个具有 ASMR 潜力的音效（如：方块消除的清脆声、金币掉落声、合成升级的提示音）。
    2. **视频创意脚本 (Video Scripts)**: 
       - 提供 2 个具体的广告视频脚本。
       - 详细描述画面 (Visual) 和声音 (Audio) 的配合。
       - 强调如何利用 ${asmrType} 来提高完播率。
    3. **文案配合建议**: 配合 ASMR 视频的广告文案。
    4. **落地页/商店页配合**: 建议商店页视频或截图如何呼应这种“解压/治愈”的氛围。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "ASMR 方案生成失败";
  } catch (error) {
    console.error("Error generating ASMR plan:", error);
    return "发生错误，无法生成 ASMR 方案。";
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
    作为游戏设计心理学专家，请使用 **A-B-A-C-R 游戏循环模型 (Action-Benefit-Action-Challenge-Reward)** 深入分析这款手游。
    
    游戏名称: ${gameName}
    类型: ${genre}
    商店链接: ${storeUrl}
    玩法描述: ${gameplay}
    设计目的: ${designPurpose}

    请生成一份详细的分析报告 (Markdown 格式)，严格按照以下结构进行解构：

    ### 1. 核心循环总览 (Core Loop Overview)
    简要总结该游戏的核心上瘾机制是如何运作的，并评估其是否符合"${designPurpose}"这一设计初衷。

    ### 2. A-B-A-C-R 结构拆解
    请针对该游戏的具体玩法，详细定义以下五个环节：

    *   **A - Action (初始行为/触发)**: 
        *   定义: 玩家最基础、最低门槛的操作是什么？(例如：点击屏幕、拖动方块)
        *   分析: 为什么这个动作容易上手？
    
    *   **B - Benefit (即时反馈)**: 
        *   定义: 动作发生后 0.1秒内给予的视觉/听觉反馈是什么？(例如：方块碎裂声、数字跳动)
        *   分析: 这种反馈如何满足多巴胺需求？

    *   **A - Action (深化行为/推进)**: 
        *   定义: 玩家为了获得更多反馈而进行的连续操作或策略性操作。
        *   分析: 玩家如何从“随意点”过渡到“有目的的点”？

    *   **C - Challenge (挑战/阻碍)**: 
        *   定义: 阻止玩家无限获得奖励的机制是什么？(例如：步数限制、时间限制、空间不足)
        *   分析: 挑战的设计是否在“无聊”和“焦虑”之间保持了心流 (Flow)？

    *   **R - Reward (最终奖励/成就)**: 
        *   定义: 克服挑战后获得的实质性奖励或元游戏进展。(例如：解锁新皮肤、通关、排行榜上升)
        *   分析: 这种奖励如何驱动玩家开启下一个 A-B-A-C-R 循环？

    ### 3. 优化建议 (Optimization Tips)
    基于上述分析，为游戏开发者提供 3 条具体的优化建议，重点关注如何更好地达成"${designPurpose}"。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "A-B-A-C-R 分析生成失败。";
  } catch (error) {
    console.error("Error generating ABACR analysis:", error);
    return "发生错误，无法生成分析报告。";
  }
};

export const analyzeGameEconomics = async (metrics: EconomicMetrics): Promise<string> => {
  const prompt = `
    作为游戏经济模型与数据分析专家，请根据以下预测数据对这款游戏的经济健康度进行诊断。

    输入数据:
    - CPI (每安装成本): $${metrics.cpi}
    - 自然量占比 (Organic Uplift): ${metrics.organicRatio}%
    - 每日买量规模 (Daily UA): ${metrics.dailyUa}
    - ARPDAU (日活跃用户平均收益): $${metrics.arpdau}
    - 留存率数据: 
      D1=${metrics.retentionD1}%
      D7=${metrics.retentionD7}%
      D28=${metrics.retentionD28}%
      D60=${metrics.retentionD60}%
      D90=${metrics.retentionD90}%
      D180=${metrics.retentionD180}%
      D365=${metrics.retentionD365}%

    任务:
    1.  **LTV 潜力评估**: 基于更完整的留存衰减趋势（D1-D365），评估游戏长线生命周期价值。
    2.  **回本周期 (Payback Period) 分析**: 结合自然量占比带来的综合成本降低（Effective CPI），分析回本周期是否良性？
    3.  **规模化风险**: 每日 ${metrics.dailyUa} 的买量规模下，当前的 ARPDAU 和留存能否支撑持续盈利？
    4.  **优化建议**: 针对 CPI、留存或变现效率，提供 3 条具体的改进策略。

    请以简体中文 Markdown 格式输出，言简意赅。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "经济模型诊断失败。";
  } catch (error) {
    console.error("Error analyzing game economics:", error);
    return "分析出错，请稍后重试。";
  }
};
