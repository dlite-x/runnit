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

export function usePlanetResources(planet: string, buildingLevels: BuildingLevels) {
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
        // Production rates are per hour, so divide by 3600 to get per-second increment
        const newResources = {
          food: prev.food + (buildingLevels.farm / 3600),      // Farm level = food production rate per hour
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
  }, [planet, buildingLevels.farm, buildingLevels.refinery, buildingLevels.mine, buildingLevels.power]);

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
  const productionRates = {
    food: buildingLevels.farm,
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
