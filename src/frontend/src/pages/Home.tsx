import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import GamingButton from '../components/common/GamingButton';
import GamingCard from '../components/common/GamingCard';
import { Trophy, Wallet, Shield, Zap } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src="/assets/generated/ff-hero-banner.dim_1200x400.png"
          alt="FF PAYALUGA Hero"
          className="w-full h-64 md:h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent flex items-end">
          <div className="p-8 md:p-12 w-full">
            <h1 className="text-4xl md:text-6xl font-bold text-ff-orange mb-4 animate-pulse">
              FF PAYALUGA
            </h1>
            <p className="text-xl md:text-2xl text-foreground mb-6">
              Join the Ultimate Free Fire 1v1 Clash Squad Tournament
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <>
                  <GamingButton onClick={() => navigate({ to: '/tournament' })} size="lg">
                    <Trophy className="mr-2" size={20} />
                    Join Tournament
                  </GamingButton>
                  <GamingButton onClick={() => navigate({ to: '/dashboard' })} variant="secondary" size="lg">
                    View Dashboard
                  </GamingButton>
                </>
              ) : (
                <GamingButton onClick={() => navigate({ to: '/login' })} size="lg">
                  Get Started
                </GamingButton>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GamingCard glowColor="orange">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-4 bg-ff-orange/20 rounded-full">
              <Trophy className="text-ff-orange" size={32} />
            </div>
            <h3 className="text-xl font-bold text-foreground">1v1 Tournaments</h3>
            <p className="text-muted-foreground">
              Compete in intense Free Fire Clash Squad 1v1 matches
            </p>
          </div>
        </GamingCard>

        <GamingCard glowColor="cyan">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-4 bg-ff-cyan/20 rounded-full">
              <Wallet className="text-ff-cyan" size={32} />
            </div>
            <h3 className="text-xl font-bold text-foreground">Easy Deposits</h3>
            <p className="text-muted-foreground">
              Deposit ₹10-₹100 via Google Pay and get instant coins
            </p>
          </div>
        </GamingCard>

        <GamingCard glowColor="orange">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-4 bg-ff-orange/20 rounded-full">
              <Zap className="text-ff-orange" size={32} />
            </div>
            <h3 className="text-xl font-bold text-foreground">Quick Matches</h3>
            <p className="text-muted-foreground">
              Fast-paced matches with instant room details via WhatsApp
            </p>
          </div>
        </GamingCard>

        <GamingCard glowColor="cyan">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-4 bg-ff-cyan/20 rounded-full">
              <Shield className="text-ff-cyan" size={32} />
            </div>
            <h3 className="text-xl font-bold text-foreground">Secure Platform</h3>
            <p className="text-muted-foreground">
              Safe and verified tournament management system
            </p>
          </div>
        </GamingCard>
      </div>

      {/* How It Works */}
      <GamingCard className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-ff-orange mb-6 text-center">How It Works</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-ff-orange rounded-full flex items-center justify-center text-background font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Register & Login</h4>
              <p className="text-muted-foreground">Create your account and get a unique User ID</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-ff-orange rounded-full flex items-center justify-center text-background font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Deposit Coins</h4>
              <p className="text-muted-foreground">Add funds to your wallet via Google Pay (₹10-₹100)</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-ff-orange rounded-full flex items-center justify-center text-background font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Join Tournament</h4>
              <p className="text-muted-foreground">Enter your Free Fire UID and WhatsApp number to join</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-ff-orange rounded-full flex items-center justify-center text-background font-bold">
              4
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Get Room Details</h4>
              <p className="text-muted-foreground">Receive room ID and password via WhatsApp from admin</p>
            </div>
          </div>
        </div>
      </GamingCard>
    </div>
  );
}
