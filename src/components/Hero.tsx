import React from 'react';
import { Studio } from './Studio';

interface HeroProps {
  onOpenTrial: () => void;
  onOpenDemo: () => void;
  onOpenSchedule: (postText: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenTrial, onOpenDemo, onOpenSchedule }) => {
  return (
    <section className="relative w-full pt-12 pb-24 px-6 lg:px-12 overflow-hidden">
      {/* Ambient glowing backdrop gradient */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-primary-fixed/60 via-secondary-fixed/40 to-transparent blur-3xl pointer-events-none -z-10 rounded-full"></div>

      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-high shadow-sm hover:shadow transition-all cursor-default border border-surface-container-highest/60">
          <span className="text-secondary font-headline-sm text-[13px] leading-none">⚡</span>
          <span className="font-label-md text-label-md text-on-surface-variant font-medium">
            Algorithmic Voice Architecture v2025.2
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          <span className="font-label-md text-label-md text-primary font-semibold">
            Trusted by 1,400+ Founders
          </span>
        </div>

        {/* Headline */}
        <h1 className="mt-space-lg font-display-lg text-display-lg text-on-surface tracking-tight max-w-4xl">
          Turn raw one-liners into viral LinkedIn posts.{' '}
          <br className="hidden sm:inline" />
          <span className="text-primary-container">Written in your authentic voice.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-space-md font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          PostFlow blends your calibrated tone profile with the structural cadence of top creators—producing 3 ready-to-publish variants (Punchy, Storytelling, Listicle) in seconds without robotic fluff.
        </p>

        {/* CTA Action Group */}
        <div className="mt-space-xl flex flex-col sm:flex-row items-center gap-space-md">
          <button
            id="hero-start-trial-btn"
            onClick={onOpenTrial}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-space-sm px-space-xl py-3.5 rounded-xl font-headline-sm text-headline-sm text-on-primary bg-primary-container hover:bg-primary shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
          >
            <span>Start Free Trial (14 Days)</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>

          <button
            id="hero-watch-demo-btn"
            onClick={onOpenDemo}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-space-sm px-space-lg py-3.5 rounded-xl font-headline-sm text-headline-sm text-on-surface bg-surface-container-lowest hover:bg-surface-container-low shadow-sm border border-surface-container-high transition-all cursor-pointer"
          >
            <span className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[15px]">play_arrow</span>
            </span>
            <span>Watch 2-Min Interactive Demo</span>
          </button>
        </div>

        {/* Micro Social Proof */}
        <div className="mt-space-lg flex items-center gap-space-sm text-on-surface-variant font-label-md text-label-md flex-wrap justify-center">
          <div className="flex text-amber-500">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            ))}
          </div>
          <span className="font-semibold text-on-surface">4.9/5</span>
          <span className="text-outline-variant">•</span>
          <span>from 850+ CEOs and Solopreneurs</span>
          <span className="text-outline-variant">•</span>
          <span className="text-primary font-medium">No credit card required</span>
        </div>

        {/* HERO VISUAL: Interactive Studio Interface Mockup */}
        <Studio onOpenSchedule={onOpenSchedule} />
      </div>
    </section>
  );
};
