import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  promptInstall: () => Promise<void>;
  canInstall: boolean;
}

export const usePWA = (): PWAInstallState => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Verificar se está rodando como PWA instalado
  const isStandalone = 
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone ||
    document.referrer.includes('android-app://');

  useEffect(() => {
    // Detectar se a PWA já está instalada
    setIsInstalled(isStandalone);

    // Escutar evento de instalação disponível
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWA] beforeinstallprompt event fired');
      
      // Prevenir o prompt automático
      e.preventDefault();
      
      // Salvar o evento para uso posterior
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Escutar quando a PWA for instalada
    const handleAppInstalled = () => {
      console.log('[PWA] App foi instalada');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Registrar event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone]);

  // Função para mostrar o prompt de instalação
  const promptInstall = async (): Promise<void> => {
    if (!deferredPrompt) {
      console.log('[PWA] Nenhum prompt de instalação disponível');
      return;
    }

    try {
      console.log('[PWA] Mostrando prompt de instalação');
      
      // Mostrar o prompt
      await deferredPrompt.prompt();
      
      // Aguardar escolha do usuário
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('[PWA] Escolha do usuário:', outcome);
      
      if (outcome === 'accepted') {
        console.log('[PWA] Usuário aceitou instalar a PWA');
      } else {
        console.log('[PWA] Usuário rejeitou instalar a PWA');
      }
      
      // Limpar o prompt
      setDeferredPrompt(null);
      setIsInstallable(false);
      
    } catch (error) {
      console.error('[PWA] Erro ao mostrar prompt:', error);
    }
  };

  return {
    isInstallable,
    isInstalled,
    isStandalone,
    promptInstall,
    canInstall: isInstallable && !isInstalled
  };
};