import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Trophy, Zap } from "lucide-react";

interface Mission {
  id: string;
  title: string;
  description: string;
  reward: string;
  difficulty: "easy" | "medium" | "hard";
  completed: boolean;
  category: "resource" | "exploration" | "development";
}

// Sample missions data
const missions: Mission[] = [
  {
    id: "1",
    title: "First Colony",
    description: "Establish your first colony on any celestial body",
    reward: "1000 Credits",
    difficulty: "easy",
    completed: false,
    category: "exploration"
  },
  {
    id: "2",
    title: "Resource Surplus",
    description: "Accumulate 10,000 of any resource",
    reward: "500 Credits",
    difficulty: "medium",
    completed: false,
    category: "resource"
  },
  {
    id: "3",
    title: "Climate Restoration",
    description: "Restore Earth's temperature to pre-industrial levels",
    reward: "5000 Credits",
    difficulty: "hard",
    completed: false,
    category: "development"
  }
];

interface MissionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MissionsModal({ open, onOpenChange }: MissionsModalProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-emerald-400";
      case "medium": return "text-yellow-400";
      case "hard": return "text-red-400";
      default: return "text-slate-400";
    }
  };

  const MissionCard = ({ mission }: { mission: Mission }) => (
    <div className={`p-4 rounded-lg border transition-all ${
      mission.completed 
        ? "bg-emerald-500/10 border-emerald-500/30" 
        : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50"
    }`}>
      <div className="flex items-start gap-3">
        {mission.completed ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
        ) : (
          <Circle className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold ${mission.completed ? "text-emerald-400" : "text-slate-200"}`}>
              {mission.title}
            </h3>
            <Badge variant="outline" className={`text-xs ${getDifficultyColor(mission.difficulty)}`}>
              {mission.difficulty}
            </Badge>
          </div>
          <p className="text-sm text-slate-400 mb-2">{mission.description}</p>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">{mission.reward}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const activeMissions = missions.filter(m => !m.completed);
  const completedMissions = missions.filter(m => m.completed);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Zap className="w-6 h-6 text-yellow-400" />
            Missions
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All ({missions.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({activeMissions.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedMissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="flex-1 overflow-y-auto space-y-3 mt-4">
            {missions.map(mission => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </TabsContent>

          <TabsContent value="active" className="flex-1 overflow-y-auto space-y-3 mt-4">
            {activeMissions.length > 0 ? (
              activeMissions.map(mission => (
                <MissionCard key={mission.id} mission={mission} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <CheckCircle2 className="w-12 h-12 mb-2" />
                <p>All missions completed!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="flex-1 overflow-y-auto space-y-3 mt-4">
            {completedMissions.length > 0 ? (
              completedMissions.map(mission => (
                <MissionCard key={mission.id} mission={mission} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Trophy className="w-12 h-12 mb-2" />
                <p>No missions completed yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
