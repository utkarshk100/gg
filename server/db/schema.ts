import type { Generated } from 'kysely';

export type DraftStatus = 'generated' | 'copied' | 'discarded';
export type StyleMode = 'punchy' | 'storytelling' | 'listicle' | 'contrarian';

export interface UsersTable {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  role: string | null;
  industry: string | null;
  onboarding_completed: Generated<number>;
  created_at: string;
}

export interface ContentPillarsTable {
  id: string;
  user_id: string;
  topic: string;
}

export interface VoiceSamplesTable {
  id: string;
  user_id: string;
  sample_text: string;
  created_at: string;
}

export interface VoiceProfilesTable {
  user_id: string;
  traits_json: string;
  samples_hash: string;
  analyzed_at: string;
}

export interface InspirationsTable {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface InspirationSamplesTable {
  id: string;
  inspiration_id: string;
  sample_text: string;
}

export interface DraftsTable {
  id: string;
  user_id: string;
  one_liner: string;
  style_mode: StyleMode;
  post_text: string;
  hook_line: string;
  hashtags_json: string;
  status: DraftStatus;
  created_at: string;
}

export interface Database {
  users: UsersTable;
  content_pillars: ContentPillarsTable;
  voice_samples: VoiceSamplesTable;
  voice_profiles: VoiceProfilesTable;
  inspirations: InspirationsTable;
  inspiration_samples: InspirationSamplesTable;
  drafts: DraftsTable;
}
