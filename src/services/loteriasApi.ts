import type { LotteryGame } from '@/types/lottery';

const API_BASE = 'https://loteriascaixa-api.herokuapp.com/api';

export interface LotteryApiResult {
  loteria: string;
  concurso: number;
  data: string;
  local: string;
  dezenas: string[];
  dezenasOrdemSorteio: string[];
  premiacoes: Array<{
    descricao: string;
    faixa: number;
    ganhadores: number;
    valorPremio: number;
  }>;
  acumulou: boolean;
  valorArrecadado: number;
  valorEstimadoProximoConcurso: number;
}

export interface AllResultsResponse {
  loteria: string;
  results: LotteryApiResult[];
}

// Mapeamento dos IDs locais para os IDs da API
const API_GAME_MAP: Record<string, string> = {
  'mega-sena': 'megasena',
  'lotofacil': 'lotofacil',
  'quina': 'quina',
  'lotomania': 'lotomania'
};

export class LoteriasApiService {
  static async getLatestResult(gameId: string): Promise<LotteryApiResult> {
    const apiGameId = API_GAME_MAP[gameId] || gameId;
    const response = await fetch(`${API_BASE}/${apiGameId}/latest`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados da ${gameId}: ${response.status}`);
    }
    
    return response.json();
  }

  static async getAllResults(gameId: string): Promise<LotteryApiResult[]> {
    const apiGameId = API_GAME_MAP[gameId] || gameId;
    
    try {
      // Tenta buscar todos os resultados
      const response = await fetch(`${API_BASE}/${apiGameId}`);
      
      if (!response.ok) {
        // Se não conseguir todos, busca apenas o último
        console.warn(`Não foi possível buscar todos os resultados de ${gameId}, usando apenas o último`);
        const latest = await this.getLatestResult(gameId);
        return [latest];
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error(`Erro ao buscar resultados históricos de ${gameId}:`, error);
      // Fallback para o último resultado
      const latest = await this.getLatestResult(gameId);
      return [latest];
    }
  }

  static async getAllAvailableGames(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar jogos disponíveis');
      }
      return response.json();
    } catch (error) {
      console.error('Erro ao buscar jogos disponíveis:', error);
      return ['megasena', 'lotofacil', 'quina', 'lotomania'];
    }
  }
}