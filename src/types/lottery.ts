export interface LotteryGame {
  id: string;
  name: string;
  numbersPerGame: number;
  minNumber: number;
  maxNumber: number;
  color: string;
  icon: string;
}

export interface NumberFrequency {
  number: number;
  frequency: number;
  percentage: number;
}

export interface LotteryResults {
  topNumbers: NumberFrequency[];
  suggestions: number[][];
}

export interface LotteryData {
  [key: string]: LotteryResults;
}

export const LOTTERY_GAMES: LotteryGame[] = [
  {
    id: 'mega-sena',
    name: 'Mega-Sena',
    numbersPerGame: 6,
    minNumber: 1,
    maxNumber: 60,
    color: 'mega-sena',
    icon: '🎰'
  },
  {
    id: 'lotofacil',
    name: 'Lotofácil',
    numbersPerGame: 15,
    minNumber: 1,
    maxNumber: 25,
    color: 'lotofacil',
    icon: '🍀'
  },
  {
    id: 'quina',
    name: 'Quina',
    numbersPerGame: 5,
    minNumber: 1,
    maxNumber: 80,
    color: 'quina',
    icon: '⭐'
  },
  {
    id: 'lotomania',
    name: 'Lotomania',
    numbersPerGame: 50,
    minNumber: 0,
    maxNumber: 99,
    color: 'lotomania',
    icon: '🎯'
  }
];