import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserBalance, useDeposit } from '../hooks/useQueries';
import GamingCard from '../components/common/GamingCard';
import GamingButton from '../components/common/GamingButton';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Wallet, Coins, QrCode } from 'lucide-react';

export default function WalletDeposit() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: balance, isLoading: balanceLoading } = useGetUserBalance();
  const deposit = useDeposit();
  const [amount, setAmount] = useState('');
  const [showQR, setShowQR] = useState(false);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, navigate]);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(amount);
    if (amountNum < 10 || amountNum > 100) {
      return;
    }
    deposit.mutate(amountNum, {
      onSuccess: () => {
        setShowQR(true);
      },
    });
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
            />
            <p className="text-sm text-muted-foreground">
              1₹ = 1 Coin • Minimum: ₹10 • Maximum: ₹100
            </p>
          </div>
          <GamingButton
            type="submit"
            className="w-full"
            disabled={deposit.isPending || !amount || parseInt(amount) < 10 || parseInt(amount) > 100}
          >
            {deposit.isPending ? 'Processing...' : 'Submit Deposit Request'}
          </GamingButton>
        </form>
      </GamingCard>

      {/* QR Code Display */}
      {showQR && (
        <GamingCard glowColor="orange">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <QrCode className="text-ff-orange" size={28} />
              <h2 className="text-2xl font-bold text-foreground">Complete Payment</h2>
            </div>
            <p className="text-muted-foreground">
              Scan the QR code below with Google Pay to complete your deposit of ₹{amount}
            </p>
            <div className="bg-white p-4 rounded-lg inline-block">
              <img
                src="/assets/generated/gpay-qr-code.dim_300x300.png"
                alt="Google Pay QR Code"
                className="w-64 h-64 mx-auto"
              />
            </div>
            <div className="bg-ff-orange/10 border border-ff-orange/30 rounded-lg p-4">
              <p className="text-sm text-foreground">
                <strong>Important:</strong> After completing the payment, please wait for admin verification.
                Your coins will be added to your wallet once the payment is confirmed.
              </p>
            </div>
            <GamingButton
              onClick={() => {
                setShowQR(false);
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
            <span>Click "Submit Deposit Request" to see the Google Pay QR code</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-ff-orange rounded-full flex items-center justify-center text-background text-sm font-bold mr-3">
              3
            </span>
            <span>Scan the QR code with Google Pay and complete the payment</span>
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
