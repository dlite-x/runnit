import { useState, useEffect, useRef } from 'react';

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

interface Player {
  id: string;
  credits: number;
}

interface GameState {
  gameTime: number; // in seconds
  isRunning: boolean;
  creditGenerationRate: number; // credits per second
}

interface ResourceGeneration {
  food: number;
  fuel: number;
  metal: number;
}

export const useGameState = (
  player: Player | null, 
  colonies: Colony[], 
  updatePlayerCredits: (newCredits: number) => void,
  updateColonies?: (updatedColonies: Colony[]) => void
) => {
  const [gameTime, setGameTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef(Date.now());

  // Calculate credit generation rate based on colonies (very slow rate)
  const calculateCreditGeneration = () => {
    if (!colonies.length) return 0;
    
    // Earth generates +50 credits per year, other planets generate +50 per year
    // Convert to credits per second: (credits per year) / (365.25 days * 24 hours * 3600 seconds)
    const rate = colonies.reduce((total, colony) => {
      const creditsPerYear = 50; // All planets now generate +50 credits per year
      const creditsPerSecond = creditsPerYear / (365.25 * 24 * 3600);
      return total + creditsPerSecond;
    }, 0);
    console.log(`Credit generation rate: ${rate} credits/second for ${colonies.length} colonies`);
    return rate;
  };

  const creditGenerationRate = calculateCreditGeneration();

  // Calculate resource generation rates
  const calculateResourceGeneration = (): ResourceGeneration => {
    if (!colonies.length) return { food: 0, fuel: 0, metal: 0 };
    
    return colonies.reduce((total, colony) => {
      // Base resource production per year based on population and planet type
      const populationFactor = colony.population / 100; // Scale with population
      const planetMultiplier = colony.planet.name === 'Earth' ? 1.2 : 1.0;
      
      // Production rates per year
      const foodPerYear = (20 + populationFactor * 10) * planetMultiplier;
      const fuelPerYear = (15 + populationFactor * 5) * planetMultiplier;
      const metalPerYear = (10 + populationFactor * 8) * planetMultiplier;
      
      // Convert to per second (1 year = 86400 seconds)
      return {
        food: total.food + (foodPerYear / 86400),
        fuel: total.fuel + (fuelPerYear / 86400),
        metal: total.metal + (metalPerYear / 86400)
      };
    }, { food: 0, fuel: 0, metal: 0 });
  };

  const resourceGeneration = calculateResourceGeneration();

  // Format game time as years (1 day = 1 year, so 1 second = 1/86400 years)
  const formatGameTime = (seconds: number) => {
    const years = seconds / 86400; // 86400 seconds in a day = 1 year
    return years.toFixed(2);
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const deltaTime = (now - lastUpdateRef.current) / 1000; // Convert to seconds
        lastUpdateRef.current = now;

        setGameTime(prev => {
          const newTime = prev + deltaTime;
          
          // Generate credits
          if (player && creditGenerationRate > 0) {
            const creditsGenerated = deltaTime * creditGenerationRate;
            const newCredits = Math.floor(player.credits + creditsGenerated);
            // Only log every 5 seconds to reduce console spam
            if (Math.floor(newTime) % 5 === 0 && Math.floor(newTime) !== Math.floor(prev)) {
              console.log(`Generating credits: ${creditsGenerated.toFixed(6)} per interval, total: ${newCredits}`);
            }
            updatePlayerCredits(newCredits);
          }
          
          // Generate resources and handle population growth
          if (colonies.length > 0 && updateColonies) {
            const updatedColonies = colonies.map(colony => {
              const newColony = { ...colony };
              
              // Generate resources
              newColony.food_stockpile += Math.floor(deltaTime * resourceGeneration.food);
              newColony.fuel_stockpile += Math.floor(deltaTime * resourceGeneration.fuel);
              newColony.metal_stockpile += Math.floor(deltaTime * resourceGeneration.metal);
              
              // Population growth/decline based on food availability
              const foodConsumptionPerSecond = (newColony.population * 0.1) / 86400; // 0.1 food per person per year
              const foodDeficit = foodConsumptionPerSecond * deltaTime;
              
              if (newColony.food_stockpile >= foodDeficit) {
                newColony.food_stockpile -= Math.floor(foodDeficit);
                // Population growth when well-fed (slow growth)
                if (newColony.food_stockpile > newColony.population * 2) {
                  const growthRate = (0.02 / 86400) * deltaTime; // 2% growth per year
                  if (Math.random() < growthRate) {
                    newColony.population += 1;
                  }
                }
              } else {
                // Population decline when starving
                const starvationRate = (0.05 / 86400) * deltaTime; // 5% decline per year
                if (Math.random() < starvationRate && newColony.population > 1) {
                  newColony.population -= 1;
                }
                newColony.food_stockpile = 0;
              }
              
              return newColony;
            });
            
            updateColonies(updatedColonies);
          }
          
          return newTime;
        });
      }, 100); // Update every 100ms for smooth timer
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, player, creditGenerationRate, resourceGeneration, updatePlayerCredits, updateColonies, colonies]);

  const togglePause = () => {
    setIsRunning(!isRunning);
    lastUpdateRef.current = Date.now(); // Reset timing when resuming
  };

  const resetTimer = () => {
    setGameTime(0);
    lastUpdateRef.current = Date.now();
  };

  return {
    gameTime,
    formattedGameTime: formatGameTime(gameTime),
    isRunning,
    creditGenerationRate,
    resourceGeneration,
    togglePause,
    resetTimer
  };
};