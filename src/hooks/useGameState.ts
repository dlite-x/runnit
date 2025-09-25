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

export const useGameState = (player: Player | null, colonies: Colony[], updatePlayerCredits: (newCredits: number) => void) => {
  const [gameTime, setGameTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef(Date.now());

  // Calculate credit generation rate based on colonies
  const calculateCreditGeneration = () => {
    if (!colonies.length) return 0;
    
    // Base credit generation: 1 credit per second per 10 population
    return colonies.reduce((total, colony) => {
      const baseRate = colony.population / 10;
      // Earth generates more credits (more developed economy)
      const planetMultiplier = colony.planet.name === 'Earth' ? 1.5 : 1.0;
      return total + (baseRate * planetMultiplier);
    }, 0);
  };

  const creditGenerationRate = calculateCreditGeneration();

  // Format game time as MM:SS
  const formatGameTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const deltaTime = (now - lastUpdateRef.current) / 1000; // Convert to seconds
        lastUpdateRef.current = now;

        setGameTime(prev => {
          const newTime = prev + deltaTime;
          
          // Generate credits based on time passed and generation rate
          if (player && creditGenerationRate > 0) {
            const creditsGenerated = deltaTime * creditGenerationRate;
            const newCredits = Math.floor(player.credits + creditsGenerated);
            updatePlayerCredits(newCredits);
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
  }, [isRunning, player, creditGenerationRate, updatePlayerCredits]);

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
    togglePause,
    resetTimer
  };
};