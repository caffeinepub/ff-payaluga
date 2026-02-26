import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserBalance, useDeposit } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { useRetryConnection } from '../hooks/useRetryConnection';
import { categorizeConnectionError } from '../utils/errorMessages';
import GamingCard from '../components/common/GamingCard';
import GamingButton from '../components/common/GamingButton';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Wallet, Coins, Copy, Check, AlertCircle, Loader2, RefreshCw, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

export default function WalletDeposit() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const navigate = useNavigate();
  const { data: balance, isLoading: balanceLoading } = useGetUserBalance();
  const deposit = useDeposit();
  const { isRetrying, retryCount, manualRetry } = useRetryConnection();
  const [amount, setAmount] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);

  const isAuthenticated = !!identity;
  const UPI_ID = 'NIRANJAN0508@FAM';

  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] WalletDeposit - Component mounted/updated:`, { 
      actor: !!actor, 
      actorFetching,
      isAuthenticated,
      retryCount,
      identity: identity?.getPrincipal().toString()
    });
  }, [actor, actorFetching, isAuthenticated, retryCount, identity]);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('[WalletDeposit] User not authenticated - redirecting to login');
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, navigate]);

  // Track connection errors
  useEffect(() => {
    if (!actorFetching && !actor && isAuthenticated) {
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] WalletDeposit - Actor not available after initialization`);
      setConnectionError(new Error('Failed to connect to the system'));
    } else if (actor) {
      setConnectionError(null);
    }
  }, [actor, actorFetching, isAuthenticated]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Deposit attempt initiated:`, { 
      actor: !!actor, 
      actorFetching,
      amount,
      isAuthenticated
    });
    
    // Validate actor availability
    if (!actor) {
      const errorMsg = 'Unable to connect to the system. Please refresh the page and try again.';
      console.error(`[${timestamp}] Deposit blocked: Actor not available`);
      toast.error(errorMsg);
      return;
    }

    // Check if actor is still initializing
    if (actorFetching) {
      const errorMsg = 'System is initializing. Please wait a moment and try again.';
      console.error(`[${timestamp}] Deposit blocked: Actor still initializing`);
      toast.error(errorMsg);
      return;
    }

    // Validate amount
    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum < 5 || amountNum > 100) {
      toast.error('Please enter a valid amount between ₹5 and ₹100');
      return;
    }

    console.log(`[${timestamp}] Submitting deposit for amount: ₹${amountNum}`);
    
    try {
      deposit.mutate(amountNum, {
        onSuccess: () => {
          const successTimestamp = new Date().toISOString();
          console.log(`[${successTimestamp}] Deposit request successful - showing payment details`);
          setShowPayment(true);
          toast.success('Deposit request submitted! Please complete the payment.');
        },
        onError: (error: Error) => {
          const errorTimestamp = new Date().toISOString();
          console.error(`[${errorTimestamp}] Deposit submission error:`, {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
          
          // Provide user-friendly error messages
          let errorMessage = 'Unable to submit deposit. Please try again.';
          if (error.message.includes('Actor not available')) {
            errorMessage = 'Connection lost. Please refresh the page and try again.';
          } else if (error.message.includes('Invalid deposit amount')) {
            errorMessage = 'Please enter an amount between ₹5 and ₹100';
          } else if (error.message.includes('Unauthorized')) {
            errorMessage = 'Please log in again to continue';
          } else if (error.message.includes('not registered')) {
            errorMessage = 'Please complete your profile setup first';
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          toast.error(errorMessage);
        },
      });
    } catch (error: any) {
      const errorTimestamp = new Date().toISOString();
      console.error(`[${errorTimestamp}] Unexpected error during deposit:`, {
        message: error?.message,
        stack: error?.stack
      });
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    toast.success('UPI ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Show loading state while actor is initializing
  if (actorFetching || isRetrying) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Rendering loading state:`, { 
      actorFetching, 
      isRetrying, 
      retryCount 
    });
    
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-ff-orange mb-2">Wallet</h1>
          <p className="text-muted-foreground">Manage your coins and deposits</p>
        </div>

        <GamingCard glowColor="orange">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 text-ff-orange animate-spin" />
            <p className="text-xl font-semibold text-foreground">
              {isRetrying ? `Retrying Connection (${retryCount}/3)...` : 'Connecting to System...'}
            </p>
            <p className="text-sm text-muted-foreground">
              {isRetrying 
                ? 'Attempting to reconnect to the network' 
                : 'Please wait while we establish a secure connection'}
            </p>
          </div>
        </GamingCard>
      </div>
    );
  }

  // Show error state if actor failed to initialize
  if (!actor || connectionError) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Rendering error state:`, { 
      actor: !!actor, 
      connectionError: connectionError?.message
    });
    
    const errorInfo = categorizeConnectionError(connectionError || new Error('Actor not available'));
    
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-ff-orange mb-2">Wallet</h1>
          <p className="text-muted-foreground">Manage your coins and deposits</p>
        </div>

        <GamingCard glowColor="orange">
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="relative">
              <WifiOff className="h-16 w-16 text-destructive" />
              <AlertCircle className="h-8 w-8 text-destructive absolute -bottom-1 -right-1" />
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold text-foreground">{errorInfo.title}</p>
              <p className="text-base text-muted-foreground max-w-md">
                {errorInfo.description}
              </p>
            </div>

            <div className="bg-background/50 border border-muted-foreground/20 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                What you can try:
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {errorInfo.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 bg-ff-orange/20 rounded-full flex items-center justify-center text-ff-orange text-xs font-bold mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            {retryCount > 0 && (
              <div className="text-xs text-muted-foreground bg-background/30 px-4 py-2 rounded-lg">
                Previous retry attempts: {retryCount}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <GamingButton
                onClick={manualRetry}
                className="flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Refresh Page
              </GamingButton>
              <GamingButton
                onClick={() => navigate({ to: '/dashboard' })}
                variant="secondary"
              >
                Back to Dashboard
              </GamingButton>
            </div>
          </div>
        </GamingCard>
      </div>
    );
  }

  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Rendering main deposit form - actor available and ready`);
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-ff-orange mb-2">Wallet</h1>
        <p className="text-muted-foreground">Manage your coins and deposits</p>
      </div>

      {/* Balance Card */}
      <GamingCard glowColor="orange">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Coins className="text-ff-orange" size={28} />
              <h2 className="text-2xl font-bold text-foreground">Current Balance</h2>
            </div>
            {balanceLoading ? (
              <p className="text-3xl font-bold text-muted-foreground">Loading...</p>
            ) : (
              <p className="text-5xl font-bold text-ff-orange">{balance?.toString() || '0'} Coins</p>
            )}
          </div>
          <img src="/assets/generated/wallet-icon.dim_128x128.png" alt="Wallet" className="h-24 w-24 opacity-50" />
        </div>
      </GamingCard>

      {/* Deposit Form */}
      <GamingCard glowColor="cyan">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
          <Wallet className="mr-2 text-ff-cyan" size={24} />
          Deposit Coins
        </h2>
        <form onSubmit={handleDeposit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground">
              Amount (₹5 - ₹100)
            </Label>
            <Input
              id="amount"
              type="number"
              min="5"
              max="100"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-background border-muted-foreground/20 focus:border-ff-cyan text-lg"
              required
              disabled={deposit.isPending}
            />
            <p className="text-sm text-muted-foreground">
              1₹ = 1 Coin • Minimum: ₹5 • Maximum: ₹100
            </p>
          </div>
          <GamingButton
            type="submit"
            className="w-full"
            disabled={deposit.isPending || !amount || parseInt(amount) < 5 || parseInt(amount) > 100}
          >
            {deposit.isPending ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : (
              'Submit Deposit Request'
            )}
          </GamingButton>
        </form>
      </GamingCard>

      {/* UPI Payment Display */}
      {showPayment && (
        <GamingCard glowColor="orange">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-2">
              <Wallet className="text-ff-orange" size={28} />
              <h2 className="text-2xl font-bold text-foreground">Complete Payment</h2>
            </div>
            <p className="text-muted-foreground text-lg">
              Pay ₹{amount} using the UPI ID below
            </p>

            {/* UPI ID Display */}
            <div className="bg-gradient-to-br from-ff-orange/20 to-ff-orange/5 border-2 border-ff-orange/50 rounded-xl p-6 space-y-4">
              <p className="text-sm font-semibold text-ff-orange uppercase tracking-wide">UPI ID</p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <p className="text-3xl md:text-4xl font-bold text-foreground font-mono break-all">
                  {UPI_ID}
                </p>
                <button
                  onClick={handleCopyUPI}
                  className="flex-shrink-0 p-3 bg-ff-orange hover:bg-ff-orange/80 text-background rounded-lg transition-all active:scale-95"
                  aria-label="Copy UPI ID"
                >
                  {copied ? <Check size={24} /> : <Copy size={24} />}
                </button>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-background/50 border border-muted-foreground/20 rounded-lg p-6 text-left space-y-3">
              <h3 className="text-lg font-bold text-foreground mb-3">Payment Steps:</h3>
              <ol className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-ff-orange rounded-full flex items-center justify-center text-background text-sm font-bold mr-3">
                    1
                  </span>
                  <span>Open your UPI payment app (Google Pay, PhonePe, Paytm, etc.)</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-ff-orange rounded-full flex items-center justify-center text-background text-sm font-bold mr-3">
                    2
                  </span>
                  <span>Select "Send Money" or "Pay to UPI ID"</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-ff-orange rounded-full flex items-center justify-center text-background text-sm font-bold mr-3">
                    3
                  </span>
                  <span>Enter or paste the UPI ID: <strong className="text-ff-orange">{UPI_ID}</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-ff-orange rounded-full flex items-center justify-center text-background text-sm font-bold mr-3">
                    4
                  </span>
                  <span>Enter the amount: <strong className="text-ff-orange">₹{amount}</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-ff-orange rounded-full flex items-center justify-center text-background text-sm font-bold mr-3">
                    5
                  </span>
                  <span>Complete the payment and wait for admin verification</span>
                </li>
              </ol>
            </div>

            <div className="bg-ff-orange/10 border border-ff-orange/30 rounded-lg p-4">
              <p className="text-sm text-foreground">
                <strong>Important:</strong> After completing the payment, please wait for admin verification.
                Your coins will be added to your wallet once the payment is confirmed.
              </p>
            </div>

            <GamingButton
              onClick={() => {
                setShowPayment(false);
                setAmount('');
              }}
              variant="secondary"
            >
              Submit Another Deposit
            </GamingButton>
          </div>
        </GamingCard>
      )}

      {/* Instructions */}
      <GamingCard>
        <h3 className="text-xl font-bold text-foreground mb-4">How to Deposit</h3>
        <ol className="space-y-3 text-muted-foreground">
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-ff-orange rounded-full flex items-center justify-center text-background text-sm font-bold mr-3">
              1
            </span>
            <span>Enter the amount you want to deposit (₹5 to ₹100)</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-ff-orange rounded-full flex items-center justify-center text-background text-sm font-bold mr-3">
              2
            </span>
            <span>Click "Submit Deposit Request" to see the UPI payment details</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-ff-orange rounded-full flex items-center justify-center text-background text-sm font-bold mr-3">
              3
            </span>
            <span>Use the provided UPI ID to complete the payment via your UPI app</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-ff-orange rounded-full flex items-center justify-center text-background text-sm font-bold mr-3">
              4
            </span>
            <span>Wait for admin verification (coins will be added automatically after approval)</span>
          </li>
        </ol>
      </GamingCard>
    </div>
  );
}
