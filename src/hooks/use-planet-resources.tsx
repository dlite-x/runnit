import { useState, useEffect } from 'react';
import { BuildingLevels } from './use-building-levels';

export interface ResourceStock {
  food: number;
  fuel: number;
  metal: number;
  power: number;
}

interface PlanetResources {
  [planet: string]: ResourceStock;
}

const STORAGE_KEY = 'planet_resources';
const UPDATE_INTERVAL = 1000; // Update every 1 second

const DEFAULT_EARTH_STOCK: ResourceStock = {
  food: 100,
  fuel: 80,
  metal: 60,
  power: 100,
};

export function usePlanetResources(
  planet: string, 
  buildingLevels: BuildingLevels,
  temperature?: number,
  population?: number
) {
  const [resources, setResources] = useState<ResourceStock>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const allPlanets: PlanetResources = JSON.parse(stored);
      return allPlanets[planet] || (planet === 'Earth' ? DEFAULT_EARTH_STOCK : {
        food: 0,
        fuel: 0,
        metal: 0,
        power: 0,
      });
    }
    return planet === 'Earth' ? DEFAULT_EARTH_STOCK : {
      food: 0,
      fuel: 0,
      metal: 0,
      power: 0,
    };
  });

  // Auto-increment resources based on building levels (production rates per hour)
  useEffect(() => {
    const interval = setInterval(() => {
      setResources((prev) => {
        // Calculate food production with temperature penalty (Earth only)
        let foodProduction = buildingLevels.farm / 3600; // per second
        
        if (planet === 'Earth' && temperature !== undefined && population !== undefined) {
          // Apply temperature penalty: (1 - temperature * 0.20) per farm level per hour
          const tempPenalty = 1 - temperature * 0.20;
          foodProduction = (buildingLevels.farm * tempPenalty) / 3600;
          
          // Subtract population consumption: population / 100 / 3600 per second
          const foodConsumption = population / 100 / 3600;
          foodProduction -= foodConsumption;
        }
        
        // Production rates are per hour, so divide by 3600 to get per-second increment
        const newResources = {
          food: prev.food + foodProduction,                     // Net food (production - consumption)
          fuel: prev.fuel + (buildingLevels.refinery / 3600),  // Refine level = fuel production rate per hour
          metal: prev.metal + (buildingLevels.mine / 3600),    // Mine level = metal production rate per hour
          power: prev.power + (buildingLevels.power / 3600),   // Power level = power production rate per hour
        };
        
        // Save to localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        const allPlanets: PlanetResources = stored ? JSON.parse(stored) : {};
        allPlanets[planet] = newResources;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allPlanets));
        
        return newResources;
      });
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [planet, buildingLevels.farm, buildingLevels.refinery, buildingLevels.mine, buildingLevels.power, temperature, population]);

  const spendResource = (resourceType: keyof ResourceStock, amount: number): boolean => {
    if (resources[resourceType] >= amount) {
      const newResources = {
        ...resources,
        [resourceType]: resources[resourceType] - amount,
      };
      setResources(newResources);
      
      // Save to localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      const allPlanets: PlanetResources = stored ? JSON.parse(stored) : {};
      allPlanets[planet] = newResources;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allPlanets));
      
      return true;
    }
    return false;
  };

  // Calculate production rates based on building levels
  let foodRate = buildingLevels.farm;
  
  // For Earth, calculate net food rate (production with temp penalty - consumption)
  if (planet === 'Earth' && temperature !== undefined && population !== undefined) {
    const tempPenalty = 1 - temperature * 0.20;
    const foodProduction = buildingLevels.farm * tempPenalty;
    const foodConsumption = population / 100;
    foodRate = Math.round(foodProduction - foodConsumption);
  }
  
  const productionRates = {
    food: foodRate,
    fuel: buildingLevels.refinery,
    metal: buildingLevels.mine,
    power: buildingLevels.power,
  };

  return { 
    resources, 
    productionRates,
    spendResource
  };
}
