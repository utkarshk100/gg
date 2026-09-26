import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown, Copy, Flame, Lightbulb, PenLine, Sparkles, Wand2, X } from 'lucide-react';
import { api } from '../lib/api';
import type { Draft, Inspiration, StyleMode } from '../lib/types';
import { EXAMPLE_ONE_LINERS, IDEA_STARTERS, STYLE_MODES, modeLabel } from '../lib/constants';
import { copyToClipboard } from '../lib/clipboard';
import { useUser } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, Card, Chip, StatusPill, cx } from '../components/ui';
import type { ResultsState } from './Results';

const BANNER_KEY = 'postflow:voice-banner-dismissed';

function readDismissed() {
  try {
    return localStorage.getItem(BANNER_KEY) === '1';
  } catch {
    return false;
  }
}

function timeAgo(iso: string) {
  const seconds = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.35, 'week'],
    [12, 'month'],
  ];
  let value = seconds;
  for (const [size, unit] of units) {
    if (value < size) return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-Math.round(value), unit);
    value /= size;
  }
  return new Date(iso).toLocaleDateString();
}

function RecentDraftCard({ draft, onCopied }: { draft: Draft; onCopied: (d: Draft) => void }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);

  async function copy() {
    if (!(await copyToClipboard(draft.post_text))) {
      toast('Could not access the clipboard', 'error');
      return;
    }
    toast('Copied to clipboard');
    if (draft.status !== 'copied') {
      api
        .setDraftStatus(draft.id, 'copied')
        .then(({ draft }) => onCopied(draft))
        .catch(() => {});
    }
  }

  return (
    <Card className="flex flex-col p-4 transition-shadow hover:shadow-lift">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="text-xs font-bold tracking-wide text-accent-700 uppercase">{modeLabel(draft.style_mode)}</span>
        <StatusPill status={draft.status} />
      </div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex-1 text-left"
        title={open ? 'Collapse' : 'Show full draft'}
      >
        <p className={cx('text-sm leading-relaxed whitespace-pre-line text-ink', !open && 'line-clamp-2')}>{draft.post_text}</p>
      </button>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/70 pt-3">
        <span className="truncate text-xs text-subtle" title={draft.one_liner}>
          {timeAgo(draft.created_at)}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-accent-700 hover:bg-accent-50"
        >
          <Copy className="h-3.5 w-3.5" /> Copy
        </button>
      </div>
    </Card>
  );
}

export function Dashboard() {
  const user = useUser();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [oneLiner, setOneLiner] = useState('');
  const [mode, setMode] = useState<StyleMode>('punchy');
  const [inspirationId, setInspirationId] = useState('');
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [voiceSampleCount, setVoiceSampleCount] = useState<number | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(readDismissed);
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [weekCount, setWeekCount] = useState<number | null>(null);
  const [pendingCursor, setPendingCursor] = useState(false);

  useEffect(() => {
    api.listInspirations().then(({ inspirations }) => setInspirations(inspirations)).catch(() => {});
    api.listVoiceSamples().then(({ samples }) => setVoiceSampleCount(samples.length)).catch(() => {});
    api.recentDrafts(12).then(({ drafts }) => setDrafts(drafts)).catch(() => setDrafts([]));
    api.draftStats().then(({ last_7_days }) => setWeekCount(last_7_days)).catch(() => {});
  }, []);

  // Place the caret at the end after an idea starter fills the input.
  useEffect(() => {
    if (!pendingCursor || !inputRef.current) return;
    const el = inputRef.current;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
    el.scrollLeft = el.scrollWidth;
    setPendingCursor(false);
  }, [pendingCursor, oneLiner]);

  function startGeneration(text: string) {
    const trimmed = text.trim();
    if (trimmed.length < 3) {
      inputRef.current?.focus();
      return;
    }
    const inspiration = inspirations.find((i) => i.id === inspirationId);
    const state: ResultsState = {
      one_liner: trimmed,
      mode,
      inspiration_id: inspiration?.id ?? null,
      inspiration_name: inspiration?.name ?? null,
    };
    navigate('/results', { state });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    startGeneration(oneLiner);
  }

  function tryExample() {
    const pool = EXAMPLE_ONE_LINERS.filter((x) => x !== oneLiner);
    const example = pool[Math.floor(Math.random() * pool.length)];
    setOneLiner(example);
    startGeneration(example);
  }

  function dismissBanner() {
    setBannerDismissed(true);
    try {
      localStorage.setItem(BANNER_KEY, '1');
    } catch {
      /* storage unavailable — dismissal lasts for this visit only */
    }
  }

  const firstName = user.name?.split(' ')[0];

  return (
    <div className="space-y-8 sm:space-y-10">
      {voiceSampleCount === 0 && !bannerDismissed && (
        <div className="flex items-center gap-3 rounded-xl border border-accent-200 bg-accent-50 py-2.5 pr-2 pl-4 text-sm text-accent-800">
          <Wand2 className="h-4 w-4 shrink-0" />
          <Link to="/voice" className="flex-1 font-medium hover:underline">
            Add 2 quick writing samples to make your posts sound more like you →
          </Link>
          <button type="button" onClick={dismissBanner} aria-label="Dismiss" className="rounded-lg p-1.5 hover:bg-accent-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <section>
        <h1 className="text-2xl font-bold tracking-tight sm:text-[32px]">
          {firstName ? `What are we writing today, ${firstName}?` : 'What are we writing today?'}
        </h1>
        <p className="mt-1.5 text-[15px] text-muted">One line in. Three LinkedIn-ready drafts out, in your voice.</p>

        <Card className="mt-6 p-4 sm:p-6">
          <form onSubmit={onSubmit}>
            <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
              {IDEA_STARTERS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => {
                    setOneLiner(s.prompt);
                    setPendingCursor(true);
                  }}
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-canvas px-3.5 text-[13px] font-medium text-muted ring-1 ring-line transition-colors hover:text-accent-700 hover:ring-accent-200"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  {s.label}
                </button>
              ))}
            </div>

            <label htmlFor="one-liner" className="sr-only">
              What's on your mind?
            </label>
            <div className="relative">
              <PenLine className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-subtle" />
              <input
                id="one-liner"
                ref={inputRef}
                type="text"
                value={oneLiner}
                maxLength={500}
                onChange={(e) => setOneLiner(e.target.value)}
                placeholder="What's on your mind?"
                autoComplete="off"
                className="h-14 w-full rounded-xl border border-line bg-surface pr-4 pl-12 text-base text-ink placeholder:text-subtle focus:border-accent-500 focus:ring-4 focus:ring-accent-100 focus:outline-none sm:text-[17px]"
              />
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="mb-2 text-xs font-semibold tracking-wide text-subtle uppercase" id="style-label">
                  Style
                </p>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="style-label">
                  {STYLE_MODES.map((m) => (
                    <Chip
                      key={m.id}
                      role="radio"
                      aria-checked={mode === m.id}
                      active={mode === m.id}
                      onClick={() => setMode(m.id)}
                      title={m.hint}
                    >
                      {mode === m.id && <Check className="h-3.5 w-3.5" />}
                      {m.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="lg:w-64">
                <label htmlFor="inspiration" className="mb-2 block text-xs font-semibold tracking-wide text-subtle uppercase">
                  Blend in inspiration style
                </label>
                <div className="relative">
                  <select
                    id="inspiration"
                    value={inspirationId}
                    onChange={(e) => setInspirationId(e.target.value)}
                    className="h-10 w-full appearance-none rounded-xl border border-line bg-surface pr-9 pl-3.5 text-sm font-medium text-ink focus:border-accent-500 focus:ring-4 focus:ring-accent-100 focus:outline-none"
                  >
                    <option value="">My voice only</option>
                    {inspirations.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-subtle" />
                </div>
                {inspirations.length === 0 && (
                  <Link to="/inspirations" className="mt-1.5 inline-block text-xs font-medium text-accent-700 hover:underline">
                    + Add a creator you admire
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="ghost" icon={<Sparkles className="h-4 w-4" />} onClick={tryExample} className="order-2 sm:order-1">
                Try an example
              </Button>
              <Button type="submit" size="lg" className="order-1 sm:order-2" disabled={oneLiner.trim().length < 3}>
                Generate Post <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-lg font-semibold">Recent drafts</h2>
          {weekCount !== null && (
            <p className="flex items-center gap-1.5 text-sm text-muted">
              <Flame className={cx('h-4 w-4', weekCount > 0 ? 'text-orange-500' : 'text-subtle')} />
              You've drafted <span className="font-semibold text-ink">{weekCount}</span> {weekCount === 1 ? 'post' : 'posts'} this week
            </p>
          )}
        </div>

        {drafts === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-36 rounded-2xl" />
            ))}
          </div>
        ) : drafts.length === 0 ? (
          <Card className="px-6 py-10 text-center">
            <p className="font-medium text-ink">No drafts yet</p>
            <p className="mt-1 text-sm text-muted">Type an idea above — or hit “Try an example” to see PostFlow in action.</p>
          </Card>
        ) : (
          <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {drafts.map((d) => (
              <RecentDraftCard
                key={d.id}
                draft={d}
                onCopied={(updated) => setDrafts((all) => all && all.map((x) => (x.id === updated.id ? updated : x)))}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
