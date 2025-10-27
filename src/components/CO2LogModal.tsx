import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CO2Event } from '@/hooks/use-earth-climate';
import { Factory, Rocket, Package } from 'lucide-react';

interface CO2LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: CO2Event[];
  currentCO2: number;
}

export default function CO2LogModal({ isOpen, onClose, events, currentCO2 }: CO2LogModalProps) {
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getActionIcon = (action: CO2Event['action']) => {
    switch (action) {
      case 'building':
        return <Factory className="w-4 h-4 text-orange-400" />;
      case 'ship_construct':
        return <Package className="w-4 h-4 text-blue-400" />;
      case 'ship_launch':
        return <Rocket className="w-4 h-4 text-red-400" />;
    }
  };

  const getActionLabel = (action: CO2Event['action']) => {
    switch (action) {
      case 'building':
        return 'Building';
      case 'ship_construct':
        return 'Ship Built';
      case 'ship_launch':
        return 'Ship Launch';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-slate-800 border-slate-600">
        <DialogHeader>
          <DialogTitle className="text-2xl text-slate-200">Earth CO₂ Emissions Log</DialogTitle>
          <DialogDescription className="text-slate-400">
            Track of all CO₂ emissions from human activity on Earth
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-medium">Current CO₂ Level:</span>
            <span className="text-2xl font-bold text-orange-400">{currentCO2} ppm</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-slate-300 font-medium">Total Events:</span>
            <span className="text-lg font-bold text-slate-200">{events.length}</span>
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {events.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No emissions recorded yet. Start building to see your environmental impact.
            </div>
          ) : (
            <div className="space-y-2">
              {[...events].reverse().map((event, index) => (
                <div
                  key={events.length - index - 1}
                  className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getActionIcon(event.action)}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-slate-300">
                          {getActionLabel(event.action)}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{event.description}</p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-red-400">+{event.co2Added} ppm CO₂</span>
                        <span className="text-slate-500">Total: {event.totalCO2} ppm</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
