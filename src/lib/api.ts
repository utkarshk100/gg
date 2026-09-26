import type { Draft, Inspiration, StyleMode, User, VoiceProfile, VoiceSample } from './types';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Is it running?');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && path !== '/auth/me' && !path.startsWith('/auth/')) {
      window.dispatchEvent(new Event('postflow:unauthorized'));
    }
    throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

const get = <T>(p: string) => request<T>('GET', p);
const post = <T>(p: string, b?: unknown) => request<T>('POST', p, b ?? {});
const put = <T>(p: string, b: unknown) => request<T>('PUT', p, b);
const patch = <T>(p: string, b: unknown) => request<T>('PATCH', p, b);
const del = <T>(p: string) => request<T>('DELETE', p);

export interface ProfileUpdate {
  name?: string | null;
  role?: string | null;
  industry?: string | null;
  content_pillars?: string[];
  onboarding_completed?: boolean;
}

export interface GenerateRequest {
  one_liner: string;
  selected_modes?: StyleMode[];
  regenerate_single_mode?: StyleMode;
  inspiration_id?: string | null;
  replace_draft_id?: string;
}

export const api = {
  signup: (email: string, password: string) => post<{ user: User }>('/auth/signup', { email, password }),
  login: (email: string, password: string) => post<{ user: User }>('/auth/login', { email, password }),
  logout: () => post<{ ok: true }>('/auth/logout'),
  me: () => get<{ user: User }>('/auth/me'),

  getProfile: () => get<{ user: User }>('/profile'),
  updateProfile: (body: ProfileUpdate) => put<{ user: User }>('/profile', body),

  listVoiceSamples: () => get<{ samples: VoiceSample[] }>('/voice-samples'),
  addVoiceSample: (sample_text: string) => post<{ sample: VoiceSample }>('/voice-samples', { sample_text }),
  updateVoiceSample: (id: string, sample_text: string) => put<{ ok: true }>(`/voice-samples/${id}`, { sample_text }),
  deleteVoiceSample: (id: string) => del<{ ok: true }>(`/voice-samples/${id}`),

  getVoiceProfile: () => get<VoiceProfile>('/voice-profile'),
  analyzeVoice: () => post<VoiceProfile>('/voice-profile/analyze'),

  listInspirations: () => get<{ inspirations: Inspiration[] }>('/inspirations'),
  createInspiration: (name: string, samples: string[]) =>
    post<{ inspiration: Inspiration }>('/inspirations', { name, samples }),
  updateInspiration: (id: string, name: string, samples: string[]) =>
    put<{ inspiration: Inspiration }>(`/inspirations/${id}`, { name, samples }),
  deleteInspiration: (id: string) => del<{ ok: true }>(`/inspirations/${id}`),

  generate: (body: GenerateRequest) => post<{ variants: Draft[] }>('/generate', body),

  recentDrafts: (limit = 12) => get<{ drafts: Draft[] }>(`/drafts/recent?limit=${limit}`),
  draftStats: () => get<{ last_7_days: number }>('/drafts/stats'),
  setDraftStatus: (id: string, status: 'copied' | 'discarded', post_text?: string) =>
    patch<{ draft: Draft }>(`/drafts/${id}/status`, { status, post_text }),
  updateDraftText: (id: string, post_text: string) => patch<{ ok: true }>(`/drafts/${id}`, { post_text }),
  /** Fire-and-forget discard that survives page unloads. */
  discardDraftsBeacon: (ids: string[]) => {
    if (!ids.length) return;
    const payload = JSON.stringify({ ids });
    const sent =
      typeof navigator.sendBeacon === 'function' &&
      navigator.sendBeacon('/api/drafts/discard', new Blob([payload], { type: 'application/json' }));
    if (!sent) {
      void fetch('/api/drafts/discard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  },
};
