import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import EarthVisualization from '@/components/EarthVisualization';
import { useGameState } from '@/hooks/useGameState';
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
  const [showGrid, setShowGrid] = useState(false);
  const [aliens, setAliens] = useState<Array<{ id: string; position: [number, number, number]; active: boolean }>>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Update player credits function for game state hook
  const updatePlayerCredits = (newCredits: number) => {
    if (player) {
      setPlayer({ ...player, credits: newCredits });
      
      // Update localStorage for guest mode
      const isGuestMode = localStorage.getItem('guestMode') === 'true';
      if (isGuestMode) {
        const guestUser = JSON.parse(localStorage.getItem('guestUser') || '{}');
        guestUser.credits = newCredits;
        localStorage.setItem('guestUser', JSON.stringify(guestUser));
      }
    }
  };

  // Update colonies function for resource generation
  const updateColonies = (updatedColonies: Colony[]) => {
    setColonies(updatedColonies);
    
    // Update localStorage for guest mode
    const isGuestMode = localStorage.getItem('guestMode') === 'true';
    if (isGuestMode) {
      // Store updated colonies in localStorage if needed
      localStorage.setItem('guestColonies', JSON.stringify(updatedColonies));
    }
  };

  // Initialize game state hook
  const gameState = useGameState(player, colonies, updatePlayerCredits, updateColonies);

  useEffect(() => {
    // Check if we're in guest mode first
    const isGuestMode = localStorage.getItem('guestMode') === 'true';
    
    if (!isGuestMode) {
      // Only check auth if not in guest mode
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (!session) {
          navigate('/auth');
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [navigate]);

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      // Check if we're in guest mode
      const isGuestMode = localStorage.getItem('guestMode') === 'true';
      
      if (isGuestMode) {
        // Load demo data for guest mode
        const guestUser = JSON.parse(localStorage.getItem('guestUser') || '{}');
        
        setPlayer({
          id: 'guest-player',
          credits: guestUser.credits || 5000
        });

        // Set demo colonies
        setColonies([
          {
            id: 'demo-earth',
            planet: { name: 'Earth', base_temperature: 15 },
            population: 250,
            food_stockpile: 500,
            fuel_stockpile: 300,
            metal_stockpile: 400
          },
          {
            id: 'demo-moon',
            planet: { name: 'Moon', base_temperature: -20 },
            population: 75,
            food_stockpile: 200,
            fuel_stockpile: 150,
            metal_stockpile: 180
          }
        ]);

        // Set demo missions
        setMissions([
          {
            id: 'demo-mission-1',
            name: 'Lunar Colony',
            description: 'Establish a colony on the Moon with 50 people',
            reward_credits: 5000,
            status: 'active'
          },
          {
            id: 'demo-mission-2',
            name: 'Mars Settlement',
            description: 'Build a colony on Mars with 100 people',
            reward_credits: 15000,
            status: 'active'
          }
        ]);

        return;
      }

      // Regular authenticated user flow
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
    // Clear guest mode if active
    localStorage.removeItem('guestMode');
    localStorage.removeItem('guestUser');
    
    // Only sign out from Supabase if not in guest mode
    const isGuestMode = localStorage.getItem('guestMode') === 'true';
    if (!isGuestMode) {
      await supabase.auth.signOut();
    }
    
    navigate('/auth');
  };

  const deployAlien = () => {
    const newAlien = {
      id: `alien-${Date.now()}`,
      position: [
        (Math.random() - 0.5) * 10, // Random X position around Earth
        (Math.random() - 0.5) * 4,  // Random Y position  
        (Math.random() - 0.5) * 10  // Random Z position
      ] as [number, number, number],
      active: true
    };
    
    setAliens(prev => [...prev, newAlien]);
    toast({
      title: "Alien Deployed",
      description: "An alien ship has been deployed and is now active!",
    });
  };

  const toggleGrid = () => {
    setShowGrid(!showGrid);
    toast({
      title: showGrid ? "Grid Hidden" : "Grid Displayed",
      description: showGrid ? "Map grid has been hidden" : "Green grid overlay is now visible",
    });
  };

  const constructFactory = async () => {
    console.log('Construct Factory clicked, current credits:', player?.credits);
    await purchaseBuilding('Farm');
    console.log('After purchase, credits should be:', player?.credits);
  };

  const buildFighterDrones = () => {
    toast({
      title: "Fighter Drones",
      description: "Building fighter drones at shipyard",
    });
  };

  const launchMiningOperation = () => {
    toast({
      title: "Mining Operation",
      description: "Mining operation launched on asteroid belt",
    });
  };

  const resetGameState = () => {
    // Reset game timer
    gameState.resetTimer();
    
    // Reset the working credits display to 5000
    if ((window as any).resetTestCredits) {
      (window as any).resetTestCredits();
    }
    
    // Reset player credits
    if (player) {
      updatePlayerCredits(5000);
    }
    
    // Clear all deployed aliens
    setAliens([]);
    
    // Reset colonies to initial demo state
    setColonies([
      {
        id: 'demo-earth',
        planet: { name: 'Earth', base_temperature: 15 },
        population: 250,
        food_stockpile: 500,
        fuel_stockpile: 300,
        metal_stockpile: 400
      },
      {
        id: 'demo-moon',
        planet: { name: 'Moon', base_temperature: -20 },
        population: 75,
        food_stockpile: 200,
        fuel_stockpile: 150,
        metal_stockpile: 180
      }
    ]);
    
    // Reset missions
    setMissions([
      {
        id: 'demo-mission-1',
        name: 'Lunar Colony',
        description: 'Establish a colony on the Moon with 50 people',
        reward_credits: 5000,
        status: 'active'
      },
      {
        id: 'demo-mission-2',
        name: 'Mars Settlement',
        description: 'Build a colony on Mars with 100 people',
        reward_credits: 15000,
        status: 'active'
      }
    ]);

    toast({
      title: "Game Reset",
      description: "All game state has been reset to initial values",
    });
  };

  const purchaseBuilding = async (buildingTypeName: string) => {
    if (!player || !colonies.length) return;

    try {
      // Find the Earth colony for demo
      const earthColony = colonies.find(c => c.planet.name === 'Earth');
      if (!earthColony) {
        toast({
          title: "No Colony Found",
          description: "You need an Earth colony to build on",
          variant: "destructive",
        });
        return;
      }

      // Get building type ID by name using real database IDs
      const buildingTypeMap: { [key: string]: string } = {
        'Farm': 'fce1558f-8cb7-408e-a9f5-92cbad835d19',
        'Mine': '9223ad60-9a20-4b6c-91c3-8c2cdd2ac88e',
        'Power Plant': '378f059b-5517-49ef-9744-c37502c4b190',
        'Research Lab': '13fdbbd6-b816-441c-941a-ec451fec743a',
        'Fuel Refinery': 'e62d47a0-8926-4075-aabd-176d08e39086'
      };

      console.log(`Attempting to purchase ${buildingTypeName} for colony ${earthColony.id}`);

      const response = await supabase.functions.invoke('purchase-building', {
        body: {
          colony_id: earthColony.id,
          building_type_id: buildingTypeMap[buildingTypeName]
        }
      });

      console.log('Purchase response:', response);

      if (response.error) {
        throw new Error(response.error.message || 'Failed to purchase building');
      }

      const { data } = response;

      // Update player credits immediately
      if (data?.remaining_credits !== undefined) {
        updatePlayerCredits(data.remaining_credits);
      }
      
      toast({
        title: "Building Constructed",
        description: `${buildingTypeName} built for ${data?.cost_paid || 0} credits!`,
      });

      // Refresh game data to show updates
      await loadGameData();

    } catch (error: any) {
      toast({
        title: "Construction Failed",
        description: error.message,
        variant: "destructive",
      });
    }
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
      {/* 3D Visualization */}
      <div className="w-full h-screen">
        <EarthVisualization 
          onSignOut={handleSignOut}
          player={player}
          showOperations={showOperations}
          setShowOperations={setShowOperations}
          gameTime={gameState.formattedGameTime}
          creditGenerationRate={gameState.creditGenerationRate}
          showGrid={showGrid}
          aliens={aliens}
          onResetCredits={() => {}} // We'll need to expose the testCredits reset
        />
      </div>

      {/* Operations Panel */}
      {showOperations && (
        <div className="absolute top-16 right-4 w-80 bg-background/95 backdrop-blur-sm border rounded-lg p-4 z-40 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Operations</h2>
          
          {/* Game Controls */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm">Game Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" className="w-full" variant="destructive" onClick={resetGameState}>
                Reset Game State
              </Button>
              <Button size="sm" className="w-full" variant="outline" onClick={deployAlien}>
                Deploy Alien
              </Button>
              <Button size="sm" className="w-full" variant="outline" onClick={toggleGrid}>
                {showGrid ? 'Hide Grid' : 'Show Grid'}
              </Button>
              <Button size="sm" className="w-full" variant="outline" onClick={() => constructFactory()}>
                Construct Farm
              </Button>
              <Button size="sm" className="w-full" variant="outline" onClick={buildFighterDrones}>
                Build Fighter Drones
              </Button>
              <Button size="sm" className="w-full" variant="outline" onClick={launchMiningOperation}>
                Launch Mining Operation
              </Button>
            </CardContent>
          </Card>

          {/* Colony Status */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm">Colony Status</CardTitle>
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

          {/* Mission Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Mission Status</CardTitle>
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
        </div>
      )}
    </div>
  );
};

export default Game;