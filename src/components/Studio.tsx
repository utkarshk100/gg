import React, { useState, useMemo } from 'react';
import { VariantType, CreatorCadence } from '../types';
import { CREATOR_CADENCES, PRESET_THOUGHTS, ASSETS } from '../data/mockData';

interface StudioProps {
  onOpenSchedule: (postText: string) => void;
}

export const Studio: React.FC<StudioProps> = ({ onOpenSchedule }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-hiring');
  const [activeCadenceId, setActiveCadenceId] = useState<string>('justin-welsh');
  const [activeVariant, setActiveVariant] = useState<VariantType>('punchy');
  
  // Custom raw text or preset text
  const currentPreset = useMemo(() => {
    return PRESET_THOUGHTS.find((p) => p.id === selectedPresetId) || PRESET_THOUGHTS[0];
  }, [selectedPresetId]);

  const [rawText, setRawText] = useState<string>(currentPreset.rawText);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [likes, setLikes] = useState<number>(412);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [reposts, setReposts] = useState<number>(38);
  const [hasReposted, setHasReposted] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [showCadenceDropdown, setShowCadenceDropdown] = useState<boolean>(false);

  // Active creator cadence details
  const activeCadence = useMemo(() => {
    return CREATOR_CADENCES.find((c) => c.id === activeCadenceId) || CREATOR_CADENCES[0];
  }, [activeCadenceId]);

  // Word count of raw text
  const wordCount = useMemo(() => {
    const trimmed = rawText.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [rawText]);

  // Active post variant
  const currentVariantData = currentPreset.variants[activeVariant];

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = PRESET_THOUGHTS.find((p) => p.id === presetId);
    if (preset) {
      setRawText(preset.rawText);
      setActiveCadenceId(preset.cadenceId);
    }
  };

  const handleSynthesize = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
    }, 600);
  };

  const handleLike = () => {
    if (hasLiked) {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  const handleRepost = () => {
    if (hasReposted) {
      setReposts((prev) => prev - 1);
      setHasReposted(false);
    } else {
      setReposts((prev) => prev + 1);
      setHasReposted(true);
    }
  };

  const getFullPostText = () => {
    return `${currentVariantData.hook}\n\n${currentVariantData.body.join('\n\n')}\n\n${currentVariantData.takeaway}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullPostText());
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2200);
  };

  return (
    <div
      id="interactive-demo"
      className="mt-space-xl w-full max-w-5xl rounded-2xl bg-surface-container-lowest shadow-xl border border-surface-container-high/60 p-4 sm:p-6 text-left relative"
    >
      {/* Toast alert */}
      {copiedToast && (
        <div className="absolute top-4 right-4 z-30 bg-on-surface text-surface px-4 py-2 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
          Post copied to clipboard!
        </div>
      )}

      {/* Mockup Header bar */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-surface-container-high/60 gap-space-md">
        <div className="flex items-center gap-space-sm">
          <div className="w-3 h-3 rounded-full bg-error/80"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="ml-2 font-mono-code text-mono-code text-on-surface-variant font-semibold">
            PostFlow Studio // Executive Engine
          </span>
        </div>

        {/* Tone & Engine Status */}
        <div className="flex items-center gap-space-sm">
          <div className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-emerald-50 text-emerald-800 font-label-sm text-label-sm font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Voice Match: 98.4% Calibrated</span>
          </div>

          {/* Cadence Selector Dropdown */}
          <div className="relative">
            <button
              id="cadence-dropdown-toggle"
              onClick={() => setShowCadenceDropdown(!showCadenceDropdown)}
              className="px-space-sm py-1 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Cadence: {activeCadence.name}</span>
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>

            {showCadenceDropdown && (
              <div className="absolute right-0 mt-1.5 w-64 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container-high z-40 p-1.5 animate-in fade-in">
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-outline">
                  Switch Creator Architecture
                </div>
                {CREATOR_CADENCES.map((cadence) => (
                  <button
                    key={cadence.id}
                    onClick={() => {
                      setActiveCadenceId(cadence.id);
                      setShowCadenceDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex flex-col ${
                      activeCadenceId === cadence.id
                        ? 'bg-surface-container text-primary font-semibold'
                        : 'text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="font-semibold">{cadence.name}</span>
                    <span className="text-[11px] text-on-surface-variant line-clamp-1">
                      {cadence.hookFramework}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg pt-4">
        {/* Left: Input & Prompt Area (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          {/* Preset Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-semibold text-outline-variant uppercase shrink-0">Sample Thoughts:</span>
            {PRESET_THOUGHTS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] shrink-0 transition-all font-medium ${
                  selectedPresetId === preset.id
                    ? 'bg-primary-container text-on-primary font-semibold'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {preset.title}
              </button>
            ))}
          </div>

          {/* Raw Input Box */}
          <div className="p-space-md bg-surface-container-low rounded-xl border border-surface-container-high/50">
            <div className="flex items-center justify-between mb-space-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
                Raw Input Thought
              </span>
              <span className="font-mono-code text-mono-code text-on-surface-variant">
                {wordCount} words
              </span>
            </div>
            <div className="relative">
              <textarea
                id="raw-thought-input"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={4}
                className="w-full font-body-md text-body-md text-on-surface italic bg-surface-container-lowest p-3 rounded-lg shadow-sm border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                placeholder="Type your unpolished founder thought or bullet point here..."
              />
              <button
                id="synthesize-trigger-btn"
                onClick={handleSynthesize}
                disabled={isSynthesizing}
                className="mt-2 w-full py-1.5 px-3 rounded-lg bg-secondary text-on-secondary text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-secondary-container transition-all active:scale-[0.99] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isSynthesizing ? 'sync' : 'auto_awesome'}
                </span>
                <span>{isSynthesizing ? 'Synthesizing Cadence...' : 'Synthesize 3 Variants'}</span>
              </button>
            </div>
          </div>

          {/* Voice Attributes DNA Breakdown */}
          <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col gap-space-sm border border-surface-container-high/50">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
                Calibrated Profile Metrics
              </span>
              <span className="text-[11px] text-primary font-semibold">Live Analysis</span>
            </div>

            <div>
              <div className="flex justify-between font-label-sm text-label-sm mb-1 text-on-surface">
                <span>Contrarian Tension</span>
                <span className="font-semibold text-secondary">{activeCadence.tensionScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full transition-all duration-500"
                  style={{ width: `${activeCadence.tensionScore}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-label-sm text-label-sm mb-1 text-on-surface">
                <span>Sentence Cadence Variance</span>
                <span className="font-semibold text-primary">{activeCadence.cadenceVariance}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-container rounded-full transition-all duration-500"
                  style={{ width: `${activeCadence.cadenceVariance}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-label-sm text-label-sm mb-1 text-on-surface">
                <span>Dwell-Time Probability</span>
                <span className="font-semibold text-emerald-600">{activeCadence.dwellProbability}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${activeCadence.dwellProbability}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Interactive Format Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-container-high rounded-xl">
            {(['punchy', 'story', 'listicle'] as VariantType[]).map((type) => {
              const isActive = activeVariant === type;
              const labels: Record<VariantType, string> = {
                punchy: 'Punchy',
                story: 'Story',
                listicle: 'Listicle',
              };
              return (
                <button
                  key={type}
                  id={`tab-${type}`}
                  onClick={() => setActiveVariant(type)}
                  className={`flex-1 py-1.5 text-center font-label-md text-label-md rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {labels[type]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Authentic LinkedIn Post Simulator (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl shadow-md border border-surface-container-high p-space-lg flex flex-col justify-between">
          <div>
            {/* Author bar */}
            <div className="flex items-center justify-between pb-space-md border-b border-surface-container-high/40">
              <div className="flex items-center gap-space-sm">
                <img
                  alt="Alex Rivera executive author portrait"
                  className="w-10 h-10 rounded-full object-cover shadow-sm border border-surface-container-high"
                  src={ASSETS.authorAvatar}
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-headline-sm text-headline-sm text-on-surface">
                      Alex Rivera
                    </span>
                    <span className="text-on-surface-variant font-body-sm">• 1st</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate max-w-[280px] sm:max-w-md">
                    SaaS Founder | Ex-VP Growth | Building scale architectures
                  </p>
                  <p className="font-label-sm text-label-sm text-outline flex items-center gap-1">
                    <span>Just now</span> •{' '}
                    <span className="material-symbols-outlined text-[13px]">public</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  title="Copy Post Copy"
                  className="text-on-surface-variant hover:text-primary p-1.5 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>
                </button>
                <button
                  aria-label="Post options"
                  className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
              </div>
            </div>

            {/* Virality Hook Meter Strip */}
            <div className="py-2.5 px-3 my-3 bg-surface-container-low rounded-lg flex flex-wrap items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                  {currentVariantData.badge}
                </span>
                <span className="text-on-surface-variant">Hook Fold: <strong>142 Chars Safe</strong></span>
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant font-mono-code text-[11px]">
                <span>{currentVariantData.charCount} chars</span>
                <span>{currentVariantData.gradeLevel}</span>
                <span className="text-emerald-700 font-semibold">{currentVariantData.estimatedDwellSec}s Dwell</span>
              </div>
            </div>

            {/* Post Content Variants Area */}
            <div
              id={`variant-${activeVariant}`}
              className="font-body-md text-body-md text-on-surface space-y-3 leading-relaxed py-2 min-h-[220px]"
            >
              <p className="font-semibold text-primary text-[15px]">
                {currentVariantData.hook}
              </p>

              {currentVariantData.body.map((para, idx) => (
                <p key={idx} className="text-on-surface">
                  {para}
                </p>
              ))}

              <p className="text-on-surface-variant font-medium pt-1">
                {currentVariantData.takeaway}
              </p>
            </div>

            {/* Social Engagement Stats */}
            <div className="flex items-center justify-between pt-3 pb-2 text-xs text-on-surface-variant border-b border-surface-container-high/60">
              <div className="flex items-center gap-1.5">
                <span className="flex -space-x-1">
                  <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-white">👍</span>
                  <span className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center text-[10px] text-white">💡</span>
                  <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white">❤️</span>
                </span>
                <span>{likes}</span>
              </div>
              <div className="flex items-center gap-3">
                <span>{reposts} reposts</span>
                <span>47 comments</span>
              </div>
            </div>

            {/* Simulated Comments Drawer */}
            {showComments && (
              <div className="p-3 my-2 bg-surface-container-low rounded-lg space-y-2 border border-surface-container-high/70 text-xs">
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">MC</span>
                  <div>
                    <span className="font-semibold text-on-surface">Marcus Chen</span>
                    <p className="text-on-surface-variant">Spot on Alex. Early Kubernetes architecture is pure vanity before PMF.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Simulated Interaction Footer Ribbon */}
          <div className="pt-space-md mt-space-md bg-surface-container-low -mx-space-lg -mb-space-lg px-space-lg py-space-sm rounded-b-xl flex items-center justify-between border-t border-surface-container-high/60">
            <div className="flex items-center gap-space-lg">
              <button
                id="post-like-btn"
                onClick={handleLike}
                className={`flex items-center gap-1.5 font-label-md text-label-md transition-colors cursor-pointer ${
                  hasLiked ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {hasLiked ? 'thumb_up' : 'thumb_up'}
                </span>
                <span>Like</span>
              </button>

              <button
                id="post-comment-btn"
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                <span>Comment</span>
              </button>

              <button
                id="post-repost-btn"
                onClick={handleRepost}
                className={`flex items-center gap-1.5 font-label-md text-label-md transition-colors cursor-pointer ${
                  hasReposted ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">repeat</span>
                <span>Repost</span>
              </button>
            </div>

            <button
              id="post-autoschedule-btn"
              onClick={() => onOpenSchedule(getFullPostText())}
              className="px-space-md py-1.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-primary shadow-sm flex items-center gap-1 active:scale-[0.99] cursor-pointer transition-all"
            >
              <span>Auto-Schedule</span>
              <span className="material-symbols-outlined text-[15px]">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
