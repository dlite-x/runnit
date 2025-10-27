import { useState, useEffect } from 'react';

interface PlanetPopulation {
  [planet: string]: number;
}

const STORAGE_KEY = 'planet_population';
const UPDATE_INTERVAL = 1000; // Update every 1 second

const DEFAULT_POPULATIONS: { [key: string]: number } = {
  Earth: 100,
  Moon: 0,
  Mars: 0,
  EML1: 0,
};

export function usePlanetPopulation(
  planet: string, 
  isColonized: boolean = true,
  foodStock: number = 0
) {
  const [population, setPopulation] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const allPlanets: PlanetPopulation = JSON.parse(stored);
      return allPlanets[planet] ?? DEFAULT_POPULATIONS[planet];
    }
    return DEFAULT_POPULATIONS[planet];
  });

  // Auto-increment population based on percentage growth rate
  // Formula: population * (1/360,000) per second
  // This equals approximately 1% growth per hour
  useEffect(() => {
    if (!isColonized || population <= 0) return;

    const interval = setInterval(() => {
      setPopulation((prev) => {
        // Population grows if food > 0, declines if food < 0
        const growthDirection = foodStock > 0 ? 1 : (foodStock < 0 ? -1 : 0);
        
        // Growth rate: population * (1/360,000) per second
        const growthRatePerSecond = (prev / 360000) * growthDirection;
        const newPopulation = Math.max(0, prev + growthRatePerSecond);
        
        // Save to localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        const allPlanets: PlanetPopulation = stored ? JSON.parse(stored) : {};
        allPlanets[planet] = newPopulation;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allPlanets));
        
        return newPopulation;
      });
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [planet, isColonized, foodStock, population]);

  // Calculate growth rate per hour for UI display
  // Growth per second * 3600 = growth per hour
  const growthRatePerSecond = foodStock > 0 ? population / 360000 : (foodStock < 0 ? -population / 360000 : 0);
  const growthRatePerHour = Math.round(growthRatePerSecond * 3600);

  return { 
    population: Math.floor(population),
    growthRatePerHour
  };
}
