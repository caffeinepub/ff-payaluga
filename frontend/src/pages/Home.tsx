import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Trophy, Wallet, Shield, Zap, Target, Users } from 'lucide-react';
import GamingButton from '../components/common/GamingButton';
import GamingCard from '../components/common/GamingCard';

export default function Home() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="space-y-16">
      {/* Hero Section with Battle Background */}
      <section className="relative py-20 px-4 rounded-2xl overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/assets/generated/ff-header-bg.dim_1200x400.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-ff-orange/20 via-transparent to-background/80 z-0"></div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-ff-orange text-shadow-ff font-gaming tracking-tight">
            FREE FIRE BATTLE ARENA
          </h1>
          <p className="text-xl md:text-2xl text-foreground/90 mb-8 font-medium">
            Join the ultimate Free Fire tournament platform. Compete, Win, Dominate!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <GamingButton
                  onClick={() => navigate({ to: '/tournament' })}
                  variant="primary"
                  size="lg"
                  className="shadow-ff-glow"
                >
                  <Trophy className="mr-2" size={20} />
                  Join Tournament
                </GamingButton>
                <GamingButton
                  onClick={() => navigate({ to: '/dashboard' })}
                  variant="secondary"
                  size="lg"
                >
                  <Target className="mr-2" size={20} />
                  View Dashboard
                </GamingButton>
              </>
            ) : (
              <GamingButton
                onClick={() => navigate({ to: '/login' })}
                variant="primary"
                size="lg"
                className="shadow-ff-glow animate-pulse-glow"
              >
                <Zap className="mr-2" size={20} />
                Get Started Now
              </GamingButton>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GamingCard glowColor="orange" className="text-center hover:scale-105 transition-transform">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-ff-orange/20 rounded-full border-2 border-ff-orange/40">
              <Trophy className="w-8 h-8 text-ff-orange" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2 text-ff-orange font-gaming">Epic Tournaments</h3>
          <p className="text-muted-foreground">
            Compete in high-stakes Free Fire tournaments with real rewards
          </p>
        </GamingCard>

        <GamingCard glowColor="cyan" className="text-center hover:scale-105 transition-transform">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-ff-cyan/20 rounded-full border-2 border-ff-cyan/40">
              <Wallet className="w-8 h-8 text-ff-cyan" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2 text-ff-cyan font-gaming">Instant Deposits</h3>
          <p className="text-muted-foreground">
            Quick and secure coin deposits via UPI payment
          </p>
        </GamingCard>

        <GamingCard glowColor="orange" className="text-center hover:scale-105 transition-transform">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-ff-gold/20 rounded-full border-2 border-ff-gold/40">
              <Users className="w-8 h-8 text-ff-gold" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2 text-ff-gold font-gaming">Battle Matches</h3>
          <p className="text-muted-foreground">
            Track your matches and compete with the best players
          </p>
        </GamingCard>

        <GamingCard glowColor="cyan" className="text-center hover:scale-105 transition-transform">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-ff-cyan/20 rounded-full border-2 border-ff-cyan/40">
              <Shield className="w-8 h-8 text-ff-cyan" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2 text-ff-cyan font-gaming">Secure Platform</h3>
          <p className="text-muted-foreground">
            Built on Internet Computer with top-tier security
          </p>
        </GamingCard>
      </section>

      {/* How It Works Section */}
      <section className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-ff-orange text-shadow-ff font-gaming">
          HOW IT WORKS
        </h2>
        <div className="space-y-6">
          <GamingCard glowColor="orange" className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-ff-orange/20 rounded-full flex items-center justify-center border-2 border-ff-orange/40 font-bold text-ff-orange text-xl">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-ff-orange font-gaming">Login & Register</h3>
              <p className="text-muted-foreground">
                Create your account using Internet Identity for secure authentication
              </p>
            </div>
          </GamingCard>

          <GamingCard glowColor="cyan" className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-ff-cyan/20 rounded-full flex items-center justify-center border-2 border-ff-cyan/40 font-bold text-ff-cyan text-xl">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-ff-cyan font-gaming">Deposit Coins</h3>
              <p className="text-muted-foreground">
                Add coins to your wallet via UPI (₹10-₹100) to enter tournaments
              </p>
            </div>
          </GamingCard>

          <GamingCard glowColor="orange" className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-ff-orange/20 rounded-full flex items-center justify-center border-2 border-ff-orange/40 font-bold text-ff-orange text-xl">
              3
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-ff-orange font-gaming">Join Tournament</h3>
              <p className="text-muted-foreground">
                Enter active tournaments with your Free Fire UID and WhatsApp number
              </p>
            </div>
          </GamingCard>

          <GamingCard glowColor="cyan" className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-ff-cyan/20 rounded-full flex items-center justify-center border-2 border-ff-cyan/40 font-bold text-ff-cyan text-xl">
              4
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-ff-cyan font-gaming">Battle & Win</h3>
              <p className="text-muted-foreground">
                Compete in scheduled matches and claim your victory rewards
              </p>
            </div>
          </GamingCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12">
        <GamingCard glowColor="orange" className="max-w-2xl mx-auto bg-gradient-to-br from-ff-orange/10 to-ff-cyan/10 border-2">
          <h2 className="text-3xl font-bold mb-4 text-ff-orange text-shadow-ff font-gaming">
            READY FOR BATTLE?
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Join thousands of players in the ultimate Free Fire tournament experience
          </p>
          {isAuthenticated ? (
            <GamingButton
              onClick={() => navigate({ to: '/tournament' })}
              variant="primary"
              size="lg"
              className="shadow-ff-glow"
            >
              <Trophy className="mr-2" size={20} />
              Enter Tournament Now
            </GamingButton>
          ) : (
            <GamingButton
              onClick={() => navigate({ to: '/login' })}
              variant="primary"
              size="lg"
              className="shadow-ff-glow animate-pulse-glow"
            >
              <Zap className="mr-2" size={20} />
              Start Your Journey
            </GamingButton>
          )}
        </GamingCard>
      </section>
    </div>
  );
}
