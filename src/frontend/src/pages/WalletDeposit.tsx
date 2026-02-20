import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserBalance, useDeposit } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import GamingCard from '../components/common/GamingCard';
import GamingButton from '../components/common/GamingButton';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Wallet, Coins, Copy, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function WalletDeposit() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const navigate = useNavigate();
  const { data: balance, isLoading: balanceLoading } = useGetUserBalance();
  const deposit = useDeposit();
  const [amount, setAmount] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [copied, setCopied] = useState(false);

  const isAuthenticated = !!identity;
  const UPI_ID = 'NIRANJAN0508@FAM';
  const actorAvailable = !!actor && !actorFetching;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, navigate]);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!actorAvailable) {
      toast.error('System is initializing. Please wait a moment and try again.');
      return;
    }

    const amountNum = parseInt(amount);
    if (amountNum < 10 || amountNum > 100) {
      return;
    }
    deposit.mutate(amountNum, {
      onSuccess: () => {
        setShowPayment(true);
      },
    });
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    toast.success('UPI ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAuthenticated) {
    return null;
  }

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

      {/* Actor Status Warning */}
      {!actorAvailable && (
        <GamingCard glowColor="orange">
          <div className="flex items-center space-x-3 text-ff-orange">
            <AlertCircle size={24} />
            <p className="text-sm">System is initializing... Please wait a moment before making a deposit.</p>
          </div>
        </GamingCard>
      )}

      {/* Deposit Form */}
      <GamingCard glowColor="cyan">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
          <Wallet className="mr-2 text-ff-cyan" size={24} />
          Deposit Coins
        </h2>
        <form onSubmit={handleDeposit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground">
              Amount (₹10 - ₹100)
            </Label>
            <Input
              id="amount"
              type="number"
              min="10"
              max="100"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-background border-muted-foreground/20 focus:border-ff-cyan text-lg"
              required
              disabled={!actorAvailable}
            />
            <p className="text-sm text-muted-foreground">
              1₹ = 1 Coin • Minimum: ₹10 • Maximum: ₹100
            </p>
          </div>
          <GamingButton
            type="submit"
            className="w-full"
            disabled={deposit.isPending || !amount || parseInt(amount) < 10 || parseInt(amount) > 100 || !actorAvailable}
          >
            {deposit.isPending ? 'Processing...' : 'Submit Deposit Request'}
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
            <span>Enter the amount you want to deposit (₹10 to ₹100)</span>
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
