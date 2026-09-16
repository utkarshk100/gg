import React, { useState } from 'react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTrial: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose, onOpenTrial }) => {
  const [activeTab, setActiveTab] = useState<'tension' | 'fold' | 'cadence'>('tension');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-surface-container-low border-b border-surface-container-high/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-secondary animate-ping"></span>
            <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              2-Minute Interactive Studio Walkthrough
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Interactive Walkthrough tabs */}
        <div className="p-6 space-y-5">
          <div className="flex gap-2 border-b border-surface-container-high pb-2">
            {[
              { id: 'tension', label: '1. Contrarian Tension Loop' },
              { id: 'fold', label: '2. 142-Char Fold Physics' },
              { id: 'cadence', label: '3. Creator Structural Blending' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2 px-3 text-xs font-semibold transition-all border-b-2 -mb-2.5 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'tension' && (
            <div className="space-y-3 text-sm text-on-surface leading-relaxed">
              <h4 className="font-bold text-base text-primary">How PostFlow Crafts Hooks That Stop The Scroll</h4>
              <p className="text-on-surface-variant">
                Most AI posts start with generic statements: "In today's fast-moving world..." or "Leadership is crucial." Readers scroll right past.
              </p>
              <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container-high space-y-1 text-xs">
                <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">PostFlow Principle:</span>
                <p className="text-on-surface">
                  Every PostFlow hook pits two strong beliefs against each other in under 12 words: <br />
                  <span className="italic font-semibold text-primary">"Your first 3 engineering hires will either save your runway or kill it in 6 months."</span>
                </p>
              </div>
            </div>
          )}

          {activeTab === 'fold' && (
            <div className="space-y-3 text-sm text-on-surface leading-relaxed">
              <h4 className="font-bold text-base text-secondary">The LinkedIn "...see more" Algorithmic Trigger</h4>
              <p className="text-on-surface-variant">
                LinkedIn measures dwell-time and tap-through rates at the exact character fold (140–145 characters). If a user taps "...see more", the post's virality coefficient triples.
              </p>
              <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container-high space-y-1 text-xs">
                <span className="font-bold text-secondary uppercase tracking-wider text-[10px]">Live Inspector Feedback:</span>
                <p className="text-on-surface">
                  PostFlow cuts your opening hook precisely at 142 characters, guaranteeing the tension cliffhanger forces the tap without awkward mid-word breaks.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'cadence' && (
            <div className="space-y-3 text-sm text-on-surface leading-relaxed">
              <h4 className="font-bold text-base text-primary-container">Structure vs. Content Separation</h4>
              <p className="text-on-surface-variant">
                Never sound like an imitator. PostFlow maps the pacing rhythm (short-short-long sentence distribution) of top founders, but injects 100% of your real company insights and tone vocabulary.
              </p>
              <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container-high space-y-1 text-xs">
                <span className="font-bold text-primary-container uppercase tracking-wider text-[10px]">Zero Stolen Words:</span>
                <p className="text-on-surface">
                  Only the architectural skeleton is borrowed. The voice, data, and hard-earned lessons remain strictly yours.
                </p>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-surface-container-high flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">Ready to test with your own thoughts?</span>
            <button
              onClick={() => {
                onClose();
                onOpenTrial();
              }}
              className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-semibold text-xs hover:bg-primary shadow-sm cursor-pointer transition-all"
            >
              Start Free Trial →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
