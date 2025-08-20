import type { BetTicket } from '@/types/betting';
import type { LotteryGame } from '@/types/lottery';

/**
 * Serviço especializado em decodificar QR codes reais da Caixa Econômica Federal
 */
export class CaixaQRParser {
  
  /**
   * Tenta decodificar um QR code usando múltiplos formatos conhecidos
   */
  static parseQRCode(qrData: string, game: LotteryGame): BetTicket | null {
    console.log('Tentando decodificar QR code:', qrData);
    
    // Formato 1: Simulado para testes (gameId|numbers|betType|cost|drawNumber)
    const simulatedTicket = this.parseSimulatedFormat(qrData);
    if (simulatedTicket) {
      console.log('QR code decodificado como formato simulado');
      return simulatedTicket;
    }
    
    // Formato 2: Código de autenticação da Caixa (ex: A23C-9612061BB99E1AD2B1-7)
    const caixaTicket = this.parseCaixaAuthCode(qrData, game);
    if (caixaTicket) {
      console.log('QR code decodificado como código de autenticação da Caixa');
      return caixaTicket;
    }
    
    // Formato 3: URL da Caixa com parâmetros
    const urlTicket = this.parseCaixaURL(qrData, game);
    if (urlTicket) {
      console.log('QR code decodificado como URL da Caixa');
      return urlTicket;
    }
    
    // Formato 4: JSON estruturado
    const jsonTicket = this.parseJSONFormat(qrData, game);
    if (jsonTicket) {
      console.log('QR code decodificado como JSON');
      return jsonTicket;
    }
    
    console.log('Formato de QR code não reconhecido');
    return null;
  }
  
  /**
   * Parser para formato simulado (para testes)
   */
  private static parseSimulatedFormat(qrData: string): BetTicket | null {
    try {
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
    } catch {
      return null;
    }
  }
  
  /**
   * Parser para códigos de autenticação da Caixa (ex: A23C-9612061BB99E1AD2B1-7)
   * Este é um placeholder - o formato real precisa ser descoberto
   */
  private static parseCaixaAuthCode(qrData: string, game: LotteryGame): BetTicket | null {
    try {
      // Padrão típico: XXXX-XXXXXXXXXXXXXXXXX-X ou similar
      const authCodePattern = /^[A-Z0-9]{4}-[A-Z0-9]{17}-[0-9]$/;
      
      if (!authCodePattern.test(qrData)) return null;
      
      // Por enquanto, criamos um ticket básico que requer entrada manual dos números
      // Em uma implementação real, este código seria usado para consultar a API da Caixa
      return {
        gameId: game.id,
        numbers: [], // Será preenchido manualmente pelo usuário
        betType: 'simple',
        cost: this.getGameBaseCost(game.id),
        drawNumber: undefined,
        betDate: new Date().toISOString(),
        authCode: qrData // Guardamos o código para validação futura
      } as BetTicket & { authCode: string };
      
    } catch {
      return null;
    }
  }
  
  /**
   * Parser para URLs da Caixa com parâmetros
   */
  private static parseCaixaURL(qrData: string, game: LotteryGame): BetTicket | null {
    try {
      if (!qrData.includes('loterias.caixa.gov.br') && !qrData.includes('caixa.gov.br')) return null;
      
      const url = new URL(qrData);
      const params = url.searchParams;
      
      // Tentar extrair dados dos parâmetros da URL
      const numbersParam = params.get('numbers') || params.get('dezenas') || params.get('nums');
      const concursoParam = params.get('concurso') || params.get('contest');
      const gameParam = params.get('game') || params.get('jogo');
      
      if (!numbersParam) return null;
      
      const numbers = numbersParam.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      const drawNumber = concursoParam ? parseInt(concursoParam) : undefined;
      
      return {
        gameId: gameParam || game.id,
        numbers,
        betType: 'simple',
        cost: this.getGameBaseCost(game.id),
        drawNumber,
        betDate: new Date().toISOString()
      };
    } catch {
      return null;
    }
  }
  
  /**
   * Parser para formato JSON estruturado
   */
  private static parseJSONFormat(qrData: string, game: LotteryGame): BetTicket | null {
    try {
      const data = JSON.parse(qrData);
      
      if (!data.numbers && !data.dezenas) return null;
      
      const numbers = (data.numbers || data.dezenas || []).map((n: any) => parseInt(n)).filter((n: number) => !isNaN(n));
      
      return {
        gameId: data.gameId || data.jogo || game.id,
        numbers,
        betType: data.betType || data.tipo || 'simple',
        cost: parseFloat(data.cost || data.valor) || this.getGameBaseCost(game.id),
        drawNumber: data.drawNumber || data.concurso,
        betDate: data.betDate || data.data || new Date().toISOString()
      };
    } catch {
      return null;
    }
  }
  
  /**
   * Retorna o custo base de uma aposta simples para cada jogo
   */
  private static getGameBaseCost(gameId: string): number {
    const baseCosts: Record<string, number> = {
      'mega-sena': 5.00,
      'lotofacil': 3.00,
      'quina': 2.50,
      'lotomania': 3.00
    };
    
    return baseCosts[gameId] || 2.50;
  }
  
  /**
   * Valida se um código de autenticação da Caixa é válido
   */
  static isValidCaixaAuthCode(code: string): boolean {
    // Padrões comuns observados em códigos da Caixa
    const patterns = [
      /^[A-Z0-9]{4}-[A-Z0-9]{17}-[0-9]$/, // A23C-9612061BB99E1AD2B1-7
      /^[A-Z0-9]{8}-[A-Z0-9]{8}-[A-Z0-9]{8}$/, // XXXXXXXX-XXXXXXXX-XXXXXXXX
      /^[A-Z0-9]{32}$/, // 32 caracteres sem separadores
    ];
    
    return patterns.some(pattern => pattern.test(code));
  }
  
  /**
   * Extrai metadados do QR code para análise
   */
  static analyzeQRCode(qrData: string): {
    format: 'simulated' | 'caixa-auth' | 'caixa-url' | 'json' | 'unknown';
    isValid: boolean;
    confidence: number;
    metadata?: any;
  } {
    // Simulated format
    if (qrData.includes('|') && qrData.split('|').length >= 4) {
      return { format: 'simulated', isValid: true, confidence: 0.9 };
    }
    
    // Caixa auth code
    if (this.isValidCaixaAuthCode(qrData)) {
      return { format: 'caixa-auth', isValid: true, confidence: 0.8 };
    }
    
    // Caixa URL
    if (qrData.includes('caixa.gov.br') || qrData.includes('loterias.caixa.gov.br')) {
      return { format: 'caixa-url', isValid: true, confidence: 0.7 };
    }
    
    // JSON format
    try {
      const parsed = JSON.parse(qrData);
      if (parsed && typeof parsed === 'object') {
        return { format: 'json', isValid: true, confidence: 0.6, metadata: parsed };
      }
    } catch {
      // Not JSON
    }
    
    return { format: 'unknown', isValid: false, confidence: 0 };
  }
}