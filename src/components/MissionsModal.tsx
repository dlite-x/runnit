import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Trophy, Zap, Lightbulb } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";

interface Mission {
  id: string;
  title: string;
  description: string;
  tips: string;
  reward: string;
  difficulty: "easy" | "medium" | "hard";
  completed: boolean;
  category: "resource" | "exploration" | "development";
}

// Sample missions data
const missions: Mission[] = [
  {
    id: "1",
    title: "Colonize Mars",
    description: "Establish your first colony on Mars. Launch a ship with colonists to begin building humanity's first Martian settlement.",
    tips: "Build a Ship Construction Facility first, then use the Launch Ship modal to send colonists to Mars. Make sure you have enough resources for the journey.",
    reward: "1000 Credits",
    difficulty: "easy",
    completed: false,
    category: "exploration"
  },
  {
    id: "2",
    title: "Populate Mars >1000",
    description: "Grow your Mars colony to over 1000 inhabitants. Ensure sustainable resource production to support population growth.",
    tips: "Send multiple colonization missions and ensure your Mars colony has adequate food, water, and energy production to support growth.",
    reward: "1000 Credits",
    difficulty: "medium",
    completed: false,
    category: "exploration"
  },
  {
    id: "3",
    title: "Populate EML1 >100",
    description: "Establish a thriving space station at the Earth-Moon Lagrange Point 1 with over 100 inhabitants.",
    tips: "EML1 is a strategic location for space operations. Build space stations and continuously supply them with resources and colonists.",
    reward: "1 Antimatter",
    difficulty: "medium",
    completed: false,
    category: "exploration"
  },
  {
    id: "4",
    title: "Construct Proxima One",
    description: "Build the ultimate interstellar vessel capable of reaching Proxima Centauri. This requires massive resources and advanced technology.",
    tips: "This is an end-game objective. Focus on maximizing all resource production and upgrading all facilities to maximum levels before attempting.",
    reward: "1 Joule",
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
  const [selectedMission, setSelectedMission] = useState<Mission>(missions[0]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-emerald-400 border-emerald-400/50";
      case "medium": return "text-yellow-400 border-yellow-400/50";
      case "hard": return "text-red-400 border-red-400/50";
      default: return "text-slate-400 border-slate-400/50";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col top-[10%] translate-y-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Zap className="w-6 h-6 text-yellow-400" />
            Missions
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-4">
          {/* Left side - Mission List */}
          <div className="w-2/5 flex flex-col">
            <div className="space-y-2 overflow-y-auto pr-2">
              {missions.map((mission, index) => (
                <button
                  key={mission.id}
                  onClick={() => setSelectedMission(mission)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedMission.id === mission.id
                      ? "bg-primary/20 border-primary"
                      : mission.completed
                      ? "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50"
                      : "bg-card border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground font-medium min-w-[1.5rem]">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {mission.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <h3 className={`font-semibold text-sm ${
                          mission.completed ? "text-emerald-400" : "text-foreground"
                        }`}>
                          {mission.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Trophy className="w-3 h-3 text-yellow-400" />
                        <span className="text-yellow-400 font-medium">{mission.reward}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right side - Mission Details */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Card className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Mission Header */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-2xl font-bold text-foreground">
                    {selectedMission.title}
                  </h2>
                  <Badge variant="outline" className={`text-sm ${getDifficultyColor(selectedMission.difficulty)}`}>
                    {selectedMission.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-lg font-semibold text-yellow-400">{selectedMission.reward}</span>
                </div>
                {selectedMission.completed && (
                  <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/30">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">Mission Completed!</span>
                  </div>
                )}
              </div>

              {/* Description Section */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedMission.description}
                </p>
              </div>

              {/* Tips Section */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-foreground">Tips</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedMission.tips}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
