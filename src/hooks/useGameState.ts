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

  // Calculate credit generation rate based on colonies (very slow rate)
  const calculateCreditGeneration = () => {
    if (!colonies.length) return 0;
    
    // Earth generates +10 credits per year, other planets generate +5 per year
    // Convert to credits per second: (credits per year) / (365.25 days * 24 hours * 3600 seconds)
    return colonies.reduce((total, colony) => {
      const creditsPerYear = colony.planet.name === 'Earth' ? 10 : 5;
      const creditsPerSecond = creditsPerYear / (365.25 * 24 * 3600);
      return total + creditsPerSecond;
    }, 0);
  };

  const creditGenerationRate = calculateCreditGeneration();

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
          
          // Generate credits based on time passed and generation rate
          if (player && creditGenerationRate > 0) {
            const creditsGenerated = deltaTime * creditGenerationRate;
            const newCredits = Math.floor(player.credits + creditsGenerated); // No decimals
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