import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import FlowDemo from '../components/FlowDemo';
import Benefits from '../components/Benefits';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

const Index = () => {
  useEffect(() => {
    document.title = 'wozza | Build AI-powered WhatsApp Bots Visually - No Code Required';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Features />
      <FlowDemo />
      <Benefits />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
