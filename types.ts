
export enum AppView {
  STRATEGY = 'STRATEGY',
  ASO_KEYWORDS = 'ASO_KEYWORDS',
  CREATIVE = 'CREATIVE',
  ICON_GEN = 'ICON_GEN',
  COPY_GEN = 'COPY_GEN',
  CPE_GEN = 'CPE_GEN',
  ASMR_RESEARCH = 'ASMR_RESEARCH',
  ABACR_LOOP = 'ABACR_LOOP',
  HOOKED_MODEL = 'HOOKED_MODEL',
  MDA_FRAMEWORK = 'MDA_FRAMEWORK',
  OCTALYSIS_MODEL = 'OCTALYSIS_MODEL',
  FOGG_BEHAVIOR_MODEL = 'FOGG_BEHAVIOR_MODEL',
  FLOW_THEORY = 'FLOW_THEORY',
  FOUR_ELEMENTS_MODEL = 'FOUR_ELEMENTS_MODEL',
  SKINNER_BOX_MODEL = 'SKINNER_BOX_MODEL',
  DOPAMINE_LOOP_MODEL = 'DOPAMINE_LOOP_MODEL',
  BARTLE_TAXONOMY_MODEL = 'BARTLE_TAXONOMY_MODEL',
  NARRATIVE_DESIGN = 'NARRATIVE_DESIGN',
  LTV_CALCULATOR = 'LTV_CALCULATOR',
  COMPETITOR_ANALYSIS = 'COMPETITOR_ANALYSIS',
  STORE_COMPARISON = 'STORE_COMPARISON',
  PUSH_STRATEGY = 'PUSH_STRATEGY',
  LIVEOPS_GEN = 'LIVEOPS_GEN',
  SETTINGS = 'SETTINGS'
}

export interface GameDetails {
  name: string;
  genre: string;
  targetAudience: string;
  budget: number;
  market: string;
  usp: string; // Unique Selling Proposition
  gameplay?: string; // Core Gameplay description for ASO
  promotionGoal: string;
  promotionPurpose: string;
  storeUrl?: string;
}

export interface GeneratedPlan {
  markdown: string;
  timestamp: number;
}

export interface AdCreative {
  id: string;
  imageUrl: string;
  copy: string;
  headline: string;
  cta: string;
  imagePrompt?: string;
  imagePromptZh?: string;
}

export interface AppIcon {
  id: string;
  imageUrl: string;
  prompt: string;
  style: string;
}

export interface CopyVariant {
  id: string;
  targetText: string;
  sourceText: string; // Simplified Chinese translation
}

export interface CpeEvent {
  id: string;
  eventName: string; // e.g., "Level 10 Completed"
  description: string; // Detail description
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Hardcore';
  estimatedTime: string; // e.g., "30 mins"
  uaValue: string; // Why is this good for UA?
}

export interface CpeResponse {
  singleEvents: CpeEvent[];
  comboEvents: CpeEvent[];
}

export interface MetricData {
  day: string;
  spend: number;
  installs: number;
  cpi: number;
}

export interface EconomicMetrics {
  cpi: number;
  retentionD1: number;
  retentionD7: number;
  retentionD28: number;
  retentionD60: number;
  retentionD90: number;
  retentionD180: number;
  retentionD365: number;
  arpdau: number;
  organicRatio: number; // Percentage, e.g., 15 for 15%
  dailyUa: number; // e.g., 10000
}

export interface CompetitorMetrics {
  d1: string;
  d7: string;
  d30: string;
  avgSessionDuration: string;
  estimatedDau: string;
  topCountries: string[];
}

export interface TargetAudience {
  countries: string[];
  gender: string;
  age: string;
  interests: string[];
  income: string;
  occupation: string[];
  relationship: string;
}

export interface TrendPoint {
  month: string;
  downloads: number;
  revenue: number;
}

export interface RankingPoint {
  month: string;
  freeRank: number;
  grossingRank: number;
}

export interface PieData {
  name: string;
  value: number;
}

export interface MarketPerformance {
  financialTrends: TrendPoint[];
  rankingHistory: RankingPoint[];
  genderDistribution: PieData[];
  ageDistribution: PieData[];
}

export interface CompetitorReport {
  marketAnalysis: string;
  productAnalysis: string;
  coreGameplay: string;
  abacrAnalysis: string;
  hookedModel: string;
  emotionalAttachment: string;
  pushStrategy: string;
  asmrPotential: string;
  monetization: string;
  liveOps: string;
  branding: string;
  community: string;
  ipPotential: string;
  techStack: string;
  localization: string;
  gameEvents: string;
  userReviews: string;
  swot: string;
}

export interface CompetitorAnalysisResponse {
  metrics: CompetitorMetrics;
  market: MarketPerformance;
  audience: TargetAudience;
  report: CompetitorReport;
}

export interface ComparisonPoint {
  dimension: string; // e.g., "Icon", "Screenshots", "Title"
  game1Content: string;
  game2Content: string;
  winner: 'Game 1' | 'Game 2' | 'Tie';
  insight: string;
}

export interface StoreComparisonResponse {
  game1Name: string;
  game2Name: string;
  comparisonTable: ComparisonPoint[];
  detailedAnalysis: string;
}

export interface PushNotification {
  title: string;
  body: string;
  emoji: string;
  translation: string; // Simplified Chinese translation
  timing: string; // Best time to send
}

export interface PushStrategySection {
  category: string; // e.g., "Onboarding", "Retention"
  notifications: PushNotification[];
}

export type PushStrategyResponse = PushStrategySection[];

export interface LiveOpsContent {
  eventName: string;
  shortDescription: string;
  longDescription: string;
  imagePrompt: string;
  translation?: {
    eventName: string;
    shortDescription: string;
    longDescription: string;
  };
}

export interface FourElementsScore {
  agon: number;
  alea: number;
  mimicry: number;
  ilinx: number;
}

export interface FourElementsResponse {
  scores: FourElementsScore;
  analysis: string;
}

export interface SkinnerBoxResponse {
  schedules: {
    fixedRatio: string;
    variableRatio: string;
    fixedInterval: string;
    variableInterval: string;
  };
  analysis: string;
}

export interface DopamineLoopResponse {
  loop: {
    goal: string; // 明确目标
    reward: string; // 可变奖励
    feedback: string; // 即时反馈
  };
  analysis: string;
}

export interface BartleScore {
  achievers: number; // Percentage
  explorers: number;
  socializers: number;
  killers: number;
}

export interface BartleResponse {
  scores: BartleScore;
  analysis: string;
}

export interface NarrativeScore {
  threeAct: number; // 0-10 Suitability
  nonLinear: number;
  circular: number;
  interactive: number;
}

export interface NarrativeResponse {
  scores: NarrativeScore;
  analysis: string;
}
