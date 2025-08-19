import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { X, Download, Smartphone, Zap, Wifi } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const PWAInstallPrompt = () => {
  const { canInstall, promptInstall, isStandalone } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Mostrar prompt apenas se puder instalar e não foi dismissido
    const wasDismissed = localStorage.getItem('pwa-prompt-dismissed') === 'true';
    
    if (canInstall && !wasDismissed && !isStandalone) {
      // Aguardar um pouco antes de mostrar para não ser intrusivo
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [canInstall, isStandalone]);

  const handleInstall = async () => {
    try {
      await promptInstall();
      setShowPrompt(false);
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Não mostrar se não pode instalar ou já foi dismissido
  if (!showPrompt || dismissed || isStandalone) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-300">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Instalar App</h3>
                <p className="text-sm text-muted-foreground">Lotto Stats Guru</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3 text-sm">
              <Zap className="w-4 h-4 text-primary" />
              <span>Acesso mais rápido</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Wifi className="w-4 h-4 text-primary" />
              <span>Funciona offline</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Download className="w-4 h-4 text-primary" />
              <span>Instalar na tela inicial</span>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="flex-1"
            >
              Agora não
            </Button>
            <Button
              onClick={handleInstall}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Instalar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};