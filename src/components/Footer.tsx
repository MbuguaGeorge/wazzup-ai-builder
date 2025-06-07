
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Mail, Twitter, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "Integrations", href: "#integrations" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "#help" },
        { name: "Tutorials", href: "#tutorials" },
        { name: "Contact", href: "#contact" }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "#privacy" },
        { name: "Terms of Service", href: "#terms" }
      ]
    }
  ];

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">BotBuilder</span>
            </div>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              Create intelligent WhatsApp bots without coding. Automate customer service, 
              boost sales, and grow your business with AI-powered conversations.
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors">
                <Twitter className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors">
                <Linkedin className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors">
                <Github className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>
          
          {/* Footer links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href={link.href} 
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <Separator className="my-8" />
        
        <div className="flex flex-col md:flex-row justify-center items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 BotBuilder. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
