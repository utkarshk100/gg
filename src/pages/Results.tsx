import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Copy, ExternalLink, PencilLine, RefreshCw, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import type { Draft, StyleMode } from '../lib/types';
import { LINKEDIN_FEED_URL, modeLabel, modesForGeneration } from '../lib/constants';
import { copyToClipboard } from '../lib/clipboard';
import { useUser } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LinkedInPostCard, PostBody } from '../components/LinkedInPostCard';
import { Button, ErrorNote, IconButton, StatusPill, TextArea, cx } from '../components/ui';

export interface ResultsState {
  one_liner: string;
  mode: StyleMode;
  inspiration_id: string | null;
  inspiration_name?: string | null;
}

interface CardState {
  draft: Draft;
  text: string;
  editing: boolean;
  regenerating: boolean;
}

const openLinkedIn = () => window.open(LINKEDIN_FEED_URL, '_blank', 'noopener,noreferrer');

function SkeletonCard({ mode }: { mode: StyleMode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line/70 bg-surface shadow-card">
      <div className="border-b border-line/70 bg-canvas/60 px-4 py-3 text-xs font-semibold text-subtle">{modeLabel(mode)}</div>
      <div className="flex items-center gap-3 p-4">
        <span className="skeleton h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <span className="skeleton block h-3 w-1/3 rounded" />
          <span className="skeleton block h-2.5 w-1/2 rounded" />
        </div>
      </div>
      <div className="space-y-2.5 px-4 pb-6">
        {[92, 70, 0, 85, 96, 60, 0, 78, 45].map((w, i) =>
          w ? <span key={i} className="skeleton block h-3 rounded" style={{ width: `${w}%` }} /> : <span key={i} className="block h-2" />,
        )}
      </div>
    </div>
  );
}

export function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useUser();
  const toast = useToast();
  const request = location.state as ResultsState | null;

  const [cards, setCards] = useState<CardState[] | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const cardsRef = useRef<CardState[] | null>(null);
  cardsRef.current = cards;
  const startedAttempt = useRef(-1);

  const modes = request ? modesForGeneration(request.mode) : [];

  // Generate once per attempt.
  useEffect(() => {
    if (!request || startedAttempt.current === attempt) return;
    startedAttempt.current = attempt;
    setError('');
    setCards(null);
    api
      .generate({
        one_liner: request.one_liner,
        selected_modes: modesForGeneration(request.mode),
        inspiration_id: request.inspiration_id,
      })
      .then(({ variants }) =>
        setCards(variants.map((draft) => ({ draft, text: draft.post_text, editing: false, regenerating: false }))),
      )
      .catch((err) => setError(err instanceof Error ? err.message : 'Generation failed'));
  }, [request, attempt]);

  // Anything not copied when the user leaves this screen is marked "discarded".
  useEffect(() => {
    const discardUncopied = () => {
      const ids = (cardsRef.current ?? []).filter((c) => c.draft.status === 'generated').map((c) => c.draft.id);
      api.discardDraftsBeacon(ids);
    };
    window.addEventListener('pagehide', discardUncopied);
    return () => {
      window.removeEventListener('pagehide', discardUncopied);
      discardUncopied();
    };
  }, []);

  const patchCard = useCallback((id: string, patch: Partial<CardState>) => {
    setCards((cs) => cs && cs.map((c) => (c.draft.id === id ? { ...c, ...patch } : c)));
  }, []);

  if (!request) return <Navigate to="/" replace />;

  async function copy(card: CardState) {
    const text = card.text.trim();
    const ok = await copyToClipboard(text);
    if (!ok) {
      toast('Could not access the clipboard — select the text and copy it manually.', 'error');
      return;
    }
    toast('Copied! Opening LinkedIn...');
    openLinkedIn();
    try {
      const { draft } = await api.setDraftStatus(card.draft.id, 'copied', text !== card.draft.post_text ? text : undefined);
      patchCard(card.draft.id, { draft, editing: false });
    } catch (err) {
      console.error(err);
    }
  }

  async function finishEditing(card: CardState) {
    const text = card.text.trim();
    if (!text) {
      toast('A post needs some text', 'error');
      return;
    }
    patchCard(card.draft.id, { editing: false, text });
    if (text === card.draft.post_text) return;
    try {
      await api.updateDraftText(card.draft.id, text);
      patchCard(card.draft.id, { draft: { ...card.draft, post_text: text } });
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save your edit', 'error');
    }
  }

  async function regenerate(card: CardState) {
    patchCard(card.draft.id, { regenerating: true, editing: false });
    try {
      const { variants } = await api.generate({
        one_liner: request!.one_liner,
        regenerate_single_mode: card.draft.style_mode,
        inspiration_id: request!.inspiration_id,
        replace_draft_id: card.draft.id,
      });
      const fresh = variants[0];
      setCards(
        (cs) =>
          cs &&
          cs.map((c) =>
            c.draft.id === card.draft.id ? { draft: fresh, text: fresh.post_text, editing: false, regenerating: false } : c,
          ),
      );
      toast(`New ${modeLabel(fresh.style_mode).toLowerCase()} version ready`, 'info');
    } catch (err) {
      patchCard(card.draft.id, { regenerating: false });
      toast(err instanceof Error ? err.message : 'Could not regenerate', 'error');
    }
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </button>
        <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">
          {cards ? 'Your drafts are ready' : error ? 'Something went wrong' : 'Writing your drafts…'}
        </h1>
        <p className="mt-2 max-w-3xl text-[15px] text-muted">
          <span className="font-medium text-ink">“{request.one_liner}”</span>
          {request.inspiration_name && <> · structure inspired by {request.inspiration_name}</>}
        </p>
      </div>

      {error ? (
        <div className="max-w-xl space-y-4">
          <ErrorNote>{error}</ErrorNote>
          <div className="flex gap-2">
            <Button icon={<RefreshCw className="h-4 w-4" />} onClick={() => setAttempt((a) => a + 1)}>
              Try again
            </Button>
            <Button variant="secondary" onClick={() => navigate('/')}>
              Edit my idea
            </Button>
          </div>
        </div>
      ) : !cards ? (
        <>
          <p className="mb-5 flex items-center gap-2 text-sm font-medium text-accent-700">
            <Sparkles className="h-4 w-4 animate-pulse" /> Matching your voice and drafting three takes. This usually takes 10–20 seconds.
          </p>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {modes.map((m) => (
              <SkeletonCard key={m} mode={m} />
            ))}
          </div>
        </>
      ) : (
        <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <LinkedInPostCard
              key={card.draft.id}
              user={user}
              label={
                <>
                  <span className="text-xs font-bold tracking-wide text-accent-700 uppercase">{modeLabel(card.draft.style_mode)}</span>
                  <div className="flex items-center gap-1">
                    {card.draft.status === 'copied' && <StatusPill status="copied" />}
                    <IconButton
                      label={card.editing ? 'Done editing' : 'Edit'}
                      onClick={() => (card.editing ? finishEditing(card) : patchCard(card.draft.id, { editing: true }))}
                      disabled={card.regenerating}
                      className={cx('h-8 w-8', card.editing && 'bg-accent-50 text-accent-700')}
                    >
                      {card.editing ? <Check className="h-4 w-4" /> : <PencilLine className="h-4 w-4" />}
                    </IconButton>
                    <IconButton label="Regenerate" onClick={() => regenerate(card)} disabled={card.regenerating} className="h-8 w-8">
                      <RefreshCw className={cx('h-4 w-4', card.regenerating && 'animate-spin')} />
                    </IconButton>
                  </div>
                </>
              }
              footer={
                <div className="flex flex-col gap-2">
                  <Button
                    size="lg"
                    className="w-full"
                    icon={card.draft.status === 'copied' ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    onClick={() => copy(card)}
                    disabled={card.regenerating}
                  >
                    {card.draft.status === 'copied' ? 'Copy again' : 'Copy Text'}
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full" onClick={openLinkedIn} icon={<ExternalLink className="h-3.5 w-3.5" />}>
                    Open LinkedIn
                  </Button>
                </div>
              }
            >
              {card.regenerating ? (
                <div className="space-y-2.5 py-1">
                  {[90, 75, 0, 88, 60, 0, 80].map((w, i) =>
                    w ? <span key={i} className="skeleton block h-3 rounded" style={{ width: `${w}%` }} /> : <span key={i} className="block h-2" />,
                  )}
                </div>
              ) : card.editing ? (
                <div>
                  <TextArea
                    autoFocus
                    value={card.text}
                    onChange={(e) => patchCard(card.draft.id, { text: e.target.value })}
                    className="min-h-80 text-[14.5px]"
                    aria-label={`Edit ${modeLabel(card.draft.style_mode)} draft`}
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-subtle">
                    <span className={cx(card.text.length > 3000 && 'font-semibold text-red-600')}>{card.text.length}/3000</span>
                    <button type="button" onClick={() => finishEditing(card)} className="font-semibold text-accent-700 hover:underline">
                      Done editing
                    </button>
                  </div>
                </div>
              ) : (
                <PostBody text={card.text} />
              )}
            </LinkedInPostCard>
          ))}
        </div>
      )}
    </div>
  );
}
