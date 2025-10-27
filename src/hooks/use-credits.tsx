import { useState, useEffect } from 'react';

const CREDITS_INCREMENT_RATE = 3; // Credits per second
const UPDATE_INTERVAL = 1000; // Update every 1 second
const STORAGE_KEY = 'user_credits';

export function useCredits() {
  const [credits, setCredits] = useState<number>(() => {
    // Load initial credits from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 10000;
  });

  useEffect(() => {
    // Increment credits every second
    const interval = setInterval(() => {
      setCredits((prev) => {
        const newCredits = prev + CREDITS_INCREMENT_RATE;
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, newCredits.toString());
        return newCredits;
      });
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

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
    spendCredits
  };
}
