import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SocialProof } from './components/SocialProof';
import { Workflow } from './components/Workflow';
import { Features } from './components/Features';
import { Comparison } from './components/Comparison';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { CtaBanner } from './components/CtaBanner';
import { Footer } from './components/Footer';
import { TrialModal } from './components/TrialModal';
import { ScheduleModal } from './components/ScheduleModal';
import { DemoModal } from './components/DemoModal';
import { AuthModal } from './components/AuthModal';

export function App() {
  const [trialOpen, setTrialOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('pro');
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduledText, setScheduledText] = useState('');
  const [demoOpen, setDemoOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const handleOpenTrial = (planId: string = 'pro') => {
    setSelectedPlanId(planId);
    setTrialOpen(true);
  };

  const handleOpenSchedule = (postText: string) => {
    setScheduledText(postText);
    setScheduleOpen(true);
  };

  const handleBookOnboarding = () => {
    setSelectedPlanId('agency');
    setTrialOpen(true);
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Top Fixed Header Navbar */}
      <Navbar
        onOpenTrial={() => handleOpenTrial('pro')}
        onOpenSignIn={() => setAuthOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-20">
        {/* Hero Section with Centerpiece Interactive Studio */}
        <Hero
          onOpenTrial={() => handleOpenTrial('pro')}
          onOpenDemo={() => setDemoOpen(true)}
          onOpenSchedule={handleOpenSchedule}
        />

        {/* Social Proof Strip */}
        <SocialProof />

        {/* 3-Step How It Works Workflow */}
        <Workflow />

        {/* Core Differentiators & Feature Grid */}
        <Features />

        {/* Live Before vs After Comparison */}
        <Comparison />

        {/* Founder Testimonials / Wall of Love */}
        <Testimonials />

        {/* Pricing Plans */}
        <Pricing onSelectPlan={(planId) => handleOpenTrial(planId)} />

        {/* Final High-Impact CTA */}
        <CtaBanner
          onOpenTrial={() => handleOpenTrial('pro')}
          onBookOnboarding={handleBookOnboarding}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Modals */}
      <TrialModal
        isOpen={trialOpen}
        onClose={() => setTrialOpen(false)}
        initialPlanId={selectedPlanId}
      />

      <ScheduleModal
        isOpen={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        postContent={scheduledText}
      />

      <DemoModal
        isOpen={demoOpen}
        onClose={() => setDemoOpen(false)}
        onOpenTrial={() => handleOpenTrial('pro')}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onOpenTrial={() => handleOpenTrial('pro')}
      />
    </div>
  );
}

export default App;
