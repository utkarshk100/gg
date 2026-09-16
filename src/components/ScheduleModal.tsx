import React, { useState } from 'react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  postContent: string;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  postContent,
}) => {
  const [platform, setPlatform] = useState<'direct' | 'buffer' | 'hootsuite'>('direct');
  const [selectedSlot, setSelectedSlot] = useState<string>('tomorrow-830');
  const [isScheduled, setIsScheduled] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setIsScheduled(true);
    setTimeout(() => {
      setIsScheduled(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-surface-container-low border-b border-surface-container-high/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">calendar_month</span>
            <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              Auto-Schedule to LinkedIn
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isScheduled ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[28px]">check</span>
              </div>
              <h4 className="font-headline-lg text-on-surface font-bold">
                Post Scheduled Successfully!
              </h4>
              <p className="text-xs text-on-surface-variant">
                Queued for maximum algorithmic dwell-time. Your analytics will sync automatically.
              </p>
            </div>
          ) : (
            <>
              {/* Post Preview box */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Draft Preview
                </label>
                <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container-high max-h-36 overflow-y-auto text-xs text-on-surface leading-relaxed whitespace-pre-wrap">
                  {postContent}
                </div>
              </div>

              {/* Time Window Slots */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Algorithm-Optimized Dwell-Time Slot
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'tomorrow-830',
                      label: 'Tomorrow at 8:30 AM EST',
                      desc: 'Peak Founder Dwell Window • Projected +44% Reach',
                    },
                    {
                      id: 'tomorrow-1215',
                      label: 'Tomorrow at 12:15 PM EST',
                      desc: 'Midday Executive Catch-up Slot',
                    },
                    {
                      id: 'thursday-745',
                      label: 'Thursday at 7:45 AM EST',
                      desc: 'High-Tension Industry Debate Window',
                    },
                  ].map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                        selectedSlot === slot.id
                          ? 'border-primary bg-primary-fixed/20 text-primary font-semibold ring-1 ring-primary'
                          : 'border-surface-container-high bg-surface-container-low text-on-surface-variant hover:border-outline-variant'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-on-surface">{slot.label}</div>
                        <div className="text-[11px] text-on-surface-variant">{slot.desc}</div>
                      </div>
                      {selectedSlot === slot.id && (
                        <span className="material-symbols-outlined text-[18px] text-primary">
                          check_circle
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sync Route */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Publishing Pipeline
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'direct', label: 'Direct LinkedIn' },
                    { id: 'buffer', label: 'Buffer Sync' },
                    { id: 'hootsuite', label: 'Hootsuite' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPlatform(item.id as any)}
                      className={`py-2 px-3 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer ${
                        platform === item.id
                          ? 'border-primary bg-surface-container text-primary font-bold'
                          : 'border-surface-container-high text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-primary-container text-on-primary font-semibold text-sm hover:bg-primary shadow-md active:scale-[0.99] cursor-pointer transition-all"
                >
                  Queue Post Now
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
