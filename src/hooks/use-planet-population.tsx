import { useState, useEffect } from 'react';

interface PlanetPopulation {
  [planet: string]: number;
}

const STORAGE_KEY = 'planet_population';
const UPDATE_INTERVAL = 1000; // Update every 1 second

// Base growth rate per hour for each planet
const BASE_GROWTH_RATES: { [key: string]: number } = {
  Earth: 1, // 1 per hour
  Moon: 0,
  Mars: 0,
  EML1: 0,
};

const DEFAULT_POPULATIONS: { [key: string]: number } = {
  Earth: 100,
  Moon: 0,
  Mars: 0,
  EML1: 0,
};

export function usePlanetPopulation(planet: string, isColonized: boolean = true) {
  const [population, setPopulation] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const allPlanets: PlanetPopulation = JSON.parse(stored);
      return allPlanets[planet] ?? DEFAULT_POPULATIONS[planet];
    }
    return DEFAULT_POPULATIONS[planet];
  });

  // Auto-increment population based on growth rate
  useEffect(() => {
    if (!isColonized) return;

    const interval = setInterval(() => {
      setPopulation((prev) => {
        const growthRatePerHour = BASE_GROWTH_RATES[planet] || 0;
        const growthRatePerSecond = growthRatePerHour / 3600;
        const newPopulation = prev + growthRatePerSecond;
        
        // Save to localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        const allPlanets: PlanetPopulation = stored ? JSON.parse(stored) : {};
        allPlanets[planet] = newPopulation;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allPlanets));
        
        return newPopulation;
      });
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [planet, isColonized]);

  // Calculate growth rate per hour
  const growthRatePerHour = isColonized ? BASE_GROWTH_RATES[planet] || 0 : 0;

  return { 
    population: Math.floor(population),
    growthRatePerHour: Math.round(growthRatePerHour)
  };
}
