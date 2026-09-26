import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import type { DraftStatus } from '../lib/types';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
export { cx };

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-accent-600 text-white shadow-sm hover:bg-accent-700 active:bg-accent-800 disabled:bg-accent-600/50',
  secondary: 'bg-surface text-ink border border-line hover:border-accent-200 hover:bg-accent-50 disabled:opacity-50',
  ghost: 'text-muted hover:text-ink hover:bg-black/[0.04] disabled:opacity-50',
  danger: 'text-red-600 hover:bg-red-50 disabled:opacity-50',
};
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', loading, icon, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      className={cx(
        'inline-flex items-center justify-center font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

export function IconButton({
  label,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={cx(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-black/[0.05] hover:text-ink disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('rounded-2xl border border-line/70 bg-surface shadow-card', className)}>{children}</div>;
}

export function Chip({
  active,
  onClick,
  children,
  className,
  ...rest
}: { active?: boolean; onClick?: () => void; children: ReactNode; className?: string } & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick'
>) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      {...rest}
      className={cx(
        'inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-all',
        active
          ? 'border-accent-600 bg-accent-600 text-white shadow-sm'
          : 'border-line bg-surface text-muted hover:border-accent-200 hover:text-ink',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Label({ htmlFor, children, hint }: { htmlFor?: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {children}
      </label>
      {hint && <span className="text-xs text-subtle">{hint}</span>}
    </div>
  );
}

const fieldBase =
  'w-full rounded-xl border border-line bg-surface px-3.5 text-[15px] text-ink placeholder:text-subtle transition-colors focus:border-accent-500 focus:outline-none focus:ring-4 focus:ring-accent-100';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...rest },
  ref,
) {
  return <input ref={ref} {...rest} className={cx(fieldBase, 'h-11', className)} />;
});

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextArea(
  { className, ...rest },
  ref,
) {
  return <textarea ref={ref} {...rest} className={cx(fieldBase, 'min-h-28 resize-y py-3 leading-relaxed', className)} />;
});

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cx('h-5 w-5 animate-spin text-accent-600', className)} />;
}

const statusStyles: Record<DraftStatus, { label: string; cls: string }> = {
  copied: { label: 'Copied', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15' },
  discarded: { label: 'Discarded', cls: 'bg-stone-100 text-stone-500 ring-stone-500/10' },
  generated: { label: 'Draft', cls: 'bg-accent-50 text-accent-700 ring-accent-600/15' },
};

export function StatusPill({ status }: { status: DraftStatus }) {
  const s = statusStyles[status];
  return (
    <span className={cx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', s.cls)}>
      {s.label}
    </span>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-muted">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      {children}
    </p>
  );
}
