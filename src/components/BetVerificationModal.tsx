import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { ManualBetInput } from '@/components/ManualBetInput';
import { BetInputForm } from '@/components/BetInputForm';
import { BetResultDisplay } from '@/components/BetResultDisplay';
import { QRBetScanner } from '@/components/QRBetScanner';
import { BetHistoryDisplay } from '@/components/BetHistoryDisplay';
import { BetVerificationService } from '@/services/betVerification';
import { useBetVerification } from '@/hooks/useBetVerification';
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
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [authCodeForManual, setAuthCodeForManual] = useState<string | null>(null);
  const { betHistory, addBetResult, clearHistory, getStats, getHistoryByGame } = useBetVerification();

  const handleBetSubmit = async (ticket: BetTicket) => {
    setIsVerifying(true);
    setVerificationError(null);
    
    try {
      // Validar se a aposta é compatível com o jogo
      if (!BetVerificationService.validateBetForGame(ticket, game)) {
        throw new Error('Aposta não é compatível com o jogo selecionado');
      }

      // Verificar aposta usando dados reais
      const analysisResult = await BetVerificationService.verifyBet(ticket, game);
      setResult(analysisResult);
      addBetResult(analysisResult);
    } catch (error) {
      console.error('Erro na verificação:', error);
      setVerificationError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleQRScanSuccess = async (ticket: BetTicket) => {
    setIsVerifying(true);
    setVerificationError(null);
    
    try {
      // Validar se a aposta é compatível com o jogo
      if (!BetVerificationService.validateBetForGame(ticket, game)) {
        throw new Error('Aposta do QR code não é compatível com o jogo selecionado');
      }

      // Verificar aposta usando dados reais
      const analysisResult = await BetVerificationService.verifyBet(ticket, game);
      setResult(analysisResult);
      addBetResult(analysisResult);
    } catch (error) {
      console.error('Erro na verificação via QR:', error);
      setVerificationError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleQRScanError = (error: string) => {
    console.error('Erro no scan:', error);
    // Se detectou código de autenticação, abrir entrada manual
    if (error === 'Requer entrada manual') {
      setShowManualEntry(true);
    }
  };

  const handleManualEntry = () => {
    setShowManualEntry(true);
  };

  const handleManualEntrySubmit = async (ticket: BetTicket) => {
    setShowManualEntry(false);
    await handleBetSubmit(ticket);
  };

  const handleManualEntryCancel = () => {
    setShowManualEntry(false);
    setAuthCodeForManual(null);
  };

  const handleNewCheck = () => {
    setResult(null);
    setVerificationError(null);
    setShowManualEntry(false);
    setAuthCodeForManual(null);
  };

  const handleClose = () => {
    setResult(null);
    setVerificationError(null);
    setIsVerifying(false);
    setShowManualEntry(false);
    setAuthCodeForManual(null);
    onClose();
  };

  const gameHistory = getHistoryByGame(game.id);
  const stats = getStats();

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
          {/* Loading state */}
          {isVerifying && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Verificando aposta com dados oficiais...</span>
            </div>
          )}

          {/* Error state */}
          {verificationError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{verificationError}</AlertDescription>
            </Alert>
          )}

          {!result && !isVerifying && !showManualEntry ? (
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="manual" disabled={isVerifying}>
                  Entrada Manual
                </TabsTrigger>
                <TabsTrigger value="qr" disabled={isVerifying}>
                  Scanner QR
                </TabsTrigger>
                <TabsTrigger value="history" disabled={isVerifying}>
                  Histórico ({gameHistory.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="mt-4">
                <BetInputForm game={game} onSubmit={handleBetSubmit} />
              </TabsContent>
              
              <TabsContent value="qr" className="mt-4">
                <QRBetScanner 
                  game={game} 
                  onBetScanned={handleQRScanSuccess}
                  onScanError={handleQRScanError}
                  onManualEntry={handleManualEntry}
                />
              </TabsContent>
              
              <TabsContent value="history" className="mt-4">
                <BetHistoryDisplay 
                  history={gameHistory}
                  onClearHistory={clearHistory}
                  stats={stats}
                />
              </TabsContent>
            </Tabs>
          ) : showManualEntry ? (
            <ManualBetInput
              game={game}
              initialTicket={{ authCode: authCodeForManual }}
              onBetSubmit={handleManualEntrySubmit}
              onCancel={handleManualEntryCancel}
            />
          ) : result ? (
            <BetResultDisplay 
              result={result} 
              game={game} 
              onNewCheck={handleNewCheck}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};