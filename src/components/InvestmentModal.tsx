import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInvestment } from '@/hooks/use-investment';
import { toast } from 'sonner';

interface InvestmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credits: number;
  spendCredits: (amount: number) => boolean;
  setCredits: (credits: number) => void;
}

export function InvestmentModal({ open, onOpenChange, credits, spendCredits, setCredits }: InvestmentModalProps) {
  const { investedAmount, deposit, withdraw, interestRateDisplay } = useInvestment();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!spendCredits(amount)) {
      toast.error('Insufficient credits');
      return;
    }

    if (deposit(amount)) {
      toast.success(`Deposited ${amount.toFixed(1)} credits`);
      setDepositAmount('');
    } else {
      // Refund if deposit failed
      setCredits(credits + amount);
      toast.error('Deposit failed');
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (withdraw(amount)) {
      setCredits(credits + amount);
      toast.success(`Withdrew ${amount.toFixed(1)} credits`);
      setWithdrawAmount('');
    } else {
      toast.error('Insufficient invested amount');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Invest</DialogTitle>
        </DialogHeader>

        <div className="border-2 border-border rounded-lg p-8 mt-4">
          <div className="grid grid-cols-4 gap-8">
            {/* Deposit Section */}
            <div className="flex flex-col items-center space-y-3">
              <h3 className="text-lg font-medium">Deposit</h3>
              <Input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0"
                className="text-center text-xl w-32"
              />
              <Button onClick={handleDeposit} size="sm">
                Deposit
              </Button>
            </div>

            {/* Withdraw Section */}
            <div className="flex flex-col items-center space-y-3">
              <h3 className="text-lg font-medium">withdraw</h3>
              <Input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0"
                className="text-center text-xl w-32"
              />
              <Button onClick={handleWithdraw} size="sm" variant="secondary">
                Withdraw
              </Button>
            </div>

            {/* Invested Section */}
            <div className="flex flex-col items-center space-y-3">
              <h3 className="text-lg font-medium">invested</h3>
              <div className="text-2xl font-bold">
                {investedAmount.toFixed(2)}
              </div>
            </div>

            {/* Rate Section */}
            <div className="flex flex-col items-center space-y-3">
              <h3 className="text-lg font-medium">rate</h3>
              <div className="text-2xl font-bold text-green-500">
                {interestRateDisplay}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground text-center">
          <p>Interest compounds every second at a rate of 0.5% per hour.</p>
          <p className="mt-1">Available credits: <span className="font-semibold">{credits.toFixed(2)}</span></p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
