export interface BetTicket {
  gameId: string;
  contestNumber: number;
  numbers: number[];
  betDate: string;
}

export interface BetResult {
  ticket: BetTicket;
  contestResult: number[];
  matches: number[];
  matchCount: number;
  prizeCategory: string | null;
  isWinner: boolean;
}

export interface GamePrize {
  category: string;
  minMatches: number;
  maxMatches?: number;
  description: string;
}

export const PRIZE_RULES: Record<string, GamePrize[]> = {
  'mega-sena': [
    { category: 'Sena', minMatches: 6, description: 'Acertou 6 números' },
    { category: 'Quina', minMatches: 5, description: 'Acertou 5 números' },
    { category: 'Quadra', minMatches: 4, description: 'Acertou 4 números' }
  ],
  'lotofacil': [
    { category: '15 pontos', minMatches: 15, description: 'Acertou 15 números' },
    { category: '14 pontos', minMatches: 14, description: 'Acertou 14 números' },
    { category: '13 pontos', minMatches: 13, description: 'Acertou 13 números' },
    { category: '12 pontos', minMatches: 12, description: 'Acertou 12 números' },
    { category: '11 pontos', minMatches: 11, description: 'Acertou 11 números' }
  ],
  'quina': [
    { category: 'Quina', minMatches: 5, description: 'Acertou 5 números' },
    { category: 'Quadra', minMatches: 4, description: 'Acertou 4 números' },
    { category: 'Terno', minMatches: 3, description: 'Acertou 3 números' },
    { category: 'Duque', minMatches: 2, description: 'Acertou 2 números' }
  ],
  'lotomania': [
    { category: '20 pontos', minMatches: 20, description: 'Acertou 20 números' },
    { category: '19 pontos', minMatches: 19, description: 'Acertou 19 números' },
    { category: '18 pontos', minMatches: 18, description: 'Acertou 18 números' },
    { category: '17 pontos', minMatches: 17, description: 'Acertou 17 números' },
    { category: '16 pontos', minMatches: 16, description: 'Acertou 16 números' },
    { category: '15 pontos', minMatches: 15, description: 'Acertou 15 números' },
    { category: '0 pontos', minMatches: 0, maxMatches: 0, description: 'Não acertou nenhum número' }
  ]
};