import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, RefreshCw, Trash2, Wand2 } from 'lucide-react';
import { api } from '../lib/api';
import type { StyleTraits, VoiceProfile as VoiceProfileData, VoiceSample } from '../lib/types';
import { useToast } from '../context/ToastContext';
import { InspirationManager } from '../components/InspirationManager';
import { Button, Card, ErrorNote, IconButton, PageHeader, Spinner, TextArea, cx } from '../components/ui';

const MAX_SAMPLES = 5;
const MIN_LENGTH = 20;

function SampleRow({
  index,
  sample,
  onSaved,
  onDeleted,
}: {
  index: number;
  sample: VoiceSample;
  onSaved: (text: string) => void;
  onDeleted: () => void;
}) {
  const toast = useToast();
  const [text, setText] = useState(sample.sample_text);
  const [busy, setBusy] = useState(false);
  const dirty = text.trim() !== sample.sample_text;

  async function save() {
    setBusy(true);
    try {
      await api.updateVoiceSample(sample.id, text.trim());
      onSaved(text.trim());
      toast('Sample updated');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm('Delete this writing sample?')) return;
    setBusy(true);
    try {
      await api.deleteVoiceSample(sample.id);
      onDeleted();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not delete', 'error');
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium">Sample {index + 1}</span>
        <IconButton label={`Delete sample ${index + 1}`} onClick={remove} disabled={busy}>
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>
      <TextArea value={text} onChange={(e) => setText(e.target.value)} aria-label={`Writing sample ${index + 1}`} />
      {dirty && (
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setText(sample.sample_text)}>
            Cancel
          </Button>
          <Button size="sm" onClick={save} loading={busy} disabled={text.trim().length < MIN_LENGTH}>
            Save
          </Button>
        </div>
      )}
    </div>
  );
}

const TRAIT_LABELS: [keyof Omit<StyleTraits, 'structural_habits'>, string][] = [
  ['tone', 'Tone'],
  ['sentence_length', 'Sentences'],
  ['formality', 'Formality'],
  ['hook_pattern', 'Hooks'],
  ['emoji_usage', 'Emoji'],
];

function StyleSummary({ sampleCount, samplesVersion }: { sampleCount: number; samplesVersion: number }) {
  const toast = useToast();
  const [profile, setProfile] = useState<VoiceProfileData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const autoRan = useRef(false);

  const analyze = useCallback(async () => {
    setAnalyzing(true);
    setError('');
    try {
      setProfile(await api.analyzeVoice());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    api
      .getVoiceProfile()
      .then((p) => {
        setProfile(p);
        // Run the analysis once automatically when samples exist but nothing is cached yet.
        if (!p.traits && sampleCount > 0 && !autoRan.current) {
          autoRan.current = true;
          void analyze();
        }
      })
      .catch((err) => setError(err.message));
    // samplesVersion changes whenever samples are added/edited/removed, refreshing the stale flag.
  }, [samplesVersion, sampleCount, analyze]);

  const traits = profile?.traits;

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-ink">Style Summary</h2>
          <p className="mt-0.5 text-sm text-muted">What Claude picked up from your samples.</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw className={cx('h-3.5 w-3.5', analyzing && 'animate-spin')} />}
          onClick={() => analyze().then(() => toast('Style analysis refreshed'))}
          disabled={analyzing || sampleCount === 0}
        >
          Refresh analysis
        </Button>
      </div>

      {error && <div className="mt-4"><ErrorNote>{error}</ErrorNote></div>}

      {profile?.is_stale && traits && !analyzing && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          Your samples changed since the last analysis — refresh to update.
        </p>
      )}

      <div className="mt-5">
        {analyzing ? (
          <div className="flex flex-wrap gap-2" aria-label="Analyzing your style">
            {[80, 110, 96, 130, 72, 104].map((w, i) => (
              <span key={i} className="skeleton h-8 rounded-full" style={{ width: w }} />
            ))}
          </div>
        ) : traits ? (
          <div className="space-y-4">
            <dl className="flex flex-wrap gap-2">
              {TRAIT_LABELS.map(([key, label]) => (
                <div key={key} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas py-1.5 pr-3.5 pl-3 text-sm">
                  <dt className="text-subtle">{label}</dt>
                  <dd className="font-medium text-ink">{traits[key]}</dd>
                </div>
              ))}
            </dl>
            {traits.structural_habits.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold tracking-wide text-subtle uppercase">Structural habits</p>
                <div className="flex flex-wrap gap-2">
                  {traits.structural_habits.map((h) => (
                    <span key={h} className="rounded-full bg-accent-50 px-3 py-1.5 text-sm font-medium text-accent-700">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {profile?.analyzed_at && (
              <p className="text-xs text-subtle">Last analyzed {new Date(profile.analyzed_at).toLocaleString()}</p>
            )}
          </div>
        ) : (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Wand2 className="h-4 w-4 text-accent-600" />
            {sampleCount === 0
              ? 'Add a writing sample and we’ll analyze your style. Until then, drafts use a neutral professional tone.'
              : 'No analysis yet — hit Refresh analysis.'}
          </p>
        )}
      </div>
    </Card>
  );
}

function MyVoiceTab() {
  const toast = useToast();
  const [samples, setSamples] = useState<VoiceSample[] | null>(null);
  const [version, setVersion] = useState(0);
  const [newText, setNewText] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .listVoiceSamples()
      .then(({ samples }) => setSamples(samples))
      .catch((err) => setError(err.message));
  }, []);

  const bump = () => setVersion((v) => v + 1);

  async function add() {
    setAdding(true);
    try {
      const { sample } = await api.addVoiceSample(newText.trim());
      setSamples((s) => [...(s ?? []), sample]);
      setNewText('');
      bump();
      toast('Sample added');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not add sample', 'error');
    } finally {
      setAdding(false);
    }
  }

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!samples) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px] lg:items-start">
      <Card className="p-5 sm:p-6">
        <h2 className="font-semibold text-ink">Writing samples</h2>
        <p className="mt-0.5 text-sm text-muted">
          3–5 pieces of your own writing work best. {samples.length}/{MAX_SAMPLES} saved.
        </p>
        <div className="mt-5 space-y-5">
          {samples.map((s, i) => (
            <SampleRow
              key={s.id}
              index={i}
              sample={s}
              onSaved={(text) => {
                setSamples((all) => all!.map((x) => (x.id === s.id ? { ...x, sample_text: text } : x)));
                bump();
              }}
              onDeleted={() => {
                setSamples((all) => all!.filter((x) => x.id !== s.id));
                bump();
              }}
            />
          ))}

          {samples.length < MAX_SAMPLES && (
            <div className={cx(samples.length > 0 && 'border-t border-line pt-5')}>
              <label htmlFor="new-sample" className="mb-1.5 block text-sm font-medium">
                {samples.length ? 'Add another sample' : 'Add your first sample'}
              </label>
              <TextArea
                id="new-sample"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Paste a LinkedIn post, email, or anything you've written…"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-xs text-subtle">
                  {newText.trim() && newText.trim().length < MIN_LENGTH ? `At least ${MIN_LENGTH} characters` : ''}
                </span>
                <Button
                  size="sm"
                  icon={<Plus className="h-4 w-4" />}
                  onClick={add}
                  loading={adding}
                  disabled={newText.trim().length < MIN_LENGTH}
                >
                  Add sample
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <StyleSummary sampleCount={samples.length} samplesVersion={version} />
    </div>
  );
}

const TABS = [
  { id: 'voice', label: 'My Voice' },
  { id: 'inspirations', label: 'Inspirations' },
] as const;

export function VoiceProfile() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'inspirations' ? 'inspirations' : 'voice';

  return (
    <div>
      <PageHeader title="Voice Profile" description="Teach PostFlow how you write, and whose structure you'd like to borrow." />
      <div role="tablist" className="mb-6 inline-flex rounded-xl border border-line bg-surface p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setParams(t.id === 'voice' ? {} : { tab: t.id }, { replace: true })}
            className={cx(
              'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
              tab === t.id ? 'bg-accent-600 text-white shadow-sm' : 'text-muted hover:text-ink',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{tab === 'voice' ? <MyVoiceTab /> : <InspirationManager />}</div>
    </div>
  );
}
