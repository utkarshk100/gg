import React, { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTrial: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onOpenTrial }) => {
  const [email, setEmail] = useState('alex@postflow.io');
  const [password, setPassword] = useState('••••••••');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden">
        <div className="p-6 bg-surface-container-low border-b border-surface-container-high/60 flex items-center justify-between">
          <div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              Sign In to PostFlow
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Access your calibrated voice architecture
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-6 space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[24px]">check</span>
              </div>
              <h4 className="font-headline-sm text-on-surface font-bold">Welcome back, Alex</h4>
              <p className="text-xs text-on-surface-variant">Loading calibrated creator cadences...</p>
            </div>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-container-high bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-container-high bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-primary-container text-on-primary font-semibold text-sm hover:bg-primary transition-all shadow-md active:scale-[0.99] cursor-pointer"
                >
                  Sign In
                </button>
              </div>

              <div className="text-center pt-2 text-xs text-on-surface-variant">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTrial();
                  }}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  Start 14-day trial
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
