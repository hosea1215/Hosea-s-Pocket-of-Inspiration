
export enum AppView {
  STRATEGY = 'STRATEGY',
  GOOGLE_ADS_STRATEGY = 'GOOGLE_ADS_STRATEGY',
  TIKTOK_ADS_STRATEGY = 'TIKTOK_ADS_STRATEGY',
  APPLE_ADS_STRATEGY = 'APPLE_ADS_STRATEGY',
  APPLOVIN_STRATEGY = 'APPLOVIN_STRATEGY',
  PRE_INSTALL_STRATEGY = 'PRE_INSTALL_STRATEGY',
  WEB2APP_STRATEGY = 'WEB2APP_STRATEGY',
  GEO_LIFT_STRATEGY = 'GEO_LIFT_STRATEGY',
  OMNICHANNEL_STRATEGY = 'OMNICHANNEL_STRATEGY',
  ASO_KEYWORDS = 'ASO_KEYWORDS',
  CPE_GEN = 'CPE_GEN',
  MARKETING_CALENDAR = 'MARKETING_CALENDAR',
  CREATIVE = 'CREATIVE',
  IMAGE_REPLICATION = 'IMAGE_REPLICATION',
  IMAGE_COMPOSITION = 'IMAGE_COMPOSITION',
  VIDEO_ANALYZER = 'VIDEO_ANALYZER',
  PLAYABLE_REPLICATION = 'PLAYABLE_REPLICATION',
  ICON_GEN = 'ICON_GEN',
  COPY_GEN = 'COPY_GEN',
  GAME_QUALITY_CHECKLIST = 'GAME_QUALITY_CHECKLIST',
  GOOGLE_PLAY_CHECKLIST = 'GOOGLE_PLAY_CHECKLIST',
  APPSTORE_CHECKLIST = 'APPSTORE_CHECKLIST',
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
  PERSONALIZATION_AB = 'PERSONALIZATION_AB',
  GAME_K_LINE = 'GAME_K_LINE',
  STORE_COMPARISON = 'STORE_COMPARISON',
  PUSH_STRATEGY = 'PUSH_STRATEGY',
  LIVEOPS_GEN = 'LIVEOPS_GEN',
  IAA_MONETIZATION = 'IAA_MONETIZATION',
  IAA_BIDDING = 'IAA_BIDDING',
  IAP_MONETIZATION = 'IAP_MONETIZATION',
  IAP_PRICING = 'IAP_PRICING',
  AI_NEWS = 'AI_NEWS',
  GOOGLE_PLAY_NEWS = 'GOOGLE_PLAY_NEWS',
  APPSTORE_NEWS = 'APPSTORE_NEWS',
  GOOGLE_ADS_NEWS = 'GOOGLE_ADS_NEWS',
  FACEBOOK_ADS_NEWS = 'FACEBOOK_ADS_NEWS',
  ADMOB_NEWS = 'ADMOB_NEWS',
  TIKTOK_ADS_NEWS = 'TIKTOK_ADS_NEWS',
  APPLE_SEARCH_ADS_NEWS = 'APPLE_SEARCH_ADS_NEWS',
  APPLOVIN_NEWS = 'APPLOVIN_NEWS',
  APPSFLYER_NEWS = 'APPSFLYER_NEWS',
  JSON_ANALYZER = 'JSON_ANALYZER',
  CURIOUS_MIND = 'CURIOUS_MIND',
  SETTINGS = 'SETTINGS',
}

export interface AiMetadata {
  model: string;
  sources?: { title: string; url: string }[];
  reasoning?: string;
  prompt?: string;
}

export interface AiResponse<T> {
  data: T;
  meta: AiMetadata;
}

export interface PushNotification {
  title: string;
  body: string;
  emoji: string;
  translation: string; 
  timing: string; 
  triggerCondition?: string; 
}

export interface PushStrategySection {
  category: string; 
  notifications: PushNotification[];
}

export type PushStrategyResponse = PushStrategySection[];

export interface MetricData {
  day: string;
  spend: number;
  installs: number;
  cpi: number;
}

export interface GameDetails {
  name: string;
  genre: string;
  targetAudience: string;
  budget: number;
  market: string;
  usp: string;
  gameplay?: string;
  promotionGoal: string;
  promotionPurpose: string;
  storeUrl?: string;
}

export interface AdCreative {
  id: string;
  imageUrl: string;
  imagePrompt?: string;
  imagePromptZh?: string;
  copy: string;
  headline: string;
  cta: string;
}

export interface AppIcon {
  id: string;
  imageUrl: string;
  prompt: string;
  style: string;
}

export interface CopyVariant {
  id: string;
  sourceText: string; 
  targetText: string; 
}

export interface CpeEvent {
  id: string;
  eventName: string;
  difficulty?: string;
  estimatedTime?: string;
  descriptionZh: string;
  descriptionEn: string;
  completionRate?: string;
  timeLimit?: string;
  uaValueZh?: string;
  uaValueEn?: string;
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
  organicRatio: number;
  dailyUa: number;
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
  age: string;
  gender: string;
  countries: string[];
  occupation: string[];
  income: string;
  interests: string[];
  relationship: string;
}

export interface MarketPerformance {
  financialTrends: { month: string; downloads: number; revenue: number }[];
  rankingHistory: { month: string; freeRank: number; grossingRank: number }[];
  genderDistribution: { name: string; value: number }[];
  ageDistribution: { name: string; value: number }[];
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
  gameEvents: string;
  branding: string;
  community: string;
  ipPotential: string;
  techStack: string;
  localization: string;
  userReviews: string;
  swot: string;
}

export interface StoreComparisonResponse {
  game1Name: string;
  game2Name: string;
  comparisonTable: {
    dimension: string;
    game1Content: string;
    game2Content: string;
    winner: string;
    insight: string;
  }[];
  detailedAnalysis: string;
}

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

export interface SkinnerBoxResponse {
  analysis: string;
  schedules: {
    fixedRatio: string;
    variableRatio: string;
    fixedInterval: string;
    variableInterval: string;
  };
}

export interface DopamineLoopResponse {
  analysis: string;
  loop: {
    goal: string;
    reward: string;
    feedback: string;
  };
}

export interface BartleResponse {
  analysis: string;
  scores: {
    achievers: number;
    explorers: number;
    socializers: number;
    killers: number;
  };
}

export interface NarrativeResponse {
  analysis: string;
  scores: {
    threeAct: number;
    nonLinear: number;
    circular: number;
    interactive: number;
  };
}

export interface MarketingCalendarData {
  month: string;
  keyEvent: string;
  intensity: number;
  historicalRoas: number;
  historicalCtr: number;
  pastCampaignInsight: string;
}

export interface StoryboardShot {
  id: string;
  shotNumber: number;
  description: string;
  audio: string;
  visualPrompt: string;
  generatedImageUrl?: string;
  generatedVideoUrl?: string;
}

export interface VideoAnalysisResponse {
  script: string;
  storyboard: StoryboardShot[];
}
