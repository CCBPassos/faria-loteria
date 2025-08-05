import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRBetScanner } from './QRBetScanner';
import { BetResultDisplay } from './BetResultDisplay';
import { BetAnalysisService } from '@/services/betAnalysis';
import { LoteriasApiService } from '@/services/loteriasApi';
import { useToast } from '@/hooks/use-toast';
import type { BetTicket, BetResult } from '@/types/betting';
import type { LotteryGame } from '@/types/lottery';

interface BetVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: LotteryGame;
}

export const BetVerificationModal = ({ isOpen, onClose, game }: BetVerificationModalProps) => {
  const [currentTicket, setCurrentTicket] = useState<BetTicket | null>(null);
  const [result, setResult] = useState<BetResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleScanResult = async (ticket: BetTicket) => {
    if (ticket.gameId !== game.id) {
      toast({
        title: "Jogo incorreto",
        description: `Esta aposta é de ${ticket.gameId}, mas você está verificando ${game.name}`,
        variant: "destructive"
      });
      return;
    }

    setCurrentTicket(ticket);
    setIsLoading(true);

    try {
      // Busca o resultado do concurso
      const contestResult = await LoteriasApiService.getLatestResult(ticket.gameId);
      
      // Analisa a aposta
      const betResult = BetAnalysisService.analyzeContest(ticket, contestResult);
      setResult(betResult);

      if (betResult.isWinner) {
        toast({
          title: "🎉 Parabéns!",
          description: `Você ganhou na categoria ${betResult.prizeCategory}!`,
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Erro ao verificar aposta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar sua aposta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (error: string) => {
    toast({
      title: "Erro no scanner",
      description: error,
      variant: "destructive"
    });
  };

  const handleClose = () => {
    setCurrentTicket(null);
    setResult(null);
    onClose();
  };

  const handleNewScan = () => {
    setCurrentTicket(null);
    setResult(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{game.icon}</span>
            Verificar Aposta - {game.name}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Verificando sua aposta...</p>
          </div>
        ) : result ? (
          <BetResultDisplay 
            result={result} 
            onClose={handleNewScan}
          />
        ) : (
          <QRBetScanner
            onScanResult={handleScanResult}
            onClose={handleClose}
            onError={handleError}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};