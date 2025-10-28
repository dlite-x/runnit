import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { FlaskConical, Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface ResearchModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  researchRate: number;
}

interface ResearchItem {
  id: string;
  name: string;
  unlocked: boolean;
  cost: number;
  level: number;
}

interface ActiveResearch {
  id: string;
  name: string;
  progress: number;
  cost: number;
}

const ResearchModal = ({ isOpen, onOpenChange, researchRate }: ResearchModalProps) => {
  const researchItems: ResearchItem[] = [
    { id: 'ship-speed-1', name: 'Ship Speed 1', unlocked: false, cost: 2, level: 10 },
    { id: 'ship-speed-2', name: 'Ship Speed 2', unlocked: false, cost: 3, level: 20 },
    { id: 'ship-speed-3', name: 'Ship Speed 3', unlocked: false, cost: 5, level: 35 },
    { id: 'ship-speed-4', name: 'Ship Speed 4', unlocked: false, cost: 7, level: 50 },
    { id: 'proxima-scout', name: 'Proxima Scout', unlocked: false, cost: 8, level: 60 },
    { id: 'alpha-centauri-map', name: 'Alpha Centauri Map', unlocked: false, cost: 9, level: 80 },
    { id: 'proxima-map', name: 'Proxima Map', unlocked: false, cost: 10, level: 100 },
    { id: 'efficient-manufacturing', name: 'Efficient Manufacturing', unlocked: false, cost: 4, level: 25 },
    { id: 'lunar-telescope', name: 'Lunar Telescope', unlocked: false, cost: 6, level: 40 },
    { id: 'sunshade-1', name: 'Sunshade 1', unlocked: false, cost: 7, level: 45 },
    { id: 'sunshade-2', name: 'Sunshade 2', unlocked: false, cost: 9, level: 70 },
  ];

  const [activeResearch, setActiveResearch] = useState<ActiveResearch | null>(() => {
    const stored = localStorage.getItem('active_research');
    console.log('ResearchModal initializing activeResearch from localStorage:', stored);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    // Migrate old research costs to new values
    const item = researchItems.find(r => r.id === parsed.id);
    if (item && parsed.cost !== item.cost) {
      const migrated = { ...parsed, cost: item.cost };
      localStorage.setItem('active_research', JSON.stringify(migrated));
      console.log('Migrated activeResearch cost:', migrated);
      return migrated;
    }
    return parsed;
  });

  const [completedResearch, setCompletedResearch] = useState<string[]>(() => {
    const stored = localStorage.getItem('completed_research');
    console.log('ResearchModal initializing completedResearch from localStorage:', stored);
    return stored ? JSON.parse(stored) : [];
  });

  // Reset research state when modal opens if localStorage is empty (after reset)
  useEffect(() => {
    if (isOpen) {
      const storedActive = localStorage.getItem('active_research');
      const storedCompleted = localStorage.getItem('completed_research');
      console.log('ResearchModal opened. Checking reset:', { storedActive, storedCompleted, activeResearch, completedResearch });
      
      if (!storedActive && activeResearch) {
        console.log('Resetting activeResearch to null');
        setActiveResearch(null);
      }
      if (!storedCompleted && completedResearch.length > 0) {
        console.log('Resetting completedResearch to []');
        setCompletedResearch([]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!activeResearch || researchRate <= 0) return;

    const interval = setInterval(() => {
      setActiveResearch(prev => {
        if (!prev) return null;
        
        // Convert RP/hour to RP/second
        const progressPerSecond = researchRate / 3600;
        const newProgress = prev.progress + progressPerSecond;
        
        if (newProgress >= prev.cost) {
          setCompletedResearch(completed => {
            const updated = [...completed, prev.id];
            localStorage.setItem('completed_research', JSON.stringify(updated));
            return updated;
          });
          localStorage.removeItem('active_research');
          return null;
        }
        
        const updated = { ...prev, progress: newProgress };
        localStorage.setItem('active_research', JSON.stringify(updated));
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeResearch, researchRate]);


  const startResearch = (item: ResearchItem) => {
    if (activeResearch || completedResearch.includes(item.id)) return;
    
    const newResearch: ActiveResearch = {
      id: item.id,
      name: item.name,
      progress: 0,
      cost: item.cost,
    };
    
    setActiveResearch(newResearch);
    localStorage.setItem('active_research', JSON.stringify(newResearch));
  };

  const ResearchCard = ({ item }: { item: ResearchItem }) => {
    const isCompleted = completedResearch.includes(item.id);
    const isActive = activeResearch?.id === item.id;
    
    return (
      <Card 
        className={`p-3 border min-w-[140px] transition-all cursor-pointer ${
          isCompleted 
            ? 'bg-green-900/20 border-green-700/50' 
            : isActive 
            ? 'bg-purple-900/20 border-purple-700/50'
            : 'bg-card border-border hover:border-purple-500/50'
        }`}
        onClick={() => !isCompleted && startResearch(item)}
      >
        <div className="flex items-center gap-2 mb-2">
          <FlaskConical className={`w-4 h-4 ${isCompleted ? 'text-green-400' : 'text-purple-400'}`} />
          <span className="text-sm font-semibold text-card-foreground">{item.cost}</span>
        </div>
        <div className="text-sm font-medium text-card-foreground">{item.name}</div>
      </Card>
    );
  };

  const Arrow = () => (
    <div className="relative w-8 h-px bg-border flex items-center">
      <div className="absolute right-0 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-border" />
    </div>
  );

  const VerticalArrow = () => (
    <div className="relative h-12 w-px bg-border flex justify-center">
      <div className="absolute bottom-0 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-border" />
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto top-[calc(15%+175px)]">
        <DialogHeader>
          <DialogTitle>Research Tree</DialogTitle>
        </DialogHeader>
        
        {activeResearch && (
          <Card className="p-4 bg-purple-900/20 border-purple-700/50">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-purple-400" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-card-foreground">{activeResearch.name}</span>
                  <span className="text-sm text-muted-foreground">
                    Progress: {activeResearch.progress.toFixed(1)} / {activeResearch.cost} RP
                  </span>
                </div>
                <Progress 
                  value={(activeResearch.progress / activeResearch.cost) * 100} 
                  className="h-2"
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              +{researchRate} RP/h • Time: {(() => {
                const remainingRP = activeResearch.cost - activeResearch.progress;
                const hoursRemaining = remainingRP / researchRate;
                const hours = Math.floor(hoursRemaining);
                const minutes = Math.floor((hoursRemaining - hours) * 60);
                return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
              })()}
            </div>
          </Card>
        )}
        
        <div className="relative py-8">
          {/* Ship Speed Chain */}
          <div className="flex items-center gap-4 mb-12">
            <ResearchCard item={researchItems[0]} />
            <Arrow />
            <ResearchCard item={researchItems[1]} />
            <Arrow />
            <ResearchCard item={researchItems[2]} />
            <Arrow />
            <ResearchCard item={researchItems[3]} />
          </div>

          {/* Branch to Proxima Scout */}
          <div className="flex items-start gap-4 mb-12 ml-[340px]">
            <div className="flex flex-col items-center">
              <VerticalArrow />
            </div>
            <ResearchCard item={researchItems[4]} />
            <Arrow />
            <ResearchCard item={researchItems[5]} />
            <Arrow />
            <ResearchCard item={researchItems[6]} />
          </div>

          {/* Efficient Manufacturing Branch */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <ResearchCard item={researchItems[7]} />
              <Arrow />
              <ResearchCard item={researchItems[8]} />
            </div>
            
            {/* Sunshade Branch */}
            <div className="flex items-start gap-4 ml-[80px]">
              <div className="flex flex-col items-center">
                <VerticalArrow />
              </div>
              <ResearchCard item={researchItems[9]} />
              <Arrow />
              <ResearchCard item={researchItems[10]} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResearchModal;
