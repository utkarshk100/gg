import type { StyleMode } from './types';

export const STYLE_MODES: { id: StyleMode; label: string; hint: string }[] = [
  { id: 'punchy', label: 'Punchy', hint: 'Short and high-impact' },
  { id: 'storytelling', label: 'Storytelling', hint: 'A narrative with a takeaway' },
  { id: 'listicle', label: 'Listicle', hint: 'Structured around a list' },
  { id: 'contrarian', label: 'Contrarian', hint: 'Challenges a common assumption' },
];

export const modeLabel = (m: StyleMode) => STYLE_MODES.find((s) => s.id === m)?.label ?? m;

/** The chosen mode leads; the next two modes fill out the three variants. */
export function modesForGeneration(primary: StyleMode): StyleMode[] {
  const ids = STYLE_MODES.map((m) => m.id);
  const start = ids.indexOf(primary);
  return [0, 1, 2].map((offset) => ids[(start + offset) % ids.length]);
}

export const IDEA_STARTERS = [
  { label: 'Something I shipped', prompt: 'Something I shipped recently: ' },
  { label: 'A lesson I learned', prompt: 'A lesson I learned when ' },
  { label: 'A mistake I made', prompt: 'A mistake I made was ' },
  { label: 'An opinion I hold', prompt: 'An opinion I hold that most people disagree with: ' },
];

export const EXAMPLE_ONE_LINERS = [
  'A lesson I learned when our first launch got zero signups',
  'Why I stopped scheduling meetings before 11am',
  'The best feedback I ever got came from a customer who churned',
  'A mistake I made hiring for experience instead of curiosity',
  'Shipping a smaller feature on time beat shipping the perfect one late',
];

export const LINKEDIN_FEED_URL = 'https://www.linkedin.com/feed/';
