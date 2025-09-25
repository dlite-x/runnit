import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import EarthVisualization from '@/components/EarthVisualization';
import { LogOut, Settings } from 'lucide-react';

interface Player {
  id: string;
  credits: number;
}

interface Colony {
  id: string;
  planet: {
    name: string;
    base_temperature: number;
  };
  population: number;
  food_stockpile: number;
  fuel_stockpile: number;
  metal_stockpile: number;
}

interface Mission {
  id: string;
  name: string;
  description: string;
  reward_credits: number;
  status: string;
}

const Game = () => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [colonies, setColonies] = useState<Colony[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [showOperations, setShowOperations] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get or create player
      let { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (playerError && playerError.code === 'PGRST116') {
        // Create new player
        const { data: newPlayer, error: createError } = await supabase
          .from('players')
          .insert([{ user_id: user.id, credits: 1000 }])
          .select()
          .single();
        
        if (createError) throw createError;
        playerData = newPlayer;
      } else if (playerError) {
        throw playerError;
      }

      setPlayer(playerData);

      // Load colonies
      const { data: coloniesData, error: coloniesError } = await supabase
        .from('colonies')
        .select(`
          id,
          population,
          food_stockpile,
          fuel_stockpile,
          metal_stockpile,
          planet:planets(name, base_temperature)
        `)
        .eq('player_id', playerData.id);

      if (coloniesError) throw coloniesError;
      setColonies(coloniesData || []);

      // Load active missions
      const { data: missionsData, error: missionsError } = await supabase
        .from('player_missions')
        .select(`
          id,
          status,
          mission:missions(id, name, description, reward_credits)
        `)
        .eq('player_id', playerData.id)
        .eq('status', 'active');

      if (missionsError) throw missionsError;
      setMissions(missionsData?.map(pm => ({
        id: pm.mission.id,
        name: pm.mission.name,
        description: pm.mission.description,
        reward_credits: pm.mission.reward_credits,
        status: pm.status
      })) || []);

    } catch (error: any) {
      toast({
        title: "Error loading game data",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const initializeColony = async (planetName: string) => {
    if (!player) return;

    try {
      const { data: planet, error: planetError } = await supabase
        .from('planets')
        .select('id')
        .eq('name', planetName)
        .single();

      if (planetError) throw planetError;

      const { error: colonyError } = await supabase
        .from('colonies')
        .insert([{
          player_id: player.id,
          planet_id: planet.id,
          population: planetName === 'Earth' ? 100 : 0
        }]);

      if (colonyError) throw colonyError;

      toast({
        title: "Colony Established",
        description: `Your colony on ${planetName} has been established!`,
      });

      loadGameData();
    } catch (error: any) {
      toast({
        title: "Error establishing colony",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!player) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p>Loading...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-background/80 backdrop-blur-sm border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Expanse Colony</h1>
          <Badge variant="secondary">Credits: {player.credits.toLocaleString()}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowOperations(!showOperations)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* 3D Visualization */}
      <div className="w-full h-screen">
        <EarthVisualization />
      </div>

      {/* Operations Panel */}
      {showOperations && (
        <div className="absolute top-16 right-4 w-80 bg-background/95 backdrop-blur-sm border rounded-lg p-4 z-40 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Operations</h2>
          
          {/* Colonies */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm">Colonies ({colonies.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {colonies.length === 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">No colonies established</p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => initializeColony('Earth')}
                  >
                    Start on Earth
                  </Button>
                </div>
              ) : (
                colonies.map((colony) => (
                  <div key={colony.id} className="p-2 border rounded">
                    <h4 className="font-medium">{colony.planet.name}</h4>
                    <p className="text-xs text-muted-foreground">Population: {colony.population}</p>
                    <div className="text-xs space-x-2">
                      <span>Food: {colony.food_stockpile}</span>
                      <span>Fuel: {colony.fuel_stockpile}</span>
                      <span>Metal: {colony.metal_stockpile}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Missions */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm">Active Missions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {missions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active missions</p>
              ) : (
                missions.map((mission) => (
                  <div key={mission.id} className="p-2 border rounded">
                    <h4 className="font-medium text-sm">{mission.name}</h4>
                    <p className="text-xs text-muted-foreground">{mission.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      Reward: {mission.reward_credits} credits
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" className="w-full" variant="outline">
                Research
              </Button>
              <Button size="sm" className="w-full" variant="outline">
                Build Ships
              </Button>
              <Button size="sm" className="w-full" variant="outline">
                Construct Buildings
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Game;