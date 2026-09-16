import React from 'react';

export const SocialProof: React.FC = () => {
  const logos = [
    {
      initial: 'S',
      name: 'ScaleBridge',
      bgClass: 'bg-primary text-on-primary',
    },
    {
      initial: 'V',
      name: 'VertexAI',
      bgClass: 'bg-secondary text-on-secondary',
    },
    {
      initial: 'F',
      name: 'FlowOps',
      bgClass: 'bg-tertiary text-on-tertiary',
    },
    {
      initial: 'H',
      name: 'HyperGrowth',
      bgClass: 'bg-secondary-container text-on-secondary-container',
    },
    {
      initial: 'C',
      name: 'Catalyst',
      bgClass: 'bg-primary-container text-on-primary',
    },
  ];

  return (
    <section className="w-full py-12 px-6 lg:px-12 bg-surface-container-low border-y border-surface-container-high/60">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest font-semibold">
          Powering executive presence at top high-growth scale-ups
        </span>

        <div className="mt-space-lg w-full flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-80">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="flex items-center gap-2 hover:opacity-100 transition-opacity"
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-headline-sm font-bold shadow-sm ${logo.bgClass}`}
              >
                {logo.initial}
              </span>
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
