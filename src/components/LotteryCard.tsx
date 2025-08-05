import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, RefreshCw, QrCode } from "lucide-react";
import { BetVerificationModal } from "./BetVerificationModal";
import type { LotteryGame, LotteryResults } from "@/types/lottery";

interface LotteryCardProps {
  game: LotteryGame;
  results: LotteryResults;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const LotteryCard = ({ game, results, onRefresh, isLoading }: LotteryCardProps) => {
  const [showVerification, setShowVerification] = useState(false);

  return (
    <>
      <BetVerificationModal 
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        game={game}
      />
    <Card className="bg-gradient-to-br from-card to-secondary/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">{game.icon}</span>
            {game.name}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="bg-background/50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-primary/20 text-primary-foreground">
            {game.numbersPerGame} números
          </Badge>
          <Badge variant="outline" className="border-primary/30">
            {game.minNumber} - {game.maxNumber}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Top Numbers */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Números Mais Sorteados</h3>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {results.topNumbers.slice(0, 10).map((item, index) => (
              <div
                key={item.number}
                className={`
                  relative p-2 rounded-lg text-center border transition-all duration-300
                  ${index < 3 
                    ? 'bg-primary/20 border-primary/40 shadow-sm' 
                    : 'bg-muted/50 border-border/50'
                  }
                `}
              >
                <div className="font-bold text-sm">{item.number.toString().padStart(2, '0')}</div>
                <div className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</div>
                {index < 3 && (
                  <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bet Verification */}
        <div>
          <Button
            onClick={() => setShowVerification(true)}
            className="w-full mb-4"
            variant="outline"
          >
            <QrCode className="h-4 w-4 mr-2" />
            Verificar Minha Aposta
          </Button>
        </div>

        {/* Suggestions */}
        <div>
          <h3 className="font-semibold text-sm mb-3">Sugestões de Jogos</h3>
          <div className="space-y-2">
            {results.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-gradient-to-r from-muted/30 to-muted/50 border border-border/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Jogo {index + 1}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {suggestion.map((number) => (
                    <Badge
                      key={number}
                      variant="outline"
                      className="bg-primary/10 border-primary/30 text-foreground font-mono"
                    >
                      {number.toString().padStart(2, '0')}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
};