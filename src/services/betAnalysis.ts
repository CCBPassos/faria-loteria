import type { BetTicket, BetResult, GamePrize } from '@/types/betting';
import type { LotteryApiResult } from './loteriasApi';
import { PRIZE_RULES } from '@/types/betting';

export class BetAnalysisService {
  static analyzeContest(ticket: BetTicket, contestResult: LotteryApiResult): BetResult {
    const drawnNumbers = contestResult.dezenas.map(n => parseInt(n));
    const matches = ticket.numbers.filter(num => drawnNumbers.includes(num));
    const matchCount = matches.length;
    
    const prizeCategory = this.determinePrizeCategory(ticket.gameId, matchCount);
    
    return {
      ticket,
      contestResult: drawnNumbers,
      matches,
      matchCount,
      prizeCategory: prizeCategory?.category || null,
      isWinner: prizeCategory !== null
    };
  }

  private static determinePrizeCategory(gameId: string, matchCount: number): GamePrize | null {
    const rules = PRIZE_RULES[gameId];
    if (!rules) return null;

    return rules.find(rule => {
      if (rule.maxMatches !== undefined) {
        return matchCount >= rule.minMatches && matchCount <= rule.maxMatches;
      }
      return matchCount >= rule.minMatches;
    }) || null;
  }

  static parseQRCode(qrData: string): BetTicket | null {
    try {
      // Formato esperado do QR code das loterias da Caixa
      // Exemplo simplificado - pode variar conforme o formato real
      const parts = qrData.split('|');
      
      if (parts.length < 4) return null;
      
      const gameId = this.mapGameName(parts[0]);
      const contestNumber = parseInt(parts[1]);
      const numbersStr = parts[2];
      const betDate = parts[3];
      
      if (!gameId || isNaN(contestNumber)) return null;
      
      const numbers = numbersStr.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      
      return {
        gameId,
        contestNumber,
        numbers,
        betDate
      };
    } catch (error) {
      console.error('Erro ao processar QR code:', error);
      return null;
    }
  }

  private static mapGameName(gameName: string): string | null {
    const gameMap: Record<string, string> = {
      'MEGA SENA': 'mega-sena',
      'MEGASENA': 'mega-sena',
      'LOTOFACIL': 'lotofacil',
      'LOTOFÁCIL': 'lotofacil',
      'QUINA': 'quina',
      'LOTOMANIA': 'lotomania'
    };
    
    return gameMap[gameName.toUpperCase()] || null;
  }
}