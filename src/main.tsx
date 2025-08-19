import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registrado com sucesso:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nova versão disponível
                console.log('[PWA] Nova versão disponível');
                
                // Opcional: Mostrar notificação de atualização
                if (window.confirm('Nova versão disponível! Deseja atualizar?')) {
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('[PWA] Falha ao registrar Service Worker:', error);
      });
  });

  // Escutar mensagens do Service Worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SYNC_COMPLETE') {
      console.log('[PWA]', event.data.message);
    }
  });
}

// Verificar se está online/offline
window.addEventListener('online', () => {
  console.log('[PWA] Conexão restaurada');
  // Opcional: Mostrar toast de conexão restaurada
});

window.addEventListener('offline', () => {
  console.log('[PWA] Conexão perdida');
  // Opcional: Mostrar toast de conexão perdida
});

createRoot(document.getElementById("root")!).render(<App />);
