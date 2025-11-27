import { useState, useEffect } from 'react';

const STORAGE_KEY = 'user_score';
const GAME_START_TIME_KEY = 'game_start_time';
const MARS_COLONIZED_TIME_KEY = 'mars_colonized_time';

export interface MissionScore {
  missionId: string;
  points: number;
  completedAt: number;
}

export function useScore() {
  const [score, setScore] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  });

  const [gameStartTime] = useState<number>(() => {
    const stored = localStorage.getItem(GAME_START_TIME_KEY);
    if (stored) {
      return parseInt(stored, 10);
    }
    const now = Date.now();
    localStorage.setItem(GAME_START_TIME_KEY, now.toString());
    return now;
  });

  const [completedMissions, setCompletedMissions] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('completed_missions_for_score');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Calculate Mars mission points based on time elapsed
  const getMarsColonizationPoints = (): number => {
    const startTime = gameStartTime;
    const now = Date.now();
    const minutesElapsed = (now - startTime) / (60 * 1000);
    
    // Start at 2 points, decrease by 0.1 per minute, minimum 1 point
    const points = Math.max(1, 2 - (minutesElapsed * 0.1));
    return Math.round(points * 10) / 10; // Round to 1 decimal place
  };

  const awardMissionPoints = (missionId: string): number => {
    if (completedMissions.has(missionId)) {
      return 0; // Already awarded
    }

    let points = 0;
    
    // Special handling for Mars colonization mission
    if (missionId === "1") { // Mars colonization mission ID
      points = getMarsColonizationPoints();
      // Store when Mars was colonized
      localStorage.setItem(MARS_COLONIZED_TIME_KEY, Date.now().toString());
    } else {
      // Default 1 point for other missions
      points = 1;
    }

    const newScore = score + points;
    setScore(newScore);
    localStorage.setItem(STORAGE_KEY, newScore.toString());

    const newCompleted = new Set(completedMissions);
    newCompleted.add(missionId);
    setCompletedMissions(newCompleted);
    localStorage.setItem('completed_missions_for_score', JSON.stringify([...newCompleted]));

    return points;
  };

  const resetScore = () => {
    setScore(0);
    setCompletedMissions(new Set());
    localStorage.setItem(STORAGE_KEY, '0');
    localStorage.removeItem('completed_missions_for_score');
  };

  return {
    score,
    awardMissionPoints,
    resetScore,
    getMarsColonizationPoints,
  };
}
