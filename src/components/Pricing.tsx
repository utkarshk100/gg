import React, { useState } from 'react';
import { PRICING_PLANS } from '../data/mockData';

interface PricingProps {
  onSelectPlan: (planId: string) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="w-full py-24 px-6 lg:px-12" id="pricing">
      <div className="max-w-6xl mx-auto flex flex-col gap-space-xl">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <span className="font-label-md text-label-md text-secondary font-semibold uppercase tracking-widest">
            Transparent Investment
          </span>
          <h2 className="mt-space-xs font-display-sm text-display-sm text-on-surface tracking-tight">
            Priced for high-ROI thought leaders.
          </h2>
          <p className="mt-space-sm font-body-lg text-body-lg text-on-surface-variant">
            Cancel anytime. 14-day zero-risk trial on all executive plans.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-6 inline-flex items-center p-1 bg-surface-container-high rounded-xl border border-surface-container-highest">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !isAnnual
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                isAnnual
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg items-stretch">
          {PRICING_PLANS.map((plan) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;

            if (plan.popular) {
              return (
                <div
                  key={plan.id}
                  className="relative p-space-xl rounded-2xl bg-surface-container-lowest shadow-xl border-2 border-primary-container flex flex-col justify-between"
                >
                  {/* Featured Badge */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-space-md py-1 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold tracking-wider uppercase shadow-md whitespace-nowrap">
                    {plan.badge || 'Most Popular • Executive Choice'}
                  </div>

                  <div>
                    <span className="font-headline-sm text-headline-sm text-primary font-bold">
                      {plan.name}
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      {plan.tagline}
                    </p>

                    <div className="mt-space-md flex items-baseline gap-1">
                      <span className="font-display-lg text-display-lg text-on-surface font-bold">
                        ${price}
                      </span>
                      <span className="font-body-md text-body-md text-on-surface-variant">
                        /month
                      </span>
                      {isAnnual && (
                        <span className="ml-2 text-xs text-emerald-700 font-semibold">
                          (billed yearly)
                        </span>
                      )}
                    </div>

                    <ul className="mt-space-lg space-y-3 font-body-sm text-body-sm text-on-surface">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-primary shrink-0">
                            check_circle
                          </span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    id={`pricing-btn-${plan.id}`}
                    onClick={() => onSelectPlan(plan.id)}
                    className="mt-space-xl w-full py-3.5 rounded-xl font-label-md text-label-md font-semibold text-center text-on-primary bg-primary-container hover:bg-primary transition-all shadow-md active:scale-[0.99] cursor-pointer"
                  >
                    {plan.ctaText}
                  </button>
                </div>
              );
            }

            return (
              <div
                key={plan.id}
                className="p-space-xl rounded-2xl bg-surface-container-low shadow-sm border border-surface-container-high/60 flex flex-col justify-between hover:border-surface-container-highest transition-all"
              >
                <div>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    {plan.name}
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    {plan.tagline}
                  </p>

                  <div className="mt-space-md flex items-baseline gap-1">
                    <span className="font-display-lg text-display-lg text-on-surface font-bold">
                      ${price}
                    </span>
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      /month
                    </span>
                    {isAnnual && (
                      <span className="ml-2 text-xs text-emerald-700 font-semibold">
                        (billed yearly)
                      </span>
                    )}
                  </div>

                  <ul className="mt-space-lg space-y-3 font-body-sm text-body-sm text-on-surface">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0">
                          check
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  id={`pricing-btn-${plan.id}`}
                  onClick={() => onSelectPlan(plan.id)}
                  className="mt-space-xl w-full py-3 rounded-xl font-label-md text-label-md font-semibold text-center text-on-surface bg-surface-container-lowest hover:bg-surface-container-high transition-colors shadow-sm cursor-pointer border border-surface-container-high"
                >
                  {plan.ctaText}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
