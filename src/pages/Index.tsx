import React, { useEffect, useRef, useState } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import FlowDemo from '../components/FlowDemo';
import Benefits from '../components/Benefits';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';
import logo from '@/images/wozza.png';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Menu as MenuIcon, X as CloseIcon } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Features', id: 'features' },
  { label: 'Pricing', id: 'pricing' },
  { label: 'Testimonials', id: 'testimonials' },
];

const Index = () => {
  const navRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.title = 'wozza | Build AI-powered WhatsApp Bots Visually - No Code Required';
    const handleScroll = () => {
      if (!navRef.current) return;
      if (window.scrollY > 40) {
        navRef.current.classList.add('navbar-shrink');
      } else {
        navRef.current.classList.remove('navbar-shrink');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Responsive Navbar */}
      <div className="fixed top-3 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 w-full max-w-4xl px-2 sm:px-0" ref={navRef} style={{ pointerEvents: 'auto' }}>
        {/* Desktop Nav */}
        <nav
          className="hidden sm:flex items-center justify-center gap-40 px-4 py-2 transition-all duration-300 rounded-full bg-background/80 shadow-lg backdrop-blur border border-primary/20 mx-auto"
          style={{ minWidth: 350, maxWidth: 750 }}
        >
          <div className="flex justify-baseline gap-1">
            <img src={logo} alt="wozza logo" className="h-7 w-7" />
            <span className="text-xl font-bold tracking-tight text-primary tracking-tight bg-gradient-to-r from-foreground to-foreground/5 bg-clip-text text-transparent">wozza</span>
          </div>
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="mx-1 p-[0.25rem] text-sm font-medium text-[#1d1d1d] hover:text-[#000] hover:border-primary transition-all duration-200"
              >
                {item.label}
              </button>
            ))}
            <Button size="sm" className="group min-w-[100px] rounded-full" onClick={() => navigate('/signup')}>
              Start building
            </Button>
          </div>
        </nav>
        {/* Mobile Nav */}
        <nav className="flex sm:hidden items-center justify-between px-4 py-2 rounded-full bg-background/80 shadow-lg backdrop-blur border border-primary/20 w-full">
          <div className="flex items-center gap-2">
            <img src={logo} alt="wozza logo" className="h-7 w-7" />
            <span className="text-lg font-bold tracking-tight text-primary tracking-tight bg-gradient-to-r from-foreground to-foreground/5 bg-clip-text text-transparent">wozza</span>
          </div>
          <button
            className="p-2 rounded-full hover:bg-primary/10 transition"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </nav>
        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="sm:hidden absolute left-0 right-0 mt-2 top-full z-50 flex flex-col items-center bg-background/95 rounded-2xl shadow-xl border border-primary/20 py-4 animate-fade-in">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="w-full text-center py-2 px-6 text-base font-medium text-primary hover:bg-primary/10 rounded-full transition mb-1"
              >
                {item.label}
              </button>
            ))}
            <Button size="sm" className="w-4/5 mt-2 rounded-full" onClick={() => { setMobileOpen(false); navigate('/signup'); }}>
              Start building
            </Button>
          </div>
        )}
      </div>
      <Hero />
      <Features />
      <FlowDemo />
      <Benefits />
      <Testimonials />
      <Pricing />
      <Footer />
      <style>{`
        .navbar-shrink nav {
          min-width: 350px !important;
          max-width: 550px !important;
          padding: 0.5rem !important;
          gap: 5rem !important;
          transition: all 0.3s ease-in-out !important;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default Index;
