import { useState, useEffect } from 'react';
import type { BetResult } from '@/types/betting';

const STORAGE_KEY = 'lottery_bet_history';

export const useBetVerification = () => {
  const [betHistory, setBetHistory] = useState<BetResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar histórico do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const history = JSON.parse(stored);
        setBetHistory(history);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar histórico no localStorage
  const saveToStorage = (history: BetResult[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  };

  // Adicionar nova verificação ao histórico
  const addBetResult = (result: BetResult) => {
    const newHistory = [result, ...betHistory].slice(0, 50); // Manter apenas os últimos 50
    setBetHistory(newHistory);
    saveToStorage(newHistory);
  };

  // Limpar histórico
  const clearHistory = () => {
    setBetHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Obter estatísticas do histórico
  const getStats = () => {
    const totalBets = betHistory.length;
    const winningBets = betHistory.filter(bet => bet.isWinner).length;
    const totalPrize = betHistory
      .filter(bet => bet.isWinner)
      .reduce((sum, bet) => sum + (bet.prize?.minPrize || 0), 0);

    return {
      totalBets,
      winningBets,
      winRate: totalBets > 0 ? (winningBets / totalBets) * 100 : 0,
      totalPrize
    };
  };

  // Filtrar histórico por jogo
  const getHistoryByGame = (gameId: string) => {
    return betHistory.filter(bet => bet.ticket.gameId === gameId);
  };

  return {
    betHistory,
    isLoading,
    addBetResult,
    clearHistory,
    getStats,
    getHistoryByGame
  };
};