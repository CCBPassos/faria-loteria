import type { BetTicket, BetResult, GamePrize } from '@/types/betting';
import { PRIZE_RULES } from '@/types/betting';
import type { LotteryGame } from '@/types/lottery';

export class BetAnalysisService {
  /**
   * Analisa uma aposta comparando com os números sorteados
   */
  static analyzeBet(
    ticket: BetTicket,
    drawnNumbers: number[],
    game: LotteryGame
  ): BetResult {
    const matchedNumbers = ticket.numbers.filter(num => 
      drawnNumbers.includes(num)
    );
    
    const matchCount = matchedNumbers.length;
    const prize = this.determinePrize(ticket.gameId, matchCount);
    const isWinner = prize !== undefined;

    return {
      ticket,
      drawnNumbers,
      matchedNumbers,
      matchCount,
      prize,
      isWinner,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Determina se há premiação baseado no número de acertos
   */
  private static determinePrize(gameId: string, matchCount: number): GamePrize | undefined {
    const gameRules = PRIZE_RULES[gameId];
    if (!gameRules) return undefined;

    return gameRules.find(rule => rule.matches === matchCount);
  }

  /**
   * Valida se os números da aposta estão dentro das regras do jogo
   */
  static validateBetNumbers(numbers: number[], game: LotteryGame): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Verifica quantidade de números
    if (numbers.length !== game.numbersPerGame) {
      errors.push(`Selecione exatamente ${game.numbersPerGame} números`);
    }

    // Verifica se os números estão no range válido
    const invalidNumbers = numbers.filter(num => 
      num < game.minNumber || num > game.maxNumber
    );
    if (invalidNumbers.length > 0) {
      errors.push(`Números devem estar entre ${game.minNumber} e ${game.maxNumber}`);
    }

    // Verifica números duplicados
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== numbers.length) {
      errors.push('Não é possível repetir números');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Simula dados de um QR code de aposta
   */
  static parseQRCode(qrData: string): BetTicket | null {
    try {
      // Formato simulado: gameId|numbers|betType|cost|drawNumber
      const parts = qrData.split('|');
      if (parts.length < 4) return null;

      const [gameId, numbersStr, betType, costStr, drawNumberStr] = parts;
      
      const numbers = numbersStr.split(',').map(n => parseInt(n.trim()));
      const cost = parseFloat(costStr);
      const drawNumber = drawNumberStr ? parseInt(drawNumberStr) : undefined;

      return {
        gameId,
        numbers,
        betType: betType as 'simple' | 'multiple',
        cost,
        drawNumber,
        betDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao decodificar QR code:', error);
      return null;
    }
  }
}