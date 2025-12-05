
import { AppView } from './types';

export const researchExplanations: Record<string, { title: string; content: string }> = {
  [AppView.ABACR_LOOP]: {
    title: "A-B-A-C-R 游戏循环结构",
    content: "一种关卡设计与节奏控制模式，旨在维持心流：\n\n• A (Intro/Base): 引入新机制或回归基础，难度低。\n• B (Variation): 对 A 的机制进行变体或升级挑战。\n• A (Reinforcement): 再次巩固 A 的机制，通常结合 B 的元素。\n• C (Climax/Complex): 综合应用，达到难度高峰。\n• R (Reward/Rest): 奖励关或低难度关，提供释放与满足感。"
  },
  [AppView.HOOKED_MODEL]: {
    title: "HOOKED 上瘾模型",
    content: "由 Nir Eyal 提出，用于培养用户习惯的四步模型：\n\n1. Trigger (触发): 外部提示（如通知）或内部提示（如无聊、孤独）。\n2. Action (行动): 在动机充足且能力允许时发生的行为。\n3. Variable Reward (多变酬赏): 不可预测的奖励（如社交点赞、随机装备），产生多巴胺。\n4. Investment (投入): 用户投入时间、数据或金钱，增加再次使用的可能性（挂念感）。"
  },
  [AppView.MDA_FRAMEWORK]: {
    title: "MDA 框架",
    content: "一种用于分析游戏设计的形式化方法：\n\n• Mechanics (机制): 游戏的具体组件、基本规则、数据结构和算法。\n• Dynamics (动态): 玩家与机制互动时产生的实时行为和策略。\n• Aesthetics (美学): 玩家在游戏过程中获得的情感体验（如幻想、挑战、探索、表达）。\n\n设计师视角：M -> D -> A\n玩家视角：A -> D -> M"
  },
  [AppView.OCTALYSIS_MODEL]: {
    title: "八角行为模型 (Octalysis)",
    content: "由 Yu-kai Chou 提出的游戏化框架，包含 8 大核心驱动力：\n\n1. 史诗意义与使命感 (Epic Meaning)\n2. 进步与成就感 (Development & Accomplishment)\n3. 创造力的发挥与反馈 (Empowerment of Creativity)\n4. 拥有感与占有欲 (Ownership & Possession)\n5. 社交影响与关联性 (Social Influence)\n6. 稀缺性与渴望 (Scarcity & Impatience)\n7. 未知性与好奇心 (Unpredictability & Curiosity)\n8. 亏损与逃避心 (Loss & Avoidance)"
  },
  [AppView.FOGG_BEHAVIOR_MODEL]: {
    title: "Fogg 行为模型 (FBM)",
    content: "BJ Fogg 提出的行为发生公式：B = MAP\n\n行为 (Behavior) = 动机 (Motivation) + 能力 (Ability) + 触发 (Prompt)\n\n要让行为发生，这三要素必须在同一时刻出现。如果用户有动机但没能力，需要降低门槛；如果用户有能力没动机，需要增强激励。"
  },
  [AppView.FLOW_THEORY]: {
    title: "心流理论 (Flow)",
    content: "米哈里·契克森米哈赖提出的一种心理状态。当挑战难度 (Challenge) 与个人技能 (Skill) 达到平衡时，人会进入一种全神贯注、忘我的愉悦状态。\n\n关键要素：\n• 明确的目标\n• 即时的反馈\n• 能力与挑战的匹配\n• 融合的行动与知觉"
  },
  [AppView.DOPAMINE_LOOP_MODEL]: {
    title: "多巴胺循环 (Dopamine Loop)",
    content: "基于神经科学的奖励机制设计：\n\n• 预期 (Wanting): 多巴胺主要在对奖励的“预期”中释放，而非获得奖励时。\n• 预测误差 (Prediction Error): 当实际获得的奖励超出预期时（惊喜），多巴胺释放量最大。\n\n游戏通过“目标 -> 挑战 -> 不确定的奖励”来维持高水平的多巴胺分泌，形成“行动-反馈”闭环。"
  },
  [AppView.FOUR_ELEMENTS_MODEL]: {
    title: "四要素模型 (Caillois)",
    content: "Roger Caillois 对游戏的分类理论：\n\n1. Agon (竞争): 依靠技能和训练的对抗（如体育、竞技游戏）。\n2. Alea (运气): 结果不可控，听天由命（如骰子、抽卡）。\n3. Mimicry (模拟): 角色扮演，改变身份（如RPG）。\n4. Ilinx (眩晕): 破坏稳定知觉，追求感官刺激（如过山车、赛车）。"
  },
  [AppView.BARTLE_TAXONOMY_MODEL]: {
    title: "Bartle 玩家类型",
    content: "Richard Bartle 对多人游戏玩家的心理分类：\n\n• Achievers (成就型): 追求等级、装备、排名，喜欢“赢”。\n• Explorers (探索型): 追求发现地图、隐藏要素、机制漏洞，喜欢“懂”。\n• Socializers (社交型): 追求与其他玩家的互动、聊天，喜欢“聊”。\n• Killers (杀手型): 追求战胜、支配其他玩家，喜欢“虐”。"
  },
  [AppView.NARRATIVE_DESIGN]: {
    title: "叙事设计理论",
    content: "将故事与玩法结合的艺术，旨在创造情感共鸣：\n\n• 三幕结构: 经典的线性叙事（铺垫-冲突-解决）。\n• 非线性叙事: 分支剧情，赋予玩家选择权，增加重玩价值。\n• 循环叙事: 利用 Roguelike 机制，让重复的死亡/重生成为叙事的一部分（如《Hades》）。\n• 互动叙事: 玩家的选择直接影响故事走向和结局。"
  },
  [AppView.SKINNER_BOX_MODEL]: {
    title: "斯金纳箱 (Skinner Box)",
    content: "操作性条件反射实验装置。在游戏中指通过特定的奖励机制来强化玩家行为。\n\n核心机制：可变比率强化 (Variable Ratio Schedule) —— 玩家不知道下一次操作是否会有奖励，也不知道奖励的大小。这种不确定性产生的成瘾性最强，是开箱子、抽卡、刷装备的核心原理。"
  },
  [AppView.ASMR_RESEARCH]: {
    title: "游戏 ASMR 研究",
    content: "自发性知觉经络反应 (Autonomous Sensory Meridian Response)。\n\n利用特定的听觉（如低语、敲击、水声）或视觉刺激，使受众产生颅内酥麻、放松的愉悦感。在游戏中常用于音效设计（如UI点击音、合成反馈音、脚步声）或解压类素材创意，能显著提升沉浸感和满足感。"
  }
};
