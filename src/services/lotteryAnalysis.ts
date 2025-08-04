import type { LotteryGame, NumberFrequency, LotteryResults } from '@/types/lottery';
import type { LotteryApiResult } from './loteriasApi';

export class LotteryAnalysisService {
  static analyzeResults(results: LotteryApiResult[], game: LotteryGame): LotteryResults {
    const frequencies = this.calculateFrequencies(results, game);
    const suggestions = this.generateSuggestions(frequencies, game);
    
    return {
      topNumbers: frequencies,
      suggestions
    };
  }

  private static calculateFrequencies(results: LotteryApiResult[], game: LotteryGame): NumberFrequency[] {
    const frequencyMap = new Map<number, number>();
    const totalDraws = results.length;
    
    // Inicializa o mapa com todos os números possíveis
    for (let i = game.minNumber; i <= game.maxNumber; i++) {
      frequencyMap.set(i, 0);
    }
    
    // Conta as frequências dos números sorteados
    results.forEach(result => {
      result.dezenas.forEach(dezenaStr => {
        const dezena = parseInt(dezenaStr, 10);
        if (dezena >= game.minNumber && dezena <= game.maxNumber) {
          const current = frequencyMap.get(dezena) || 0;
          frequencyMap.set(dezena, current + 1);
        }
      });
    });
    
    // Converte para array e calcula porcentagens
    const frequencies: NumberFrequency[] = [];
    frequencyMap.forEach((frequency, number) => {
      frequencies.push({
        number,
        frequency,
        percentage: totalDraws > 0 ? (frequency / totalDraws) * 100 : 0
      });
    });
    
    // Ordena por frequência decrescente
    return frequencies.sort((a, b) => {
      if (b.frequency === a.frequency) {
        return a.number - b.number; // Em caso de empate, ordena por número
      }
      return b.frequency - a.frequency;
    });
  }

  private static generateSuggestions(topNumbers: NumberFrequency[], game: LotteryGame): number[][] {
    const suggestions: number[][] = [];
    
    // Filtra apenas números que foram sorteados pelo menos uma vez
    const availableNumbers = topNumbers.filter(n => n.frequency > 0);
    
    if (availableNumbers.length < game.numbersPerGame) {
      console.warn(`Poucos números disponíveis para ${game.name}. Usando todos os números possíveis.`);
      // Se não temos números suficientes, usa todos os números do jogo
      for (let i = game.minNumber; i <= game.maxNumber; i++) {
        if (!availableNumbers.find(n => n.number === i)) {
          availableNumbers.push({ number: i, frequency: 0, percentage: 0 });
        }
      }
    }
    
    // Gera 5 sugestões diferentes
    for (let i = 0; i < 5; i++) {
      const suggestion = this.generateSingleSuggestion(availableNumbers, game, i);
      suggestions.push(suggestion);
    }
    
    return suggestions;
  }

  private static generateSingleSuggestion(
    availableNumbers: NumberFrequency[], 
    game: LotteryGame, 
    seed: number
  ): number[] {
    const suggestion: number[] = [];
    const usedNumbers = new Set<number>();
    
    // Usa uma estratégia diferente para cada sugestão
    const strategies = [
      this.topNumbersStrategy,      // Mais frequentes
      this.mixedStrategy,           // Mix de frequentes e menos frequentes
      this.balancedStrategy,        // Estratégia balanceada
      this.recentTrendStrategy,     // Baseado em tendências
      this.randomWeightedStrategy   // Aleatório ponderado
    ];
    
    const strategy = strategies[seed % strategies.length];
    return strategy(availableNumbers, game);
  }

  private static topNumbersStrategy(availableNumbers: NumberFrequency[], game: LotteryGame): number[] {
    // Pega os números mais frequentes
    return availableNumbers
      .slice(0, game.numbersPerGame)
      .map(n => n.number)
      .sort((a, b) => a - b);
  }

  private static mixedStrategy(availableNumbers: NumberFrequency[], game: LotteryGame): number[] {
    const suggestion: number[] = [];
    const halfCount = Math.floor(game.numbersPerGame / 2);
    
    // Metade dos mais frequentes
    const topHalf = availableNumbers.slice(0, halfCount).map(n => n.number);
    suggestion.push(...topHalf);
    
    // Metade dos menos frequentes (mas que foram sorteados)
    const bottomHalf = availableNumbers
      .slice(-Math.ceil(availableNumbers.length / 3))
      .filter(n => n.frequency > 0)
      .slice(0, game.numbersPerGame - halfCount)
      .map(n => n.number);
    
    suggestion.push(...bottomHalf);
    
    // Completa se necessário
    if (suggestion.length < game.numbersPerGame) {
      const remaining = availableNumbers
        .filter(n => !suggestion.includes(n.number))
        .slice(0, game.numbersPerGame - suggestion.length)
        .map(n => n.number);
      suggestion.push(...remaining);
    }
    
    return suggestion.slice(0, game.numbersPerGame).sort((a, b) => a - b);
  }

  private static balancedStrategy(availableNumbers: NumberFrequency[], game: LotteryGame): number[] {
    // Divide em faixas e pega números de cada faixa
    const rangeSize = Math.ceil((game.maxNumber - game.minNumber + 1) / 3);
    const suggestion: number[] = [];
    
    for (let range = 0; range < 3 && suggestion.length < game.numbersPerGame; range++) {
      const rangeStart = game.minNumber + (range * rangeSize);
      const rangeEnd = Math.min(rangeStart + rangeSize - 1, game.maxNumber);
      
      const rangeNumbers = availableNumbers
        .filter(n => n.number >= rangeStart && n.number <= rangeEnd && n.frequency > 0)
        .slice(0, Math.ceil(game.numbersPerGame / 3));
      
      suggestion.push(...rangeNumbers.map(n => n.number));
    }
    
    // Completa se necessário
    if (suggestion.length < game.numbersPerGame) {
      const remaining = availableNumbers
        .filter(n => !suggestion.includes(n.number) && n.frequency > 0)
        .slice(0, game.numbersPerGame - suggestion.length)
        .map(n => n.number);
      suggestion.push(...remaining);
    }
    
    return suggestion.slice(0, game.numbersPerGame).sort((a, b) => a - b);
  }

  private static recentTrendStrategy(availableNumbers: NumberFrequency[], game: LotteryGame): number[] {
    // Prioriza números que aparecem com frequência mediana (nem muito frequentes, nem muito raros)
    const medianIndex = Math.floor(availableNumbers.length / 2);
    const trendNumbers = availableNumbers
      .slice(Math.max(0, medianIndex - 10), medianIndex + 10)
      .filter(n => n.frequency > 0)
      .slice(0, game.numbersPerGame)
      .map(n => n.number);
      
    return trendNumbers.sort((a, b) => a - b);
  }

  private static randomWeightedStrategy(availableNumbers: NumberFrequency[], game: LotteryGame): number[] {
    const suggestion: number[] = [];
    const usedNumbers = new Set<number>();
    
    // Cria um pool ponderado baseado na frequência
    const weightedPool: number[] = [];
    availableNumbers.forEach(({ number, frequency }) => {
      if (frequency > 0) {
        // Adiciona o número proporcionalmente à sua frequência
        const weight = Math.max(1, Math.floor(frequency / 10));
        for (let i = 0; i < weight; i++) {
          weightedPool.push(number);
        }
      }
    });
    
    // Seleciona números aleatoriamente do pool ponderado
    while (suggestion.length < game.numbersPerGame && weightedPool.length > 0) {
      const randomIndex = Math.floor(Math.random() * weightedPool.length);
      const selectedNumber = weightedPool[randomIndex];
      
      if (!usedNumbers.has(selectedNumber)) {
        suggestion.push(selectedNumber);
        usedNumbers.add(selectedNumber);
        
        // Remove todas as ocorrências deste número do pool
        for (let i = weightedPool.length - 1; i >= 0; i--) {
          if (weightedPool[i] === selectedNumber) {
            weightedPool.splice(i, 1);
          }
        }
      }
    }
    
    // Se ainda não temos números suficientes, completa com os disponíveis
    if (suggestion.length < game.numbersPerGame) {
      const remaining = availableNumbers
        .filter(n => !usedNumbers.has(n.number))
        .slice(0, game.numbersPerGame - suggestion.length)
        .map(n => n.number);
      suggestion.push(...remaining);
    }
    
    return suggestion.sort((a, b) => a - b);
  }
}