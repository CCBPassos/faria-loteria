const CACHE_NAME = 'lotto-stats-v1.2.0';
const OFFLINE_URL = '/offline.html';

// Assets para cache inicial
const CORE_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/offline.html'
];

// APIs externas que devem ser cached
const API_CACHE_PATTERNS = [
  /^https:\/\/servicebus2\.caixa\.gov\.br\//,
  /^https:\/\/loteriascaixa-api\.herokuapp\.com\//
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache aberto');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Assets principais cached');
        return self.skipWaiting();
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar controle imediatamente
      self.clients.claim()
    ])
  );
});

// Estratégia de fetch: Network First para APIs, Cache First para assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar Chrome extensions e outros protocolos
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Estratégia para APIs de loteria
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Estratégia para assets estáticos
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Estratégia padrão para navegação
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigate(request));
    return;
  }

  // Estratégia padrão: Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// Network First Strategy (para APIs)
async function networkFirstStrategy(request) {
  const cacheName = CACHE_NAME;
  
  try {
    // Tentar buscar da rede primeiro
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Salvar no cache se a resposta for bem-sucedida
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Rede falhou, buscando do cache:', request.url);
    
    // Se a rede falhar, buscar do cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se não tiver no cache, retornar erro
    throw error;
  }
}

// Cache First Strategy (para assets estáticos)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Atualizar cache em background
    fetch(request).then(response => {
      if (response.ok) {
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, response);
        });
      }
    }).catch(() => {
      // Ignorar erros de atualização em background
    });
    
    return cachedResponse;
  }
  
  // Se não estiver no cache, buscar da rede
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      const cache = caches.open(CACHE_NAME);
      cache.then(c => c.put(request, response.clone()));
    }
    return response;
  }).catch(() => {
    // Em caso de erro, retornar a versão cached se existir
    return cachedResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// Handle Navigate (para páginas)
async function handleNavigate(request) {
  try {
    // Tentar buscar da rede primeiro
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Se falhar, tentar buscar do cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se não tiver no cache, retornar página offline
    const offlinePage = await caches.match(OFFLINE_URL);
    if (offlinePage) {
      return offlinePage;
    }
    
    // Fallback final
    return new Response('Aplicativo offline. Verifique sua conexão.', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

// Verificar se é asset estático
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.ico'];
  return staticExtensions.some(ext => url.includes(ext));
}

// Background Sync para dados offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'lottery-data-sync') {
    event.waitUntil(syncLotteryData());
  }
});

async function syncLotteryData() {
  console.log('[SW] Sincronizando dados de loteria...');
  
  try {
    // Aqui você pode implementar lógica para sincronizar dados
    // quando a conexão for restaurada
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: 'Dados sincronizados com sucesso!'
      });
    });
  } catch (error) {
    console.error('[SW] Erro na sincronização:', error);
  }
}

// Notificações Push (opcional)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova informação disponível!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Detalhes',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Lotto Stats Guru', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});