import { useState, useEffect } from 'react';

const UPDATE_INTERVAL = 1000; // Update every 1 second
const STORAGE_KEY = 'user_credits';

export interface CreditsBreakdown {
  income: {
    planetIncome: number;
    spaceTrade: number;
  };
  expenses: {
    fleet: number;
  };
  net: number;
}

export function useCredits(planetIncomePerHour: number = 0, stationCount: number = 0) {
  const [credits, setCredits] = useState<number>(() => {
    // Load initial credits from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 10000;
  });

  // Calculate breakdown
  const breakdown: CreditsBreakdown = {
    income: {
      planetIncome: planetIncomePerHour,
      spaceTrade: stationCount >= 3 ? 1 : 0,
    },
    expenses: {
      fleet: -1, // Placeholder for fleet upkeep
    },
    net: 0,
  };

  // Calculate net rate (per hour)
  breakdown.net = 
    breakdown.income.planetIncome + 
    breakdown.income.spaceTrade + 
    breakdown.expenses.fleet;

  // Convert hourly rate to per-second rate
  const creditsPerSecond = breakdown.net / 3600;

  useEffect(() => {
    // Increment credits every second
    const interval = setInterval(() => {
      setCredits((prev) => {
        const newCredits = prev + creditsPerSecond;
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, newCredits.toString());
        return newCredits;
      });
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [creditsPerSecond]);

  const setCreditsManually = (newCredits: number) => {
    setCredits(newCredits);
    localStorage.setItem(STORAGE_KEY, newCredits.toString());
  };

  const spendCredits = (amount: number): boolean => {
    if (credits >= amount) {
      const newCredits = credits - amount;
      setCredits(newCredits);
      localStorage.setItem(STORAGE_KEY, newCredits.toString());
      return true;
    }
    return false;
  };

  return { 
    credits, 
    setCredits: setCreditsManually,
    spendCredits,
    breakdown
  };
}
