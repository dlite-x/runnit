import React from 'react';
import { X } from 'lucide-react';

interface ShipLaunchModalProps {
  shipName: string;
  shipType: 'colony' | 'cargo';
  isVisible: boolean;
  onClose: () => void;
  onLaunch: () => void;
}

const ShipLaunchModal: React.FC<ShipLaunchModalProps> = ({
  shipName,
  shipType,
  isVisible,
  onClose,
  onLaunch
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-4 min-w-[280px] max-w-[320px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-foreground">
          Ship Control
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded-sm transition-colors"
        >
          <X size={16} className="text-muted-foreground" />
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Selected:</span> {shipName}
        </div>
        
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Type:</span> {shipType === 'colony' ? 'Colony Ship' : 'Cargo Ship'}
        </div>
        
        <button
          onClick={onLaunch}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-md transition-colors"
        >
          Launch {shipName}
        </button>
      </div>
    </div>
  );
};

export default ShipLaunchModal;