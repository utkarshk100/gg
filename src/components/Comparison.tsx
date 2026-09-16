import React from 'react';

export const Comparison: React.FC = () => {
  return (
    <section className="w-full py-24 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-space-xl">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <span className="font-label-md text-label-md text-secondary font-semibold uppercase tracking-widest">
            Side-by-Side Proof
          </span>
          <h2 className="mt-space-xs font-display-sm text-display-sm text-on-surface tracking-tight">
            Spot the difference your network definitely sees.
          </h2>
          <p className="mt-space-sm font-body-lg text-body-lg text-on-surface-variant">
            The contrast between synthetic generic AI and executive calibrated architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg items-stretch">
          {/* Generic AI (Left) */}
          <div className="p-space-xl rounded-2xl bg-surface-container-low shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-space-md border-b border-surface-container-high/50">
                <div className="flex items-center gap-space-sm">
                  <div className="w-3 h-3 rounded-full bg-error"></div>
                  <span className="font-headline-sm text-headline-sm text-error font-bold">
                    Generic AI Prompting
                  </span>
                </div>
                <span className="font-mono-code text-mono-code text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                  Typical Output
                </span>
              </div>

              <div className="mt-space-md p-space-lg rounded-xl bg-surface-container-lowest text-on-surface-variant font-body-md text-body-md space-y-3 leading-relaxed border border-error/20">
                <p className="text-on-surface font-medium">🚀 Thrilled to announce our latest milestone in enterprise scalability! 🚀</p>
                <p>
                  In today's fast-paced tech landscape, it is paramount that organizations leverage cutting-edge paradigms to unlock their full potential and synergize operations.
                </p>
                <p>
                  Whether you're a burgeoning startup or an established enterprise, continuous innovation remains the cornerstone of modern leadership. Delve into our journey below and remember to always strive for excellence! 💡✨
                </p>
                <p className="text-primary text-xs">
                  What are your thoughts on innovation? Let me know in the comments below! 👇 #Leadership #Innovation #GrowthMindset #SaaS #TechTrends
                </p>
              </div>
            </div>

            <div className="mt-space-lg pt-space-md flex flex-col gap-2 border-t border-surface-container-high/40">
              <div className="flex items-center gap-2 font-label-md text-label-md text-error">
                <span className="material-symbols-outlined text-[18px]">close</span>
                <span>Screams robotic generation to any seasoned buyer</span>
              </div>
              <div className="flex items-center gap-2 font-label-md text-label-md text-error">
                <span className="material-symbols-outlined text-[18px]">close</span>
                <span>Zero original insight; 98% dropoff before the 2nd line</span>
              </div>
            </div>
          </div>

          {/* PostFlow Calibrated (Right) */}
          <div className="p-space-xl rounded-2xl bg-surface-container-lowest shadow-lg border border-primary/20 flex flex-col justify-between ring-1 ring-primary/10">
            <div>
              <div className="flex items-center justify-between pb-space-md border-b border-surface-container-high/50">
                <div className="flex items-center gap-space-sm">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    PostFlow Calibrated Output
                  </span>
                </div>
                <span className="font-mono-code text-mono-code text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                  98.4% Match
                </span>
              </div>

              <div className="mt-space-md p-space-lg rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md space-y-3 leading-relaxed border border-emerald-500/20">
                <p className="font-bold text-on-surface text-[15px]">
                  Most startups don't die from competition. They die from doing 14 things at a 6/10 level.
                </p>
                <p>Last quarter we killed 3 features that our team loved.</p>
                <p className="font-semibold text-primary">It stung.</p>
                <p>
                  We channeled 100% of engineering hours into a single onboarding screen that was leaking 34% of trial accounts.
                </p>
                <p className="font-medium text-on-surface">The result?</p>
                <p>
                  Activation increased by 81% in 3 weeks without spending an extra dollar on customer acquisition.
                </p>
                <p className="text-on-surface-variant font-medium pt-1">
                  Focus isn't about deciding what to build. It's about having the stomach to kill good ideas to protect great ones.
                </p>
              </div>
            </div>

            <div className="mt-space-lg pt-space-md flex flex-col gap-2 border-t border-surface-container-high/40">
              <div className="flex items-center gap-2 font-label-md text-label-md text-emerald-800 font-medium">
                <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                <span>Human tension rhythm keeps readers through to final insight</span>
              </div>
              <div className="flex items-center gap-2 font-label-md text-label-md text-emerald-800 font-medium">
                <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                <span>Positions the executive as a battle-tested operator, not a cheerleader</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
