import React from 'react';

export const Features: React.FC = () => {
  return (
    <section className="w-full py-24 px-6 lg:px-12 bg-surface-container-low border-y border-surface-container-high/60" id="features">
      <div className="max-w-6xl mx-auto flex flex-col gap-space-xl">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <span className="font-label-md text-label-md text-primary font-semibold uppercase tracking-widest">
            Built for Serious Builders
          </span>
          <h2 className="mt-space-xs font-display-sm text-display-sm text-on-surface tracking-tight">
            Why top executives don't trust standard ChatGPT for thought leadership.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
          {/* Feature 1 */}
          <div className="p-space-xl rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all border border-surface-container-high/60 flex flex-col gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-space-xs">
              <span className="material-symbols-outlined">lock_reset</span>
            </div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              Authentic Tone Lock
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Zero generic AI buzzwords or cliché corporate jargon like "In today's fast-paced world", "delve into", or "testament to". PostFlow enforces your natural syntax constraints so your network never suspects an AI assistant.
            </p>
            <div className="mt-space-sm flex flex-wrap gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-md bg-error-container text-on-error-container font-mono-code text-mono-code font-medium">
                No 'Excited to announce'
              </span>
              <span className="px-2.5 py-1 rounded-md bg-error-container text-on-error-container font-mono-code text-mono-code font-medium">
                No Rocket Emojis 🚀
              </span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-space-xl rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all border border-surface-container-high/60 flex flex-col gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-space-xs">
              <span className="material-symbols-outlined">splitscreen</span>
            </div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              Creator Structural Blending
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Strict separation between structure and content. Borrow the psychological pacing and tension loops of verified million-follower founders while keeping 100% of your authentic insights and proprietary company data.
            </p>
            <div className="mt-space-sm flex flex-wrap gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-md bg-surface-container-high text-secondary font-mono-code text-mono-code font-medium">
                Justin Welsh Hook Framework
              </span>
              <span className="px-2.5 py-1 rounded-md bg-surface-container-high text-secondary font-mono-code text-mono-code font-medium">
                Sahil Bloom Micro-Stories
              </span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-space-xl rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all border border-surface-container-high/60 flex flex-col gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-tertiary mb-space-xs">
              <span className="material-symbols-outlined">speed</span>
            </div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              Hook Virality Inspector
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Live cognitive analytics measure reading grade-level, tension density, and the exact character threshold before the LinkedIn "...see more" fold cutoff—ensuring 85%+ tap-through rates.
            </p>
            <div className="mt-space-sm flex items-center gap-space-md pt-2 font-label-md text-label-md">
              <span className="text-emerald-700 font-semibold">142 Chars Fold Limit</span>
              <span className="text-on-surface-variant">•</span>
              <span className="text-secondary font-semibold">Grade 5 Readability Target</span>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-space-xl rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all border border-surface-container-high/60 flex flex-col gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary-container mb-space-xs">
              <span className="material-symbols-outlined">query_stats</span>
            </div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              2025 Algorithm Compliance
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Fine-tuned specifically for LinkedIn’s latest dwell-time scoring updates. Discourages engagement-bait links in main copy, optimizes paragraph white space, and drives genuine comment velocity.
            </p>
            <div className="mt-space-sm flex items-center gap-space-md pt-2 font-label-md text-label-md">
              <span className="text-primary font-semibold">Dwell-Time Maximized</span>
              <span className="text-on-surface-variant">•</span>
              <span className="text-emerald-700 font-semibold">Zero Outbound Link Penalty</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
