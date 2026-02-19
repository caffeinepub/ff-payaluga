import { ReactNode } from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background bg-gaming-texture">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-border/50 mt-16 py-6 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} FF PAYALUGA. All rights reserved.</p>
          <p className="mt-2">
            Built with love using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ff-orange hover:text-ff-cyan transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
