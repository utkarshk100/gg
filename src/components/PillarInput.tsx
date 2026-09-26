import { useState, type KeyboardEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from './ui';

const SUGGESTIONS = ['Leadership', 'Product management', 'Startups', 'AI', 'Career growth', 'Hiring', 'Design', 'Sales', 'Remote work', 'Engineering'];

export function PillarInput({ value, onChange, max = 5 }: { value: string[]; onChange: (v: string[]) => void; max?: number }) {
  const [draft, setDraft] = useState('');
  const full = value.length >= max;

  const add = (raw: string) => {
    const topic = raw.trim().replace(/,$/, '').slice(0, 60);
    if (!topic || full || value.some((v) => v.toLowerCase() === topic.toLowerCase())) return;
    onChange([...value, topic]);
    setDraft('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(draft);
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((p) => (
          <span key={p} className="inline-flex h-9 items-center gap-1 rounded-full bg-accent-600 pr-1.5 pl-3.5 text-sm font-medium text-white">
            {p}
            <button
              type="button"
              aria-label={`Remove ${p}`}
              onClick={() => onChange(value.filter((v) => v !== p))}
              className="rounded-full p-1 hover:bg-white/20"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={full ? `That's ${max} — nice and focused` : 'Type a topic and press Enter'}
          disabled={full}
          aria-label="Add a content pillar"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase())).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => add(s)}
            disabled={full}
            className="inline-flex h-8 items-center gap-1 rounded-full border border-dashed border-line px-3 text-sm text-muted transition-colors hover:border-accent-500 hover:text-accent-700 disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> {s}
          </button>
        ))}
      </div>
    </div>
  );
}
