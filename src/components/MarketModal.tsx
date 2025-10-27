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
  addResources: (resourceType: 'food' | 'fuel' | 'metal', amount: number) => void;
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
  spendResource,
  addResources
}: MarketModalProps) {
  const [quantities, setQuantities] = useState({ food: 1, metal: 1, fuel: 1 });

  const handleBuy = (resource: 'food' | 'fuel' | 'metal') => {
    const quantity = quantities[resource];
    if (quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const cost = quantity * BUY_PRICE;
    if (spendCredits(cost)) {
      addResources(resource, quantity);
      toast.success(`Bought ${quantity} ${resource} for ${cost.toFixed(2)} credits`);
    } else {
      toast.error('Not enough credits');
    }
  };

  const handleSell = (resource: 'food' | 'fuel' | 'metal') => {
    const quantity = quantities[resource];
    if (quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (resources[resource] < quantity) {
      toast.error(`Not enough ${resource}`);
      return;
    }

    if (spendResource(resource, quantity)) {
      const earnings = quantity * SELL_PRICE;
      setCredits(credits + earnings);
      toast.success(`Sold ${quantity} ${resource} for ${earnings.toFixed(2)} credits`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Market</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left font-semibold">Resource</th>
                  <th className="p-3 text-center font-semibold">Quantity</th>
                  <th className="p-3 text-center font-semibold" colSpan={2}>Price</th>
                </tr>
                <tr className="bg-muted/50 border-t">
                  <th className="p-2"></th>
                  <th className="p-2"></th>
                  <th className="p-2 text-center text-sm font-medium">Buy</th>
                  <th className="p-2 text-center text-sm font-medium">Sell</th>
                </tr>
              </thead>
              <tbody>
                {(['food', 'metal', 'fuel'] as const).map((resource) => (
                  <tr key={resource} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium capitalize text-lg">{resource}</div>
                      <div className="text-xs text-muted-foreground">Available: {resources[resource].toFixed(1)}</div>
                    </td>
                    <td className="p-4">
                      <Input
                        type="number"
                        min="1"
                        value={quantities[resource]}
                        onChange={(e) => setQuantities({ ...quantities, [resource]: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-24 text-center mx-auto"
                      />
                    </td>
                    <td className="p-4 text-center">
                      <Button
                        onClick={() => handleBuy(resource)}
                        className="w-full bg-blue-400 hover:bg-blue-500 text-white"
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-xs opacity-70">Buy for</span>
                          <span className="font-bold">{(quantities[resource] * BUY_PRICE).toFixed(0)}</span>
                        </div>
                      </Button>
                    </td>
                    <td className="p-4 text-center">
                      <Button
                        onClick={() => handleSell(resource)}
                        className="w-full bg-blue-200 hover:bg-blue-300 text-blue-900"
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-xs opacity-70">Sell for</span>
                          <span className="font-bold">{(quantities[resource] * SELL_PRICE).toFixed(0)}</span>
                        </div>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Unit prices: Buy @ {BUY_PRICE} credits | Sell @ {SELL_PRICE} credits
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
