import { ReactNode } from 'react';
import Navigation from './Navigation';
import { Heart, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [copied, setCopied] = useState(false);
  const websiteUrl = window.location.origin;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(websiteUrl);
      setCopied(true);
      toast.success('Website URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Battle Background Overlay */}
      <div 
        className="fixed inset-0 z-0 opacity-10"
        style={{
          backgroundImage: 'url(/assets/generated/ff-battle-bg.dim_1920x1080.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      ></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navigation />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="relative">
            {/* Battle-themed backdrop for content */}
            <div className="absolute inset-0 bg-gradient-to-b from-ff-orange/5 via-transparent to-ff-cyan/5 rounded-3xl -z-10"></div>
            {children}
          </div>
        </main>

        <footer className="bg-card/80 backdrop-blur-sm border-t-2 border-ff-orange/30 py-6 mt-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Website URL Copy Section */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground font-medium">Share TN FF BATTLE:</span>
                <button
                  onClick={handleCopyUrl}
                  className="flex items-center gap-2 px-4 py-2 bg-ff-orange/10 hover:bg-ff-orange/20 border border-ff-orange/40 rounded-lg transition-all group"
                >
                  <span className="text-sm font-mono text-ff-orange truncate max-w-[200px] sm:max-w-xs">
                    {websiteUrl}
                  </span>
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <Copy className="w-4 h-4 text-ff-orange group-hover:scale-110 transition-transform flex-shrink-0" />
                  )}
                </button>
              </div>

              {/* Attribution */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>© {new Date().getFullYear()} TN FF BATTLE. Built with</span>
                <Heart className="w-4 h-4 text-ff-orange fill-ff-orange animate-pulse" />
                <span>using</span>
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ff-cyan hover:text-ff-orange transition-colors font-semibold"
                >
                  caffeine.ai
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
