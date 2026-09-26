import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Button, Card, ErrorNote, Input, Label } from '../components/ui';

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isSignup = mode === 'signup';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = isSignup ? await signup(email, password) : await login(email, password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(!user.onboarding_completed ? '/onboarding' : from || '/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Logo className="mb-8" />
      <Card className="w-full max-w-sm p-6 sm:p-8">
        <h1 className="text-xl font-bold tracking-tight">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        <p className="mt-1 text-sm text-muted">
          {isSignup
            ? 'Turn one-line ideas into LinkedIn posts that sound like you.'
            : 'Log in to keep drafting in your own voice.'}
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>
          <div>
            <Label htmlFor="password" hint={isSignup ? 'At least 8 characters' : undefined}>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              required
              minLength={isSignup ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <ErrorNote>{error}</ErrorNote>
          <Button type="submit" size="lg" className="w-full" loading={busy}>
            {isSignup ? 'Create account' : 'Log in'}
          </Button>
        </form>
      </Card>
      <p className="mt-6 text-sm text-muted">
        {isSignup ? 'Already have an account? ' : 'New to PostFlow? '}
        <Link to={isSignup ? '/login' : '/signup'} className="font-semibold text-accent-700 hover:underline">
          {isSignup ? 'Log in' : 'Create an account'}
        </Link>
      </p>
    </div>
  );
}
