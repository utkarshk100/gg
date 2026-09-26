import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Sparkles, UserRound, Library, AudioLines, Home } from 'lucide-react';
import { useAuth, useUser } from '../context/AuthContext';
import { Logo } from './Logo';
import { cx } from './ui';

const links = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/inspirations', label: 'Inspiration Library', icon: Library },
  { to: '/voice', label: 'Voice Profile', icon: AudioLines },
];

export function initials(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'P';
}

function UserMenu() {
  const user = useUser();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors hover:bg-black/[0.04]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-100 text-xs font-bold text-accent-700">
          {initials(user.name, user.email)}
        </span>
        <span className="hidden max-w-32 truncate text-sm font-medium text-ink sm:block">{user.name || 'Account'}</span>
        <ChevronDown className="h-4 w-4 text-subtle" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-surface py-1.5 shadow-lift"
        >
          <div className="border-b border-line px-4 pt-1.5 pb-3">
            <p className="truncate text-sm font-semibold text-ink">{user.name || 'Your account'}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <Link
            role="menuitem"
            to="/onboarding"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-canvas"
          >
            <UserRound className="h-4 w-4 text-muted" /> Edit profile
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink hover:bg-canvas"
          >
            <LogOut className="h-4 w-4 text-muted" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-line/80 bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" aria-label="PostFlow home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.slice(1).map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cx(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-accent-50 text-accent-700' : 'text-muted hover:text-ink',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <UserMenu />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-28 sm:px-6 sm:pt-10 md:pb-16">
        <Outlet />
      </main>

      {/* Mobile tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="grid grid-cols-3">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cx(
                  'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium',
                  isActive ? 'text-accent-700' : 'text-subtle',
                )
              }
            >
              <l.icon className="h-5 w-5" />
              {l.label.replace(' Library', 's').replace(' Profile', '')}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Sparkles className="h-6 w-6 animate-pulse text-accent-600" />
    </div>
  );
}
