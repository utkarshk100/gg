export type VariantType = 'punchy' | 'story' | 'listicle';

export interface PostVariant {
  type: VariantType;
  title: string;
  badge: string;
  hook: string;
  body: string[];
  takeaway: string;
  charCount: number;
  gradeLevel: string;
  estimatedDwellSec: number;
}

export interface CreatorCadence {
  id: string;
  name: string;
  tagline: string;
  hookFramework: string;
  tensionScore: number;
  cadenceVariance: number;
  dwellProbability: number;
}

export interface ThoughtPreset {
  id: string;
  title: string;
  rawText: string;
  cadenceId: string;
  variants: Record<VariantType, PostVariant>;
}

export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  popular?: boolean;
  features: string[];
  ctaText: string;
  badge?: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  highlight: string;
  name: string;
  title: string;
  company: string;
  avatarUrl: string;
  rating: number;
}
