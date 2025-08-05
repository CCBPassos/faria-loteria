import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X, RotateCcw } from 'lucide-react';
import { BetAnalysisService } from '@/services/betAnalysis';
import type { BetTicket } from '@/types/betting';

interface QRBetScannerProps {
  onScanResult: (ticket: BetTicket) => void;
  onClose: () => void;
  onError: (error: string) => void;
}

export const QRBetScanner = ({ onScanResult, onClose, onError }: QRBetScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);

  useEffect(() => {
    if (!videoRef.current) return;

    const qrScanner = new QrScanner(
      videoRef.current,
      (result) => {
        const ticket = BetAnalysisService.parseQRCode(result.data);
        if (ticket) {
          onScanResult(ticket);
          qrScanner.stop();
        } else {
          onError('QR code inválido ou formato não reconhecido');
        }
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 5,
      }
    );

    setScanner(qrScanner);

    qrScanner.start().then(() => {
      setIsScanning(true);
    }).catch((error) => {
      console.error('Erro ao iniciar scanner:', error);
      setHasCamera(false);
      onError('Não foi possível acessar a câmera. Verifique as permissões.');
    });

    return () => {
      qrScanner.stop();
      qrScanner.destroy();
    };
  }, [onScanResult, onError]);

  const handleFlipCamera = async () => {
    if (!scanner) return;
    
    try {
      const cameras = await QrScanner.listCameras(true);
      if (cameras.length > 1) {
        await scanner.setCamera(cameras[1].id);
      }
    } catch (error) {
      console.error('Erro ao trocar câmera:', error);
    }
  };

  if (!hasCamera) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Câmera não disponível</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Verifique se você deu permissão para usar a câmera
          </p>
          <Button onClick={onClose} className="w-full">
            Fechar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-4">
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full rounded-lg"
            style={{ maxHeight: '300px' }}
          />
          
          {isScanning && (
            <div className="absolute inset-0 border-2 border-primary rounded-lg flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
                <span className="text-xs text-primary font-medium bg-background/80 px-2 py-1 rounded">
                  Aponte para o QR code
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFlipCamera}
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Trocar Câmera
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-3">
          Posicione o QR code da sua aposta dentro da área destacada
        </p>
      </CardContent>
    </Card>
  );
};