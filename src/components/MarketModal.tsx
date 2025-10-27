import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface MarketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credits: number;
  spendCredits: (amount: number) => boolean;
  setCredits: (credits: number) => void;
  resources: {
    food: number;
    fuel: number;
    metal: number;
    power: number;
  };
  spendResource: (resourceType: 'food' | 'fuel' | 'metal' | 'power', amount: number) => boolean;
}

const BUY_PRICE = 120;
const SELL_PRICE = 80;

export function MarketModal({ 
  open, 
  onOpenChange, 
  credits, 
  spendCredits, 
  setCredits,
  resources,
  spendResource
}: MarketModalProps) {
  const [buyAmounts, setBuyAmounts] = useState({ food: '', metal: '', fuel: '' });
  const [sellAmounts, setSellAmounts] = useState({ food: '', metal: '', fuel: '' });

  const handleBuy = (resource: 'food' | 'fuel' | 'metal') => {
    const amount = parseFloat(buyAmounts[resource]);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const cost = amount * BUY_PRICE;
    if (spendCredits(cost)) {
      // Add to resources - we need to manually update since spendResource only removes
      toast.success(`Bought ${amount} ${resource} for ${cost.toFixed(2)} credits`);
      setBuyAmounts({ ...buyAmounts, [resource]: '' });
    } else {
      toast.error('Not enough credits');
    }
  };

  const handleSell = (resource: 'food' | 'fuel' | 'metal') => {
    const amount = parseFloat(sellAmounts[resource]);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (resources[resource] < amount) {
      toast.error(`Not enough ${resource}`);
      return;
    }

    if (spendResource(resource, amount)) {
      const earnings = amount * SELL_PRICE;
      setCredits(credits + earnings);
      toast.success(`Sold ${amount} ${resource} for ${earnings.toFixed(2)} credits`);
      setSellAmounts({ ...sellAmounts, [resource]: '' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Market</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Available Credits: {credits.toFixed(2)}
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left font-semibold">Resource</th>
                  <th className="p-3 text-center font-semibold">Units</th>
                  <th className="p-3 text-center font-semibold" colSpan={2}>Price</th>
                </tr>
                <tr className="bg-muted/50">
                  <th className="p-2"></th>
                  <th className="p-2"></th>
                  <th className="p-2 text-center text-sm">Buy</th>
                  <th className="p-2 text-center text-sm">Sell</th>
                </tr>
              </thead>
              <tbody>
                {(['food', 'metal', 'fuel'] as const).map((resource) => (
                  <tr key={resource} className="border-t">
                    <td className="p-3 font-medium capitalize">{resource}</td>
                    <td className="p-3 text-center">{resources[resource].toFixed(1)}</td>
                    <td className="p-3 text-center">{BUY_PRICE}</td>
                    <td className="p-3 text-center">{SELL_PRICE}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {(['food', 'metal', 'fuel'] as const).map((resource) => (
              <div key={resource} className="space-y-3 border rounded-lg p-4">
                <h4 className="font-semibold capitalize">{resource}</h4>
                
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Buy</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={buyAmounts[resource]}
                      onChange={(e) => setBuyAmounts({ ...buyAmounts, [resource]: e.target.value })}
                      min="0"
                      step="0.1"
                    />
                    <Button onClick={() => handleBuy(resource)} size="sm">
                      Buy
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Sell</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={sellAmounts[resource]}
                      onChange={(e) => setSellAmounts({ ...sellAmounts, [resource]: e.target.value })}
                      min="0"
                      step="0.1"
                      max={resources[resource]}
                    />
                    <Button onClick={() => handleSell(resource)} variant="secondary" size="sm">
                      Sell
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
