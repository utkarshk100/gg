import React, { useState } from 'react';
import { PRICING_PLANS } from '../data/mockData';

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlanId?: string;
}

export const TrialModal: React.FC<TrialModalProps> = ({
  isOpen,
  onClose,
  initialPlanId = 'pro',
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPlan, setSelectedPlan] = useState<string>(initialPlanId);
  const [email, setEmail] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [voiceTone, setVoiceTone] = useState('contrarian');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleFinish = () => {
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-surface-container-low border-b border-surface-container-high/60 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                Start Your 14-Day Free Trial
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              No credit card required. Calibrate your executive voice in 90 seconds.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Selected Executive Plan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRICING_PLANS.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        selectedPlan === plan.id
                          ? 'border-primary-container bg-primary-fixed/20 text-primary font-semibold ring-1 ring-primary'
                          : 'border-surface-container-high bg-surface-container-low text-on-surface-variant hover:border-outline-variant'
                      }`}
                    >
                      <div className="font-bold text-[13px]">{plan.name}</div>
                      <div className="text-on-surface-variant">${plan.monthlyPrice}/mo</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@scalebridge.io"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-container-high bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  required
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-container-high bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-primary-container text-on-primary font-semibold text-sm hover:bg-primary transition-all shadow-md active:scale-[0.99] cursor-pointer"
                >
                  Continue to Voice Calibration →
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-2">
                  Select Your Primary Tone Philosophy
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'contrarian',
                      title: 'Contrarian Operator',
                      desc: 'Short, sharp sentences. Direct confrontation of status-quo industry myths (Justin Welsh style).',
                    },
                    {
                      id: 'storyteller',
                      title: 'Vulnerable Storyteller',
                      desc: 'Founder journey arcs, raw dollar lessons, and compounding takeaways (Sahil Bloom style).',
                    },
                    {
                      id: 'tactical',
                      title: 'Deep-Dive Architect',
                      desc: 'Tactical playbooks, checklists, and metric-backed operator teardowns (Lenny Rachitsky style).',
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setVoiceTone(item.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        voiceTone === item.id
                          ? 'border-primary bg-primary-fixed/20 ring-1 ring-primary'
                          : 'border-surface-container-high bg-surface-container-low hover:border-outline-variant'
                      }`}
                    >
                      <div className="font-semibold text-sm text-on-surface">{item.title}</div>
                      <div className="text-xs text-on-surface-variant mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary-container text-on-primary font-semibold text-sm hover:bg-primary transition-all shadow-md active:scale-[0.99] cursor-pointer"
                >
                  Activate Free Trial Access
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[32px]">check_circle</span>
              </div>
              <h4 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                Trial Access Activated!
              </h4>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto">
                We've linked your workspace for <strong>{email || 'your account'}</strong>. Your executive voice DNA is 98.4% calibrated and ready to publish.
              </p>
              <button
                onClick={handleFinish}
                className="w-full py-3 rounded-xl bg-primary-container text-on-primary font-semibold text-sm hover:bg-primary transition-all shadow-md cursor-pointer"
              >
                Open Executive Studio
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
