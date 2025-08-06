import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trophy, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import type { BetResult } from '@/types/betting';
import type { LotteryGame } from '@/types/lottery';

interface BetResultDisplayProps {
  result: BetResult;
  game: LotteryGame;
  onNewCheck?: () => void;
}

export const BetResultDisplay = ({ result, game, onNewCheck }: BetResultDisplayProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('pt-BR');
  };

  return (
    <Card className={`${result.isWinner ? 'border-green-500 bg-green-50/50' : 'border-border'}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{game.icon}</span>
            <span>Resultado da Verificação</span>
          </div>
          {result.isWinner ? (
            <Trophy className="h-6 w-6 text-yellow-500" />
          ) : (
            <XCircle className="h-6 w-6 text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status da aposta */}
        <div className="text-center">
          {result.isWinner ? (
            <div className="space-y-2">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <h3 className="text-2xl font-bold text-green-600">
                🎉 Parabéns! Você ganhou!
              </h3>
              <p className="text-lg font-semibold">
                {result.prize?.name} - {result.matchCount} acertos
              </p>
              <p className="text-2xl font-bold text-green-600">
                Prêmio mínimo: {formatCurrency(result.prize?.minPrize || 0)}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <XCircle className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-xl font-semibold text-muted-foreground">
                Não foi desta vez...
              </h3>
              <p className="text-lg">
                {result.matchCount} acertos - Não premiado
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Detalhes da aposta */}
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Seus números:</h4>
            <div className="flex flex-wrap gap-2">
              {result.ticket.numbers.map((num) => {
                const isMatched = result.matchedNumbers.includes(num);
                return (
                  <Badge
                    key={num}
                    variant={isMatched ? "default" : "outline"}
                    className={isMatched ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {num.toString().padStart(2, '0')}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Números sorteados:</h4>
            <div className="flex flex-wrap gap-2">
              {result.drawnNumbers.map((num) => (
                <Badge key={num} variant="secondary">
                  {num.toString().padStart(2, '0')}
                </Badge>
              ))}
            </div>
          </div>

          {result.matchedNumbers.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">
                Números que você acertou ({result.matchCount}):
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.matchedNumbers.map((num) => (
                  <Badge key={num} className="bg-green-500 hover:bg-green-600">
                    {num.toString().padStart(2, '0')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Informações da aposta */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Modalidade:</span>
            <p>{game.name}</p>
          </div>
          <div>
            <span className="font-semibold">Tipo de aposta:</span>
            <p className="capitalize">{result.ticket.betType}</p>
          </div>
          <div>
            <span className="font-semibold">Valor da aposta:</span>
            <p>{formatCurrency(result.ticket.cost)}</p>
          </div>
          <div>
            <span className="font-semibold">Data da verificação:</span>
            <p>{formatDate(result.timestamp)}</p>
          </div>
        </div>

        {/* Botão para nova verificação */}
        {onNewCheck && (
          <Button onClick={onNewCheck} className="w-full" variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Verificar Nova Aposta
          </Button>
        )}
      </CardContent>
    </Card>
  );
};