import React from 'react';
import { TESTIMONIALS } from '../data/mockData';

export const Testimonials: React.FC = () => {
  return (
    <section className="w-full py-24 px-6 lg:px-12 bg-surface-container-low border-y border-surface-container-high/60" id="wall-of-love">
      <div className="max-w-6xl mx-auto flex flex-col gap-space-xl">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <span className="font-label-md text-label-md text-secondary font-semibold uppercase tracking-widest">
            Executive Track Record
          </span>
          <h2 className="mt-space-xs font-display-sm text-display-sm text-on-surface tracking-tight">
            Real metrics from founders who replaced $4k/mo ghostwriters.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="p-space-xl rounded-2xl bg-surface-container-lowest shadow-md hover:shadow-lg transition-all border border-surface-container-high/60 flex flex-col justify-between"
            >
              <div className="flex flex-col gap-space-md">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(t.rating)].map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>

                <p className="font-body-md text-body-md text-on-surface leading-relaxed italic">
                  {t.id === 'sarah-lin' && (
                    <>
                      "We saw <strong className="text-primary font-semibold">+340% inbound leads in 60 days</strong> after shifting my personal LinkedIn strategy to PostFlow. It completely captures my direct, candid founder tone without the fluffy platitudes common in AI."
                    </>
                  )}
                  {t.id === 'marcus-chen' && (
                    <>
                      "Saved me <strong className="text-secondary font-semibold">6 hours every Sunday morning</strong>. I drop 3 rough voice memos from my week into the studio, pick my structural cadence, and our weekly editorial pipeline is locked."
                    </>
                  )}
                  {t.id === 'elena-rostova' && (
                    <>
                      "Generated <strong className="text-primary-container font-semibold">4.2M LinkedIn impressions</strong> in Q1 with zero agency retainer. PostFlow's hook virality scorer alone is worth 10x the monthly investment."
                    </>
                  )}
                </p>
              </div>

              <div className="mt-space-lg pt-space-md flex items-center gap-space-md border-t border-surface-container-high/40">
                <img
                  alt={`${t.name} - ${t.title} @ ${t.company}`}
                  className="w-12 h-12 rounded-full object-cover shadow-sm border border-surface-container-high"
                  src={t.avatarUrl}
                />
                <div>
                  <div className="font-headline-sm text-headline-sm text-on-surface">
                    {t.name}
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    {t.title} @ {t.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
