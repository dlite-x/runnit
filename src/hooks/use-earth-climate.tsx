import { useState, useEffect } from 'react';

const STORAGE_KEY_CO2 = 'earth_co2_ppm';
const STORAGE_KEY_EVENTS = 'earth_co2_events';
const INITIAL_CO2 = 400;

export interface CO2Event {
  timestamp: number;
  action: 'building' | 'ship_construct' | 'ship_launch';
  description: string;
  co2Added: number;
  totalCO2: number;
}

export function useEarthClimate() {
  const [co2ppm, setCO2ppm] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_CO2);
    return stored ? parseInt(stored, 10) : INITIAL_CO2;
  });

  const [co2Events, setCO2Events] = useState<CO2Event[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_EVENTS);
    return stored ? JSON.parse(stored) : [];
  });

  // Calculate temperature based on CO2
  const temperature = 0.0125 * co2ppm - 5;

  const addCO2Event = (action: CO2Event['action'], description: string) => {
    const newCO2 = co2ppm + 1;
    const newEvent: CO2Event = {
      timestamp: Date.now(),
      action,
      description,
      co2Added: 1,
      totalCO2: newCO2
    };

    setCO2ppm(newCO2);
    setCO2Events(prev => {
      const updated = [...prev, newEvent];
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(updated));
      return updated;
    });
    localStorage.setItem(STORAGE_KEY_CO2, newCO2.toString());
  };

  return {
    co2ppm,
    temperature,
    co2Events,
    addCO2Event
  };
}
