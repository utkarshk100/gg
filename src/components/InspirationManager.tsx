import { useEffect, useState } from 'react';
import { Plus, Sparkles, Trash2, UserRound } from 'lucide-react';
import { api } from '../lib/api';
import type { Inspiration } from '../lib/types';
import { useToast } from '../context/ToastContext';
import { Button, Card, ErrorNote, IconButton, Input, Label, Spinner, TextArea } from './ui';

const MAX_INSPIRATIONS = 3;
const MAX_SAMPLES = 3;
const MIN_SAMPLE_SLOTS = 2;

interface CardState {
  key: string;
  saved: Inspiration | null;
}

const padSamples = (samples: string[]) => [...samples, ...Array(Math.max(0, MIN_SAMPLE_SLOTS - samples.length)).fill('')];

function InspirationCard({
  index,
  saved,
  onSaved,
  onRemove,
}: {
  index: number;
  saved: Inspiration | null;
  onSaved: (i: Inspiration) => void;
  onRemove: () => void;
}) {
  const toast = useToast();
  const initialSamples = padSamples(saved?.samples.map((s) => s.sample_text) ?? []);
  const [name, setName] = useState(saved?.name ?? '');
  const [samples, setSamples] = useState<string[]>(initialSamples);
  const [busy, setBusy] = useState<'save' | 'delete' | null>(null);
  const [error, setError] = useState('');

  const filled = samples.map((s) => s.trim()).filter(Boolean);
  const dirty =
    !saved ||
    name.trim() !== saved.name ||
    JSON.stringify(filled) !== JSON.stringify(saved.samples.map((s) => s.sample_text.trim()));
  const canSave = name.trim().length > 0 && filled.length > 0 && dirty;

  async function save() {
    setBusy('save');
    setError('');
    try {
      const { inspiration } = saved
        ? await api.updateInspiration(saved.id, name, filled)
        : await api.createInspiration(name, filled);
      onSaved(inspiration);
      setSamples(padSamples(inspiration.samples.map((s) => s.sample_text)));
      toast(saved ? 'Inspiration updated' : `${inspiration.name} added to your library`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (saved && !window.confirm(`Remove ${saved.name} from your inspirations?`)) return;
    if (!saved) return onRemove();
    setBusy('delete');
    try {
      await api.deleteInspiration(saved.id);
      toast('Inspiration removed', 'info');
      onRemove();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete');
      setBusy(null);
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-50 text-accent-700">
            <UserRound className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold tracking-wide text-subtle uppercase">Inspiration {index + 1}</p>
            <p className="font-semibold text-ink">{saved?.name || name.trim() || 'New creator'}</p>
          </div>
        </div>
        <IconButton label={saved ? 'Delete inspiration' : 'Remove card'} onClick={remove} disabled={busy !== null}>
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor={`insp-name-${index}`}>Creator name or nickname</Label>
          <Input
            id={`insp-name-${index}`}
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Justin W., or “the storyteller”"
          />
        </div>
        {samples.map((s, i) => (
          <div key={i}>
            <Label htmlFor={`insp-${index}-sample-${i}`} hint={i >= MIN_SAMPLE_SLOTS ? 'Optional' : undefined}>
              Sample post {i + 1}
            </Label>
            <div className="flex items-start gap-2">
              <TextArea
                id={`insp-${index}-sample-${i}`}
                value={s}
                onChange={(e) => setSamples(samples.map((x, j) => (j === i ? e.target.value : x)))}
                placeholder="Paste one of their LinkedIn posts…"
                className="min-h-32"
              />
              {samples.length > MIN_SAMPLE_SLOTS && (
                <IconButton label={`Remove sample ${i + 1}`} onClick={() => setSamples(samples.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && <div className="mt-4"><ErrorNote>{error}</ErrorNote></div>}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        {samples.length < MAX_SAMPLES ? (
          <Button variant="ghost" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setSamples([...samples, ''])}>
            Add a third sample
          </Button>
        ) : (
          <span />
        )}
        <Button onClick={save} disabled={!canSave} loading={busy === 'save'}>
          {saved ? (dirty ? 'Save changes' : 'Saved') : 'Save inspiration'}
        </Button>
      </div>
    </Card>
  );
}

export function InspirationManager() {
  const [cards, setCards] = useState<CardState[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .listInspirations()
      .then(({ inspirations }) =>
        setCards(
          inspirations.length
            ? inspirations.map((i) => ({ key: i.id, saved: i }))
            : // Start with one empty card so there's an obvious place to begin.
              [{ key: crypto.randomUUID(), saved: null }],
        ),
      )
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!cards) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const addCard = () => setCards([...cards, { key: crypto.randomUUID(), saved: null }]);

  return (
    <div>
      <p className="mb-6 flex items-start gap-2 rounded-xl bg-accent-50 px-4 py-3 text-sm leading-relaxed text-accent-800">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
        Add one creator you admire, or up to three to blend different styles. We learn structure and rhythm, never copy their ideas.
      </p>

      {cards.length === 0 && (
        <Card className="flex flex-col items-center px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-50 text-accent-700">
            <UserRound className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">No inspirations yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Add a LinkedIn creator whose posts you love. We'll borrow their hook style and formatting — never their words.
          </p>
          <Button className="mt-6" icon={<Plus className="h-4 w-4" />} onClick={addCard}>
            Add your first inspiration
          </Button>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {cards.map((c, i) => (
          <InspirationCard
            key={c.key}
            index={i}
            saved={c.saved}
            onSaved={(saved) => setCards((cs) => cs!.map((x) => (x.key === c.key ? { ...x, saved } : x)))}
            onRemove={() => setCards((cs) => cs!.filter((x) => x.key !== c.key))}
          />
        ))}
      </div>

      {cards.length > 0 && cards.length < MAX_INSPIRATIONS && (
        <button
          type="button"
          onClick={addCard}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line py-5 text-sm font-semibold text-muted transition-colors hover:border-accent-500 hover:text-accent-700"
        >
          <Plus className="h-4 w-4" />
          Add another inspiration (optional)
        </button>
      )}
      {cards.length >= MAX_INSPIRATIONS && (
        <p className="mt-5 text-center text-sm text-subtle">That's the max of three — blend away.</p>
      )}
    </div>
  );
}
