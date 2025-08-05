import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Heart } from 'lucide-react';
import logo from '@/images/wozza.png';

const Footer = () => {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo and Description */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src={logo} alt="wozza logo" className="w-12 h-12 rounded-xl bg-primary object-cover shadow-lg" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                wozza
              </span>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
              Create intelligent WhatsApp bots without coding. Automate customer service, 
              boost sales, and grow your business with AI-powered conversations.
            </p>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
            <Link
              to="/privacy-policy"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              Privacy Policy
            </Link>
            <div className="hidden sm:block w-1 h-1 bg-muted-foreground rounded-full"></div>
            <Link
              to="/terms-of-service"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              Terms of Service
            </Link>
          </div>

          <Separator className="my-8" />

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-muted-foreground text-sm">
            <p>© 2025 wozza. All rights reserved.</p>
            <div className="hidden sm:block">•</div>
            <p className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-500" /> for businesses
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
