import { useState, useEffect } from 'react';

const INTEREST_RATE_PER_HOUR = 0.005; // 0.5% per hour
const INTEREST_RATE_PER_SECOND = INTEREST_RATE_PER_HOUR / 3600;
const UPDATE_INTERVAL = 1000; // Update every 1 second
const STORAGE_KEY_INVESTED = 'user_investment_amount';
const STORAGE_KEY_TIMESTAMP = 'user_investment_timestamp';

export function useInvestment() {
  const [investedAmount, setInvestedAmount] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_INVESTED);
    return stored ? parseFloat(stored) : 0;
  });

  const [lastUpdateTime, setLastUpdateTime] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
    return stored ? parseInt(stored, 10) : Date.now();
  });

  // Calculate and apply compound interest every second
  useEffect(() => {
    if (investedAmount <= 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const secondsElapsed = (now - lastUpdateTime) / 1000;
      
      if (secondsElapsed >= 1) {
        setInvestedAmount((prev) => {
          if (prev <= 0) return prev;
          
          // Compound interest formula: A = P * (1 + r)^t
          // Where r is the rate per second, t is seconds elapsed
          const newAmount = prev * Math.pow(1 + INTEREST_RATE_PER_SECOND, secondsElapsed);
          
          localStorage.setItem(STORAGE_KEY_INVESTED, newAmount.toString());
          return newAmount;
        });
        
        setLastUpdateTime(now);
        localStorage.setItem(STORAGE_KEY_TIMESTAMP, now.toString());
      }
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [investedAmount, lastUpdateTime]);

  const deposit = (amount: number): boolean => {
    if (amount <= 0) return false;
    
    const now = Date.now();
    const newAmount = investedAmount + amount;
    
    setInvestedAmount(newAmount);
    setLastUpdateTime(now);
    
    localStorage.setItem(STORAGE_KEY_INVESTED, newAmount.toString());
    localStorage.setItem(STORAGE_KEY_TIMESTAMP, now.toString());
    
    return true;
  };

  const withdraw = (amount: number): boolean => {
    if (amount <= 0 || amount > investedAmount) return false;
    
    const now = Date.now();
    const newAmount = investedAmount - amount;
    
    setInvestedAmount(newAmount);
    setLastUpdateTime(now);
    
    localStorage.setItem(STORAGE_KEY_INVESTED, newAmount.toString());
    localStorage.setItem(STORAGE_KEY_TIMESTAMP, now.toString());
    
    return true;
  };

  return {
    investedAmount,
    deposit,
    withdraw,
    interestRateDisplay: '+0.5%/h'
  };
}
