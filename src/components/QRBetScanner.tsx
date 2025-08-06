import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, CameraOff, AlertCircle, RotateCcw } from 'lucide-react';
import { BetAnalysisService } from '@/services/betAnalysis';
import type { LotteryGame } from '@/types/lottery';
import type { BetTicket } from '@/types/betting';

interface QRBetScannerProps {
  game: LotteryGame;
  onBetScanned: (ticket: BetTicket) => void;
  onScanError: (error: string) => void;
}

export const QRBetScanner = ({ game, onBetScanned, onScanError }: QRBetScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const handleStartScan = async () => {
    try {
      // Verificar permissão da câmera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Parar o stream de teste
      
      setCameraPermission('granted');
      setIsScanning(true);
      setError(null);
    } catch (err) {
      setCameraPermission('denied');
      setError('Permissão da câmera negada. Permita o acesso à câmera para escanear QR codes.');
      onScanError('Permissão da câmera negada');
    }
  };

  const handleScanResult = (result: string) => {
    try {
      setIsScanning(false);
      
      // Tentar parsear o QR code
      const ticket = BetAnalysisService.parseQRCode(result);
      
      if (!ticket) {
        setError('QR code inválido. Verifique se é um QR code de aposta válido.');
        onScanError('QR code inválido');
        return;
      }

      // Verificar se o jogo corresponde
      if (ticket.gameId !== game.id) {
        setError(`Este QR code é para ${ticket.gameId}, mas você está verificando ${game.name}.`);
        onScanError('Jogo não corresponde');
        return;
      }

      // Validar os números da aposta
      const validation = BetAnalysisService.validateBetNumbers(ticket.numbers, game);
      if (!validation.isValid) {
        setError(`Aposta inválida: ${validation.errors.join(', ')}`);
        onScanError('Aposta inválida');
        return;
      }

      onBetScanned(ticket);
    } catch (err) {
      console.error('Erro ao processar QR code:', err);
      setError('Erro ao processar QR code. Tente novamente.');
      onScanError('Erro ao processar');
    }
  };

  const handleScanError = (err: Error) => {
    console.error('Erro no scanner:', err);
    setError('Erro na câmera. Verifique se a câmera está funcionando.');
    setIsScanning(false);
  };

  const handleStopScan = () => {
    setIsScanning(false);
    setError(null);
  };

  const handleRetry = () => {
    setError(null);
    setCameraPermission('prompt');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Scanner de QR Code - {game.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isScanning && cameraPermission !== 'denied' && (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Posicione o QR code da sua aposta na frente da câmera
            </p>
            <Button onClick={handleStartScan} className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Iniciar Scanner
            </Button>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div className="relative">
              <Scanner
                onScan={(result) => {
                  if (result) {
                    handleScanResult(result[0]?.rawValue || '');
                  }
                }}
                onError={handleScanError}
                constraints={{
                  facingMode: 'environment',
                  width: { ideal: 640 },
                  height: { ideal: 480 }
                }}
                styles={{
                  container: {
                    width: '100%',
                    height: '300px',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  },
                  video: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }
                }}
              />
              
              {/* Overlay para destacar a área de scan */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg opacity-50" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-48 h-48 border-2 border-primary rounded-lg" />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleStopScan} variant="outline" className="flex-1">
                <CameraOff className="h-4 w-4 mr-2" />
                Parar Scanner
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Aponte a câmera para o QR code da sua aposta
            </p>
          </div>
        )}

        {cameraPermission === 'denied' && (
          <div className="text-center space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Permissão da câmera negada. Para usar o scanner de QR code, 
                permita o acesso à câmera nas configurações do seu navegador.
              </AlertDescription>
            </Alert>
            <Button onClick={handleRetry} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Informações sobre o formato do QR code */}
        <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md">
          <p className="font-semibold mb-1">Formato esperado do QR code:</p>
          <p>gameId|números|tipo|valor|concurso</p>
          <p className="mt-1">Exemplo: mega-sena|01,15,23,32,44,55|simple|4.50|2500</p>
        </div>
      </CardContent>
    </Card>
  );
};