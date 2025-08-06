import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Trophy, Calendar, Trash2, TrendingUp, Target } from 'lucide-react';
import type { BetResult } from '@/types/betting';
import { LOTTERY_GAMES } from '@/types/lottery';

interface BetHistoryDisplayProps {
  history: BetResult[];
  onClearHistory: () => void;
  stats: {
    totalBets: number;
    winningBets: number;
    winRate: number;
    totalPrize: number;
  };
}

export const BetHistoryDisplay = ({ history, onClearHistory, stats }: BetHistoryDisplayProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGameInfo = (gameId: string) => {
    return LOTTERY_GAMES.find(game => game.id === gameId);
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma aposta verificada ainda</p>
            <p className="text-sm">Suas verificações aparecerão aqui</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.totalBets}</p>
              <p className="text-sm text-muted-foreground">Total de apostas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.winningBets}</p>
              <p className="text-sm text-muted-foreground">Apostas premiadas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Taxa de acerto</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalPrize)}
              </p>
              <p className="text-sm text-muted-foreground">Total em prêmios</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Histórico de Verificações
            </CardTitle>
            <Button 
              onClick={onClearHistory} 
              variant="outline" 
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {history.map((result, index) => {
                const game = getGameInfo(result.ticket.gameId);
                return (
                  <div key={index} className="space-y-2">
                    <div className={`p-4 rounded-lg border ${
                      result.isWinner 
                        ? 'border-green-200 bg-green-50/50' 
                        : 'border-border bg-card'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{game?.icon}</span>
                          <span className="font-semibold">{game?.name}</span>
                          {result.isWinner && (
                            <Trophy className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(result.timestamp)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium mb-1">Seus números:</p>
                          <div className="flex flex-wrap gap-1">
                            {result.ticket.numbers.map((num) => {
                              const isMatched = result.matchedNumbers.includes(num);
                              return (
                                <Badge
                                  key={num}
                                  variant={isMatched ? "default" : "outline"}
                                  className={`text-xs ${
                                    isMatched ? "bg-green-500 hover:bg-green-600" : ""
                                  }`}
                                >
                                  {num.toString().padStart(2, '0')}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium">
                              {result.matchCount} acertos
                            </span>
                            {result.isWinner && result.prize && (
                              <span className="text-sm text-green-600 ml-2">
                                • {result.prize.name} • {formatCurrency(result.prize.minPrize)}
                              </span>
                            )}
                          </div>
                          <Badge variant={result.isWinner ? "default" : "secondary"}>
                            {result.isWinner ? "Premiado" : "Não premiado"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {index < history.length - 1 && <Separator />}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};