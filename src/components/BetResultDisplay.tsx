import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, CheckCircle, XCircle, Calendar } from 'lucide-react';
import type { BetResult } from '@/types/betting';
import { LOTTERY_GAMES } from '@/types/lottery';

interface BetResultDisplayProps {
  result: BetResult;
  onClose: () => void;
}

export const BetResultDisplay = ({ result, onClose }: BetResultDisplayProps) => {
  const game = LOTTERY_GAMES.find(g => g.id === result.ticket.gameId);
  
  const renderNumber = (number: number, isMatch: boolean) => (
    <Badge
      key={number}
      variant={isMatch ? "default" : "outline"}
      className={`
        font-mono text-sm
        ${isMatch 
          ? 'bg-primary text-primary-foreground shadow-md' 
          : 'bg-muted text-muted-foreground'
        }
      `}
    >
      {number.toString().padStart(2, '0')}
    </Badge>
  );

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{game?.icon}</span>
            {game?.name}
          </CardTitle>
          {result.isWinner && (
            <Trophy className="h-6 w-6 text-yellow-500" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="text-center">
          <div className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-full
            ${result.isWinner 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-muted text-muted-foreground'
            }
          `}>
            {result.isWinner ? (
              <>
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Aposta Premiada!</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5" />
                <span>Não foi dessa vez</span>
              </>
            )}
          </div>
        </div>

        {/* Prize Category */}
        {result.prizeCategory && (
          <div className="text-center">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {result.prizeCategory}
            </Badge>
            <p className="text-sm text-muted-foreground mt-1">
              {result.matchCount} acertos
            </p>
          </div>
        )}

        {/* Numbers */}
        <div>
          <h4 className="font-semibold mb-3">Seus Números</h4>
          <div className="flex flex-wrap gap-2">
            {result.ticket.numbers.sort((a, b) => a - b).map(number => 
              renderNumber(number, result.matches.includes(number))
            )}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Números Sorteados</h4>
          <div className="flex flex-wrap gap-2">
            {result.contestResult.sort((a, b) => a - b).map(number => 
              renderNumber(number, result.matches.includes(number))
            )}
          </div>
        </div>

        {/* Contest Info */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Concurso {result.ticket.contestNumber}</span>
            <span>•</span>
            <span>{result.ticket.betDate}</span>
          </div>
        </div>

        {/* Summary */}
        <div className="border-t pt-4">
          <div className="text-center">
            <p className="text-lg font-semibold">
              {result.matchCount} de {result.ticket.numbers.length} números
            </p>
            <p className="text-sm text-muted-foreground">
              {result.isWinner ? 'Parabéns pela premiação!' : 'Continue tentando!'}
            </p>
          </div>
        </div>

        <Button onClick={onClose} className="w-full">
          Verificar Outra Aposta
        </Button>
      </CardContent>
    </Card>
  );
};