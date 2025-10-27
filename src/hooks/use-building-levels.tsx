import { useState, useEffect } from 'react';

export interface BuildingLevels {
  lab: number;
  farm: number;
  power: number;
  mine: number;
  refinery: number;
}

interface PlanetBuildings {
  [planet: string]: BuildingLevels;
}

const STORAGE_KEY = 'planet_buildings';

const DEFAULT_EARTH_LEVELS: BuildingLevels = {
  lab: 2,
  farm: 5,
  power: 4,
  mine: 3,
  refinery: 1,
};

export function useBuildingLevels(planet: string) {
  const [buildingLevels, setBuildingLevels] = useState<BuildingLevels>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const allPlanets: PlanetBuildings = JSON.parse(stored);
      return allPlanets[planet] || (planet === 'Earth' ? DEFAULT_EARTH_LEVELS : {
        lab: 0,
        farm: 0,
        power: 0,
        mine: 0,
        refinery: 0,
      });
    }
    return planet === 'Earth' ? DEFAULT_EARTH_LEVELS : {
      lab: 0,
      farm: 0,
      power: 0,
      mine: 0,
      refinery: 0,
    };
  });

  const upgradeBuilding = (buildingType: keyof BuildingLevels): void => {
    setBuildingLevels((prev) => {
      const newLevels = {
        ...prev,
        [buildingType]: prev[buildingType] + 1,
      };
      
      // Save to localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      const allPlanets: PlanetBuildings = stored ? JSON.parse(stored) : {};
      allPlanets[planet] = newLevels;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allPlanets));
      
      return newLevels;
    });
  };

  return { buildingLevels, upgradeBuilding };
}
