import React from 'react';

export const Workflow: React.FC = () => {
  const steps = [
    {
      stepNumber: 'STEP 01',
      icon: 'fingerprint',
      iconColor: 'text-primary',
      title: 'Calibrate Your Voice DNA',
      description:
        'Ingest 3–5 of your best-performing past posts. PostFlow isolates sentence cadence, rhetorical hook habits, vocabulary clusters, and formatting quirks.',
      badgeIcon: 'verified',
      badgeIconColor: 'text-emerald-600',
      badgeText: 'Automatic Slang & Cliché Filter',
    },
    {
      stepNumber: 'STEP 02',
      icon: 'architecture',
      iconColor: 'text-secondary',
      title: 'Select Creator Cadence',
      description:
        'Choose an architectural rhythm: Justin Welsh tension hooks, Sahil Bloom breakdown ladders, or Lenny Rachitsky deep-dives—without borrowing a single word.',
      badgeIcon: 'tune',
      badgeIconColor: 'text-secondary',
      badgeText: '100% Original Thought Isolation',
    },
    {
      stepNumber: 'STEP 03',
      icon: 'auto_awesome',
      iconColor: 'text-tertiary',
      title: 'Synthesize 3 Live Variants',
      description:
        'Receive 3 distinct psychological angles: Punchy (High Tension), Storytelling (Founder Vulnerability), and Listicle (High Actionability) with 1-click scheduling.',
      badgeIcon: 'insights',
      badgeIconColor: 'text-primary',
      badgeText: 'Real-Time Dwell-Time Rating',
    },
  ];

  return (
    <section className="w-full py-24 px-6 lg:px-12" id="how-it-works">
      <div className="max-w-6xl mx-auto flex flex-col gap-space-xl">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <span className="font-label-md text-label-md text-secondary uppercase tracking-widest font-semibold">
            Proprietary Workflow
          </span>
          <h2 className="mt-space-xs font-display-sm text-display-sm text-on-surface tracking-tight">
            From unformed idea to viral post in three calculated moves.
          </h2>
          <p className="mt-space-sm font-body-lg text-body-lg text-on-surface-variant">
            Engineered for founders who refuse to compromise on voice fidelity or spend hours staring at blank draft boxes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-space-xl rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow border border-surface-container-high/60 flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 rounded-xl bg-surface-container-high ${step.iconColor} flex items-center justify-center mb-space-md`}>
                  <span className="material-symbols-outlined text-[26px]">
                    {step.icon}
                  </span>
                </div>
                <div className="font-mono-code text-mono-code text-secondary font-semibold mb-space-xs">
                  {step.stepNumber}
                </div>
                <h3 className="font-headline-lg text-headline-lg text-on-surface mb-space-sm">
                  {step.title}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {step.description}
                </p>
              </div>

              <div className="mt-space-lg pt-space-md bg-surface-container-low rounded-xl p-space-sm flex items-center gap-space-sm border border-surface-container-high/40">
                <span className={`material-symbols-outlined ${step.badgeIconColor} text-[18px]`}>
                  {step.badgeIcon}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface font-medium">
                  {step.badgeText}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
