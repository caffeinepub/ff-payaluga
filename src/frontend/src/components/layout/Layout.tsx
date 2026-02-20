import { ReactNode, useState } from 'react';
import Navigation from './Navigation';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    const url = window.location.origin;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Website URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Battle Background Overlay */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background/80"></div>
      </div>
      
      <div className="relative z-10">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t-2 border-ff-orange/30 mt-16 py-6 bg-card/40 backdrop-blur-md shadow-lg shadow-ff-orange/5">
          <div className="container mx-auto px-4 text-center space-y-4">
            {/* Website URL Section */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground font-medium">Share this platform:</span>
              <div className="flex items-center gap-2 bg-background/60 border-2 border-ff-orange/40 rounded-lg px-3 py-2 shadow-ff-orange">
                <span className="text-sm font-mono text-ff-orange break-all font-semibold">
                  {window.location.origin}
                </span>
                <button
                  onClick={handleCopyUrl}
                  className="flex-shrink-0 p-1 hover:bg-ff-orange/20 rounded transition-colors"
                  aria-label="Copy URL"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-ff-cyan" />
                  ) : (
                    <Copy className="w-4 h-4 text-ff-orange" />
                  )}
                </button>
              </div>
            </div>

            {/* Copyright and Attribution */}
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">© {new Date().getFullYear()} FF PAYALUGA. All rights reserved.</p>
              <p className="mt-2">
                Built with love using{' '}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ff-orange hover:text-ff-cyan transition-colors font-semibold"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
