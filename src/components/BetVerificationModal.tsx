import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BetInputForm } from '@/components/BetInputForm';
import { BetResultDisplay } from '@/components/BetResultDisplay';
import { QRBetScanner } from '@/components/QRBetScanner';
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

  const handleQRScanSuccess = (ticket: BetTicket) => {
    const drawnNumbers = getDrawnNumbers();
    const analysisResult = BetAnalysisService.analyzeBet(ticket, drawnNumbers, game);
    setResult(analysisResult);
  };

  const handleQRScanError = (error: string) => {
    console.error('Erro no scan:', error);
    // O erro já é exibido no componente QRBetScanner
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
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Entrada Manual</TabsTrigger>
                <TabsTrigger value="qr">Scanner QR</TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="mt-4">
                <BetInputForm game={game} onSubmit={handleBetSubmit} />
              </TabsContent>
              
              <TabsContent value="qr" className="mt-4">
                <QRBetScanner 
                  game={game} 
                  onBetScanned={handleQRScanSuccess}
                  onScanError={handleQRScanError}
                />
              </TabsContent>
            </Tabs>
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