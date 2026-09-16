import React, { useState } from 'react';
import { ASSETS } from '../data/mockData';

interface NavbarProps {
  onOpenTrial: () => void;
  onOpenSignIn: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTrial, onOpenSignIn }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('features');

  const navItems = [
    { id: 'features', label: 'Features', href: '#features' },
    { id: 'voice-engine', label: 'Voice Engine', href: '#interactive-demo' },
    { id: 'how-it-works', label: 'How It Works', href: '#how-it-works' },
    { id: 'wall-of-love', label: 'Wall of Love', href: '#wall-of-love' },
    { id: 'pricing', label: 'Pricing', href: '#pricing' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high/50">
      <div className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-space-lg">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-space-md group" id="brand-logo-btn">
          <img
            alt="PostFlow Logo"
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
            src={ASSETS.logo}
          />
          <span className="font-headline-lg text-headline-lg tracking-tight text-on-surface font-bold">
            PostFlow
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-space-sm" id="desktop-navbar">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <a
                key={item.id}
                id={`nav-${item.id}`}
                href={item.href}
                onClick={() => setActiveNav(item.id)}
                className={`px-space-md py-space-sm font-label-md text-label-md transition-colors rounded-lg ${
                  isActive
                    ? 'bg-surface-container text-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-space-md">
          <button
            id="navbar-signin-btn"
            onClick={onOpenSignIn}
            className="hidden sm:inline-flex px-space-md py-space-sm font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            id="navbar-trial-btn"
            onClick={onOpenTrial}
            className="inline-flex items-center justify-center px-space-lg py-space-sm font-label-md text-label-md text-on-primary bg-primary-container hover:bg-primary rounded-lg shadow-sm transition-all active:scale-[0.99] cursor-pointer"
          >
            Start Free Trial
          </button>
          <button
            id="navbar-avatar-btn"
            onClick={onOpenSignIn}
            aria-label="User Profile"
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm shrink-0 text-on-primary cursor-pointer hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </button>

          {/* Mobile hamburger */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface border-b border-surface-container-high px-6 py-4 shadow-lg flex flex-col gap-2">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={() => {
                setActiveNav(item.id);
                setMobileMenuOpen(false);
              }}
              className="px-4 py-2.5 rounded-lg text-on-surface hover:bg-surface-container font-medium text-sm transition-colors"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-2 border-t border-surface-container-high flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSignIn();
              }}
              className="flex-1 py-2 text-center text-sm font-medium text-on-surface-variant hover:bg-surface-container-low rounded-lg"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTrial();
              }}
              className="flex-1 py-2 text-center text-sm font-medium text-on-primary bg-primary-container hover:bg-primary rounded-lg"
            >
              Free Trial
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
