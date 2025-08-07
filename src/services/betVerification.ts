import type { BetTicket, BetResult, DrawInfo } from '@/types/betting';
import type { LotteryGame } from '@/types/lottery';
import { LoteriasApiService, type LotteryApiResult } from '@/services/loteriasApi';
import { BetAnalysisService } from '@/services/betAnalysis';

export class BetVerificationService {
  /**
   * Verifica uma aposta usando dados reais dos sorteios
   */
  static async verifyBet(
    ticket: BetTicket,
    game: LotteryGame
  ): Promise<BetResult> {
    try {
      let drawData: LotteryApiResult;
      
      if (ticket.drawNumber) {
        // Se a aposta especifica um concurso, tentar buscar esse concurso específico
        try {
          // Para concursos específicos, usamos a API de último resultado como fallback
          // Em uma implementação real, haveria uma API para buscar por número do concurso
          drawData = await LoteriasApiService.getLatestResult(game.id);
          
          // Verificar se é o concurso correto
          if (drawData.concurso !== ticket.drawNumber) {
            console.warn(`Concurso especificado (${ticket.drawNumber}) não encontrado. Usando último disponível (${drawData.concurso})`);
          }
        } catch (error) {
          throw new Error(`Não foi possível buscar dados do concurso ${ticket.drawNumber}`);
        }
      } else {
        // Se não especificou concurso, usar o último sorteio
        drawData = await LoteriasApiService.getLatestResult(game.id);
      }

      // Converter dados da API para formato interno
      const drawInfo: DrawInfo = {
        contestNumber: drawData.concurso,
        date: drawData.data,
        drawnNumbers: drawData.dezenas.map(n => parseInt(n)),
        location: drawData.local,
        accumulated: drawData.acumulou,
        estimatedPrize: drawData.valorEstimadoProximoConcurso
      };

      // Analisar a aposta usando os dados reais
      const result = BetAnalysisService.analyzeBetWithDrawInfo(
        ticket,
        drawInfo,
        game
      );

      return result;
    } catch (error) {
      console.error('Erro ao verificar aposta:', error);
      throw new Error('Não foi possível verificar a aposta. Tente novamente.');
    }
  }

  /**
   * Busca informações do último sorteio
   */
  static async getLatestDrawInfo(gameId: string): Promise<DrawInfo> {
    try {
      const drawData = await LoteriasApiService.getLatestResult(gameId);
      
      return {
        contestNumber: drawData.concurso,
        date: drawData.data,
        drawnNumbers: drawData.dezenas.map(n => parseInt(n)),
        location: drawData.local,
        accumulated: drawData.acumulou,
        estimatedPrize: drawData.valorEstimadoProximoConcurso
      };
    } catch (error) {
      console.error('Erro ao buscar informações do sorteio:', error);
      throw new Error('Não foi possível buscar dados do sorteio');
    }
  }

  /**
   * Valida se uma aposta é compatível com o jogo
   */
  static validateBetForGame(ticket: BetTicket, game: LotteryGame): boolean {
    return ticket.gameId === game.id && 
           ticket.numbers.length === game.numbersPerGame &&
           ticket.numbers.every(num => num >= game.minNumber && num <= game.maxNumber);
  }
}