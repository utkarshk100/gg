import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth, useUser } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Logo } from '../components/Logo';
import { PillarInput } from '../components/PillarInput';
import { Button, Card, ErrorNote, IconButton, Input, Label, TextArea, cx } from '../components/ui';

const ALL_STEPS = ['About you', 'Content pillars', 'Writing samples'];

export function Onboarding() {
  const user = useUser();
  const { setUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  // Returning users edit their profile here; writing samples live on the Voice Profile page.
  const returning = user.onboarding_completed;
  const STEPS = returning ? ALL_STEPS.slice(0, 2) : ALL_STEPS;
  const lastStep = STEPS.length - 1;

  const [step, setStep] = useState(0);
  const [name, setName] = useState(user.name ?? '');
  const [role, setRole] = useState(user.role ?? '');
  const [industry, setIndustry] = useState(user.industry ?? '');
  const [pillars, setPillars] = useState<string[]>(user.content_pillars);
  const [samples, setSamples] = useState<string[]>(['']);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function finish(opts: { includeSamples: boolean }) {
    setBusy(true);
    setError('');
    try {
      if (opts.includeSamples) {
        let remaining = samples.map((s) => s.trim()).filter(Boolean);
        while (remaining.length) {
          await api.addVoiceSample(remaining[0]);
          // Drop saved samples from state so a retry after a failure doesn't duplicate them.
          remaining = remaining.slice(1);
          setSamples(remaining.length ? remaining : ['']);
        }
      }
      const { user: updated } = await api.updateProfile({
        name,
        role,
        industry,
        content_pillars: pillars,
        onboarding_completed: true,
      });
      setUser(updated);
      toast(returning ? 'Profile saved' : "You're all set — let's write something");
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your setup');
    } finally {
      setBusy(false);
    }
  }

  async function skipAll() {
    setBusy(true);
    try {
      const { user: updated } = await api.updateProfile({ onboarding_completed: true });
      setUser(updated);
      navigate('/', { replace: true });
    } finally {
      setBusy(false);
    }
  }

  const tooShort = samples.some((s) => s.trim() && s.trim().length < 20);
  const canContinue = step === 0 ? name.trim().length > 0 : step === 1 ? pillars.length >= 3 : !tooShort;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-2xl items-center justify-between px-4 sm:px-6">
        <Logo />
        {returning ? (
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            Cancel
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={skipAll} disabled={busy}>
            Skip setup
          </Button>
        )}
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-4 pb-16 sm:px-6 sm:pt-8">
        <ol className="mb-6 flex items-center gap-2" aria-label="Setup progress">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-1 flex-col gap-2">
              <span className={cx('h-1.5 rounded-full transition-colors', i <= step ? 'bg-accent-600' : 'bg-line')} />
              <span className={cx('text-xs font-medium', i === step ? 'text-ink' : 'text-subtle')}>
                <span className="hidden sm:inline">Step {i + 1} · </span>
                {label}
              </span>
            </li>
          ))}
        </ol>

        <Card className="p-5 sm:p-8">
          {step === 0 && (
            <>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{returning ? 'Your profile' : "Let's get to know you"}</h1>
              <p className="mt-1.5 text-[15px] text-muted">This shows up on your post previews and helps us write for your audience.</p>
              <div className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="name">Your name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Sharma" autoFocus />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Product Manager" />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="B2B SaaS" />
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">What do you want to be known for?</h1>
              <p className="mt-1.5 text-[15px] text-muted">Pick 3–5 content pillars. We'll keep your posts anchored to these themes.</p>
              <div className="mt-6">
                <PillarInput value={pillars} onChange={setPillars} />
                <p className="mt-4 text-xs text-subtle">{pillars.length}/5 selected{pillars.length < 3 && ` · add ${3 - pillars.length} more`}</p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Show us how you write</h1>
              <p className="mt-1.5 text-[15px] text-muted">
                Paste 3–5 things you've written — old LinkedIn posts, emails, Slack messages. Totally optional: skip this and
                we'll use a neutral professional tone until you add samples later.
              </p>
              <div className="mt-6 space-y-4">
                {samples.map((s, i) => (
                  <div key={i}>
                    <Label htmlFor={`sample-${i}`} hint={s.trim() && s.trim().length < 20 ? 'A little longer, please' : undefined}>
                      Sample {i + 1}
                    </Label>
                    <div className="flex items-start gap-2">
                      <TextArea
                        id={`sample-${i}`}
                        value={s}
                        onChange={(e) => setSamples(samples.map((x, j) => (j === i ? e.target.value : x)))}
                        placeholder="Paste something you've written…"
                      />
                      {samples.length > 1 && (
                        <IconButton label={`Remove sample ${i + 1}`} onClick={() => setSamples(samples.filter((_, j) => j !== i))}>
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      )}
                    </div>
                  </div>
                ))}
                {samples.length < 5 && (
                  <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setSamples([...samples, ''])}>
                    Add another sample
                  </Button>
                )}
              </div>
            </>
          )}

          <div className="mt-6">
            <ErrorNote>{error}</ErrorNote>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {step > 0 && (
                <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              {step === 2 && (
                <Button variant="secondary" onClick={() => finish({ includeSamples: false })} disabled={busy}>
                  Skip this step
                </Button>
              )}
              {step < lastStep ? (
                <Button onClick={() => setStep(step + 1)} disabled={!canContinue}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => finish({ includeSamples: !returning })}
                  disabled={!canContinue}
                  loading={busy}
                  icon={<Check className="h-4 w-4" />}
                >
                  {returning ? 'Save profile' : 'Finish Setup'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
