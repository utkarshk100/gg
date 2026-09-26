export type StyleMode = 'punchy' | 'storytelling' | 'listicle' | 'contrarian';
export type DraftStatus = 'generated' | 'copied' | 'discarded';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  industry: string | null;
  onboarding_completed: boolean;
  created_at: string;
  content_pillars: string[];
}

export interface VoiceSample {
  id: string;
  sample_text: string;
  created_at: string;
}

export interface StyleTraits {
  tone: string;
  sentence_length: string;
  formality: string;
  hook_pattern: string;
  structural_habits: string[];
  emoji_usage: string;
}

export interface VoiceProfile {
  traits: StyleTraits | null;
  analyzed_at: string | null;
  is_stale: boolean;
}

export interface Inspiration {
  id: string;
  name: string;
  created_at: string;
  samples: { id: string; sample_text: string }[];
}

export interface Draft {
  id: string;
  one_liner: string;
  style_mode: StyleMode;
  post_text: string;
  hook_line: string;
  hashtags: string[];
  status: DraftStatus;
  created_at: string;
}
