export interface BetTicket {
  gameId: string;
  numbers: number[];
  betType: 'simple' | 'multiple';
  cost: number;
  drawNumber?: number;
  betDate?: string;
  authCode?: string; // Código de autenticação do QR code da Caixa
}

export interface DrawInfo {
  contestNumber: number;
  date: string;
  drawnNumbers: number[];
  location: string;
  accumulated: boolean;
  estimatedPrize: number;
}

export interface GamePrize {
  matches: number;
  name: string;
  minPrize: number;
}

export interface BetResult {
  ticket: BetTicket;
  drawnNumbers: number[];
  matchedNumbers: number[];
  matchCount: number;
  prize?: GamePrize;
  isWinner: boolean;
  timestamp: string;
  drawInfo: DrawInfo;
}

// Regras de premiação para cada modalidade
export const PRIZE_RULES: Record<string, GamePrize[]> = {
  'mega-sena': [
    { matches: 6, name: 'Sena', minPrize: 2000000 },
    { matches: 5, name: 'Quina', minPrize: 50000 },
    { matches: 4, name: 'Quadra', minPrize: 1000 }
  ],
  'lotofacil': [
    { matches: 15, name: '15 acertos', minPrize: 500000 },
    { matches: 14, name: '14 acertos', minPrize: 1500 },
    { matches: 13, name: '13 acertos', minPrize: 25 },
    { matches: 12, name: '12 acertos', minPrize: 10 },
    { matches: 11, name: '11 acertos', minPrize: 5 }
  ],
  'quina': [
    { matches: 5, name: 'Quina', minPrize: 500000 },
    { matches: 4, name: 'Quadra', minPrize: 5000 },
    { matches: 3, name: 'Terno', minPrize: 100 },
    { matches: 2, name: 'Duque', minPrize: 2 }
  ],
  'lotomania': [
    { matches: 20, name: '20 acertos', minPrize: 500000 },
    { matches: 19, name: '19 acertos', minPrize: 5000 },
    { matches: 18, name: '18 acertos', minPrize: 500 },
    { matches: 17, name: '17 acertos', minPrize: 50 },
    { matches: 16, name: '16 acertos', minPrize: 20 },
    { matches: 0, name: '0 acertos', minPrize: 2 }
  ]
};