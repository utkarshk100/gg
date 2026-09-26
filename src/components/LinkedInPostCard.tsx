import type { ReactNode } from 'react';
import { Globe2, MessageSquareText, Repeat2, Send, ThumbsUp } from 'lucide-react';
import type { User } from '../lib/types';
import { initials } from './AppShell';

/** A LinkedIn-feed-style frame around a post body. The social row is decorative only. */
export function LinkedInPostCard({
  user,
  label,
  children,
  footer,
}: {
  user: User;
  label: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}) {
  const headline = [user.role, user.industry].filter(Boolean).join(' · ') || 'LinkedIn member';
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line/70 bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-line/70 bg-canvas/60 px-4 py-2.5">{label}</div>

      <div className="flex items-start gap-3 px-4 pt-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-100 to-accent-200 text-sm font-bold text-accent-800">
          {initials(user.name, user.email)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{user.name || 'You'}</p>
          <p className="truncate text-xs text-muted">{headline}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-subtle">
            Now · <Globe2 className="h-3 w-3" />
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 pt-3 pb-4">{children}</div>

      <div aria-hidden="true" className="mx-4 grid grid-cols-4 border-t border-line/70 py-1 text-xs font-semibold text-subtle/80 select-none">
        {[
          [ThumbsUp, 'Like'],
          [MessageSquareText, 'Comment'],
          [Repeat2, 'Repost'],
          [Send, 'Send'],
        ].map(([Icon, text]) => {
          const I = Icon as typeof ThumbsUp;
          return (
            <span key={text as string} className="flex items-center justify-center gap-1.5 py-2">
              <I className="h-4 w-4" />
              <span className="hidden sm:inline">{text as string}</span>
            </span>
          );
        })}
      </div>

      <div className="border-t border-line/70 bg-canvas/40 p-3">{footer}</div>
    </article>
  );
}

/** Renders post text with preserved line breaks and highlighted hashtags. */
export function PostBody({ text }: { text: string }) {
  const parts = text.split(/(#[\p{L}\p{N}_]+)/u);
  return (
    <p className="text-[14.5px] leading-[1.6] break-words whitespace-pre-wrap text-ink">
      {parts.map((part, i) =>
        part.startsWith('#') ? (
          <span key={i} className="font-semibold text-accent-700">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </p>
  );
}
