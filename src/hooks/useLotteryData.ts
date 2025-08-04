import { useState, useEffect } from 'react';
import type { LotteryData, LotteryGame, NumberFrequency } from '@/types/lottery';

// Simulated historical data for demonstration
const generateMockData = (game: LotteryGame): NumberFrequency[] => {
  const frequencies: NumberFrequency[] = [];
  const totalDraws = 2500; // Simulated total number of draws
  
  for (let i = game.minNumber; i <= game.maxNumber; i++) {
    // Create realistic frequency distribution with some numbers being more frequent
    const baseFrequency = Math.floor(totalDraws * game.numbersPerGame / (game.maxNumber - game.minNumber + 1));
    const variation = Math.random() * 0.4 - 0.2; // ±20% variation
    const frequency = Math.max(1, Math.floor(baseFrequency * (1 + variation)));
    
    frequencies.push({
      number: i,
      frequency,
      percentage: (frequency / totalDraws) * 100
    });
  }
  
  // Sort by frequency descending
  return frequencies.sort((a, b) => b.frequency - a.frequency);
};

const generateSuggestions = (topNumbers: NumberFrequency[], game: LotteryGame): number[][] => {
  const suggestions: number[][] = [];
  const availableNumbers = topNumbers.slice(0, Math.min(20, topNumbers.length));
  
  for (let i = 0; i < 5; i++) {
    const suggestion: number[] = [];
    const usedNumbers = new Set<number>();
    
    // Use a mix of top numbers with some randomization
    while (suggestion.length < game.numbersPerGame) {
      const weightedIndex = Math.floor(Math.random() * Math.min(15, availableNumbers.length));
      const number = availableNumbers[weightedIndex].number;
      
      if (!usedNumbers.has(number)) {
        suggestion.push(number);
        usedNumbers.add(number);
      }
    }
    
    suggestions.push(suggestion.sort((a, b) => a - b));
  }
  
  return suggestions;
};

export const useLotteryData = (games: LotteryGame[]) => {
  const [data, setData] = useState<LotteryData>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadGameData = async (game: LotteryGame) => {
    setLoading(prev => ({ ...prev, [game.id]: true }));
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    try {
      const topNumbers = generateMockData(game);
      const suggestions = generateSuggestions(topNumbers, game);
      
      setData(prev => ({
        ...prev,
        [game.id]: {
          topNumbers,
          suggestions
        }
      }));
    } catch (error) {
      console.error(`Error loading data for ${game.name}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [game.id]: false }));
    }
  };

  const refreshGame = (game: LotteryGame) => {
    loadGameData(game);
    setLastUpdate(new Date());
  };

  const refreshAll = () => {
    games.forEach(game => loadGameData(game));
    setLastUpdate(new Date());
  };

  useEffect(() => {
    // Load initial data for all games
    games.forEach(game => loadGameData(game));
  }, [games]);

  return {
    data,
    loading,
    lastUpdate,
    refreshGame,
    refreshAll
  };
};