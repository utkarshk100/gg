import React from 'react';

interface CtaBannerProps {
  onOpenTrial: () => void;
  onBookOnboarding: () => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({ onOpenTrial, onBookOnboarding }) => {
  return (
    <section className="w-full py-24 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto rounded-3xl bg-inverse-surface text-inverse-on-surface p-10 lg:p-16 relative overflow-hidden shadow-2xl">
        {/* Radiant background flare */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-primary-container/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          <span className="px-space-md py-1 rounded-full bg-surface-container-high/20 text-inverse-primary font-label-sm text-label-sm font-semibold tracking-wider uppercase border border-surface-container-high/30">
            Zero Cognitive Drag
          </span>

          <h2 className="mt-space-md font-display-sm text-display-sm tracking-tight text-white">
            Stop wasting 10 hours a week staring at blank LinkedIn drafts.
          </h2>

          <p className="mt-space-md font-body-lg text-body-lg text-surface-variant max-w-xl">
            Join 1,400+ tech founders building definitive authority in their sector with calibrated AI cadence.
          </p>

          <div className="mt-space-xl flex flex-col sm:flex-row items-center gap-space-md w-full sm:w-auto">
            <button
              id="cta-claim-trial-btn"
              onClick={onOpenTrial}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-space-sm px-space-xl py-4 rounded-xl font-headline-sm text-headline-sm text-on-primary bg-primary-container hover:bg-primary shadow-lg transition-all active:scale-[0.99] cursor-pointer"
            >
              <span>Claim Your 14-Day Free Access</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

            <button
              id="cta-book-onboarding-btn"
              onClick={onBookOnboarding}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-space-sm px-space-lg py-4 rounded-xl font-headline-sm text-headline-sm text-white bg-surface-variant/10 hover:bg-surface-variant/20 transition-all border border-surface-variant/20 cursor-pointer"
            >
              <span>Book Executive Onboarding</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
