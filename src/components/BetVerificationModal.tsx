import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BetInputForm } from '@/components/BetInputForm';
import { BetResultDisplay } from '@/components/BetResultDisplay';
import { BetAnalysisService } from '@/services/betAnalysis';
import type { LotteryGame } from '@/types/lottery';
import type { BetTicket, BetResult } from '@/types/betting';

interface BetVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: LotteryGame;
  latestDrawNumbers?: number[];
}

export const BetVerificationModal = ({ 
  isOpen, 
  onClose, 
  game, 
  latestDrawNumbers 
}: BetVerificationModalProps) => {
  const [result, setResult] = useState<BetResult | null>(null);

  // Números simulados para o último sorteio se não fornecidos
  const getDrawnNumbers = (): number[] => {
    if (latestDrawNumbers && latestDrawNumbers.length === game.numbersPerGame) {
      return latestDrawNumbers;
    }

    // Gerar números aleatórios simulados para o último sorteio
    const numbers: number[] = [];
    while (numbers.length < game.numbersPerGame) {
      const randomNum = Math.floor(Math.random() * (game.maxNumber - game.minNumber + 1)) + game.minNumber;
      if (!numbers.includes(randomNum)) {
        numbers.push(randomNum);
      }
    }
    return numbers.sort((a, b) => a - b);
  };

  const handleBetSubmit = (ticket: BetTicket) => {
    const drawnNumbers = getDrawnNumbers();
    const analysisResult = BetAnalysisService.analyzeBet(ticket, drawnNumbers, game);
    setResult(analysisResult);
  };

  const handleNewCheck = () => {
    setResult(null);
  };

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{game.icon}</span>
            Verificar Aposta - {game.name}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {!result ? (
            <BetInputForm game={game} onSubmit={handleBetSubmit} />
          ) : (
            <BetResultDisplay 
              result={result} 
              game={game} 
              onNewCheck={handleNewCheck}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};