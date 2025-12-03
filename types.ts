
export enum AppView {
  STRATEGY = 'STRATEGY',
  CREATIVE = 'CREATIVE',
  ICON_GEN = 'ICON_GEN',
  COPY_GEN = 'COPY_GEN',
  CPE_GEN = 'CPE_GEN',
  ASMR_RESEARCH = 'ASMR_RESEARCH',
  ABACR_LOOP = 'ABACR_LOOP',
  LTV_CALCULATOR = 'LTV_CALCULATOR',
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
