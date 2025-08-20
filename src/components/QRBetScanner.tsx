import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, CameraOff, AlertCircle, RotateCcw, Edit } from 'lucide-react';
import { CaixaQRParser } from '@/services/caixaQRParser';
import { BetAnalysisService } from '@/services/betAnalysis';
import type { LotteryGame } from '@/types/lottery';
import type { BetTicket } from '@/types/betting';

interface QRBetScannerProps {
  game: LotteryGame;
  onBetScanned: (ticket: BetTicket) => void;
  onScanError: (error: string) => void;
  onManualEntry?: () => void;
}

export const QRBetScanner = ({ game, onBetScanned, onScanError, onManualEntry }: QRBetScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [qrAnalysis, setQrAnalysis] = useState<string | null>(null);

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

  const handleScanResult = (result: any[]) => {
    try {
      setIsScanning(false);
      
      if (!result || result.length === 0) {
        setError('Nenhum QR code detectado. Tente novamente.');
        onScanError('Nenhum QR code detectado');
        return;
      }

      const qrData = result[0]?.rawValue || result[0];
      console.log('QR code detectado:', qrData);
      
      // Analisar o formato do QR code
      const analysis = CaixaQRParser.analyzeQRCode(qrData);
      setQrAnalysis(`Formato: ${analysis.format}, Confiança: ${Math.round(analysis.confidence * 100)}%`);
      
      // Tentar parsear com o novo parser
      const ticket = CaixaQRParser.parseQRCode(qrData, game);
      
      if (!ticket) {
        setError(`QR code não reconhecido. Formato detectado: ${analysis.format}. Use a entrada manual.`);
        onScanError('QR code não reconhecido');
        return;
      }

      // Se não tiver números, é um código de autenticação - solicitar entrada manual
      if (!ticket.numbers || ticket.numbers.length === 0) {
        setError('Código de autenticação detectado. Use a entrada manual para informar os números.');
        onScanError('Requer entrada manual');
        if (onManualEntry) {
          onManualEntry();
        }
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
    if (err.name === 'NotAllowedError') {
      setCameraPermission('denied');
      setError('Permissão da câmera negada.');
    } else {
      setError('Erro na câmera. Verifique se a câmera está funcionando.');
    }
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
                onScan={handleScanResult}
                onError={handleScanError}
                constraints={{
                  facingMode: 'environment',
                  width: { min: 640, ideal: 1280, max: 1920 },
                  height: { min: 480, ideal: 720, max: 1080 }
                }}
                allowMultiple={false}
                scanDelay={300}
                formats={['qr_code', 'data_matrix', 'code_128', 'code_39']}
                components={{
                  finder: false,
                  torch: true
                }}
                styles={{
                  container: { 
                    width: '100%', 
                    height: '320px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#000'
                  }
                }}
              />
              
              {/* Overlay otimizado para mobile */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-48 h-48 border-2 border-primary rounded-lg" />
                  <p className="text-center text-white text-sm mt-2 font-medium">
                    Posicione o QR code aqui
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleStopScan} variant="outline" className="flex-1">
                <CameraOff className="h-4 w-4 mr-2" />
                Parar Scanner
              </Button>
              {onManualEntry && (
                <Button onClick={onManualEntry} variant="secondary" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Entrada Manual
                </Button>
              )}
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

        {qrAnalysis && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              QR code analisado: {qrAnalysis}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Informações sobre formatos de QR code */}
        <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md">
          <p className="font-semibold mb-2">Formatos suportados:</p>
          <ul className="space-y-1">
            <li>• <strong>Códigos da Caixa:</strong> A23C-9612061BB99E1AD2B1-7</li>
            <li>• <strong>URLs:</strong> loterias.caixa.gov.br/...</li>
            <li>• <strong>Formato simulado:</strong> mega-sena|01,15,23|simple|4.50|2500</li>
            <li>• <strong>JSON:</strong> {`{"gameId":"mega-sena","numbers":[1,15,23]}`}</li>
          </ul>
          <p className="mt-2 text-xs">
            Para códigos de autenticação, use a entrada manual após o scan.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};