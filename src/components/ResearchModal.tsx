import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";

interface ResearchModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ResearchItem {
  id: string;
  name: string;
  unlocked: boolean;
  cost: number;
}

const ResearchModal = ({ isOpen, onOpenChange }: ResearchModalProps) => {
  // Placeholder research items - functionality to be added later
  const researchItems: ResearchItem[] = [
    { id: 'ship-speed-1', name: 'Ship Speed 1', unlocked: false, cost: 1000 },
    { id: 'ship-speed-2', name: 'Ship Speed 2', unlocked: false, cost: 2000 },
    { id: 'ship-speed-3', name: 'Ship Speed 3', unlocked: false, cost: 4000 },
    { id: 'ship-speed-4', name: 'Ship Speed 4', unlocked: false, cost: 8000 },
    { id: 'proxima-scout', name: 'Proxima Scout', unlocked: false, cost: 10000 },
    { id: 'alpha-centauri-map', name: 'Alpha Centauri Map', unlocked: false, cost: 15000 },
    { id: 'proxima-map', name: 'Proxima Map', unlocked: false, cost: 20000 },
    { id: 'efficient-manufacturing', name: 'Efficient Manufacturing', unlocked: false, cost: 3000 },
    { id: 'lunar-telescope', name: 'Lunar Telescope', unlocked: false, cost: 5000 },
    { id: 'sunshade-1', name: 'Sunshade 1', unlocked: false, cost: 6000 },
    { id: 'sunshade-2', name: 'Sunshade 2', unlocked: false, cost: 12000 },
  ];

  const ResearchCard = ({ item }: { item: ResearchItem }) => (
    <Card className="p-3 bg-card border-border min-w-[140px]">
      <div className="text-sm font-medium text-card-foreground">{item.name}</div>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Research Tree</DialogTitle>
        </DialogHeader>
        
        <div className="relative py-8">
          {/* Ship Speed Chain */}
          <div className="flex items-center gap-4 mb-12">
            <ResearchCard item={researchItems[0]} />
            <div className="h-px w-8 bg-border" />
            <ResearchCard item={researchItems[1]} />
            <div className="h-px w-8 bg-border" />
            <ResearchCard item={researchItems[2]} />
            <div className="h-px w-8 bg-border" />
            <ResearchCard item={researchItems[3]} />
          </div>

          {/* Branch to Proxima Scout */}
          <div className="flex items-start gap-4 mb-12 ml-[340px]">
            <div className="flex flex-col items-center">
              <div className="h-12 w-px bg-border" />
              <div className="h-px w-8 bg-border" />
            </div>
            <ResearchCard item={researchItems[4]} />
            <div className="h-px w-8 bg-border mt-12" />
            <ResearchCard item={researchItems[5]} />
            <div className="h-px w-8 bg-border mt-12" />
            <ResearchCard item={researchItems[6]} />
          </div>

          {/* Efficient Manufacturing Branch */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <ResearchCard item={researchItems[7]} />
              <div className="h-px w-8 bg-border" />
              <ResearchCard item={researchItems[8]} />
            </div>
            
            {/* Sunshade Branch */}
            <div className="flex items-start gap-4 ml-[80px]">
              <div className="flex flex-col items-center">
                <div className="h-12 w-px bg-border" />
                <div className="h-px w-8 bg-border" />
              </div>
              <ResearchCard item={researchItems[9]} />
              <div className="h-px w-8 bg-border mt-12" />
              <ResearchCard item={researchItems[10]} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResearchModal;
