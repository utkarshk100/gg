import React from 'react';
import { ASSETS } from '../data/mockData';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-lowest shadow-[0_-1px_8px_rgba(0,0,0,0.03)] border-t border-surface-container-high/60 pt-space-xl pb-space-lg">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl pb-space-xl">
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-space-md pr-space-lg">
            <div className="flex items-center gap-space-md">
              <img
                alt="PostFlow logo"
                className="h-7 w-auto object-contain"
                src={ASSETS.footerLogo}
              />
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
                PostFlow
              </span>
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              High-velocity AI ghostwriting studio and executive presence architecture for LinkedIn creators, founders, and marketing executives.
            </p>

            <div className="flex items-center gap-space-sm pt-space-xs">
              <a
                href="#interactive-demo"
                aria-label="Global Network"
                className="w-9 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors border border-surface-container-high"
              >
                <span className="material-symbols-outlined text-[18px]">public</span>
              </a>
              <a
                href="#features"
                aria-label="Editorial Feed"
                className="w-9 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors border border-surface-container-high"
              >
                <span className="material-symbols-outlined text-[18px]">rss_feed</span>
              </a>
              <a
                href="#wall-of-love"
                aria-label="Podcast Channel"
                className="w-9 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors border border-surface-container-high"
              >
                <span className="material-symbols-outlined text-[18px]">podcasts</span>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="flex flex-col gap-space-sm">
            <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider font-semibold">
              Product
            </span>
            <a
              href="#interactive-demo"
              className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Voice Engine
            </a>
            <a
              href="#features"
              className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Hook Generator
            </a>
            <a
              href="#features"
              className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Virality Predictor
            </a>
            <a
              href="#pricing"
              className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Pricing Plans
            </a>
          </div>

          {/* Platform Links */}
          <div className="flex flex-col gap-space-sm">
            <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider font-semibold">
              Platform
            </span>
            <a
              href="#how-it-works"
              className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Methodology
            </a>
            <a
              href="#wall-of-love"
              className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Founder Stories
            </a>
            <a
              href="#features"
              className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Executive Playbooks
            </a>
            <a
              href="#pricing"
              className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Enterprise Teams
            </a>
          </div>

          {/* Compliance Links */}
          <div className="flex flex-col gap-space-sm">
            <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider font-semibold">
              Compliance
            </span>
            <a
              href="#features"
              className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Privacy Framework
            </a>
            <a
              href="#pricing"
              className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#features"
              className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Security & SOC2
            </a>
            <a
              href="#how-it-works"
              className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Algorithmic Transparency
            </a>
          </div>
        </div>

        {/* Bottom Legal bar */}
        <div className="pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md text-on-surface-variant border-t border-surface-container-high/60">
          <p className="font-body-sm text-body-sm">
            © 2024 PostFlow Inc. Designed for executive thought leaders. All rights reserved.
          </p>
          <div className="flex items-center gap-space-lg">
            <a
              href="#"
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Security Protocols
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
