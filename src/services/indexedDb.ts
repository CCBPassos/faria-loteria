import type { LotteryApiResult } from './loteriasApi';

const DB_NAME = 'LoteriasAnaliseDB';
const DB_VERSION = 1;
const RESULTS_STORE = 'lottery_results';
const CACHE_STORE = 'cache_metadata';

interface CacheMetadata {
  gameId: string;
  lastUpdate: string;
  totalResults: number;
}

export class IndexedDbService {
  private static db: IDBDatabase | null = null;

  static async initDatabase(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store para resultados das loterias
        if (!db.objectStoreNames.contains(RESULTS_STORE)) {
          const resultsStore = db.createObjectStore(RESULTS_STORE, { keyPath: ['loteria', 'concurso'] });
          resultsStore.createIndex('loteria', 'loteria', { unique: false });
          resultsStore.createIndex('data', 'data', { unique: false });
        }
        
        // Store para metadados de cache
        if (!db.objectStoreNames.contains(CACHE_STORE)) {
          db.createObjectStore(CACHE_STORE, { keyPath: 'gameId' });
        }
      };
    });
  }

  static async saveResults(gameId: string, results: LotteryApiResult[]): Promise<void> {
    const db = await this.initDatabase();
    const transaction = db.transaction([RESULTS_STORE, CACHE_STORE], 'readwrite');
    
    try {
      const resultsStore = transaction.objectStore(RESULTS_STORE);
      const cacheStore = transaction.objectStore(CACHE_STORE);
      
      // Salva todos os resultados
      for (const result of results) {
        await new Promise<void>((resolve, reject) => {
          const request = resultsStore.put(result);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
      
      // Atualiza metadados do cache
      const metadata: CacheMetadata = {
        gameId,
        lastUpdate: new Date().toISOString(),
        totalResults: results.length
      };
      
      await new Promise<void>((resolve, reject) => {
        const request = cacheStore.put(metadata);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
    } catch (error) {
      console.error('Erro ao salvar resultados no IndexedDB:', error);
      throw error;
    }
  }

  static async getResults(gameId: string): Promise<LotteryApiResult[]> {
    const db = await this.initDatabase();
    const transaction = db.transaction(RESULTS_STORE, 'readonly');
    const store = transaction.objectStore(RESULTS_STORE);
    const index = store.index('loteria');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(gameId);
      request.onsuccess = () => {
        const results = request.result || [];
        // Ordena por número do concurso (mais recente primeiro)
        results.sort((a, b) => b.concurso - a.concurso);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  static async getCacheMetadata(gameId: string): Promise<CacheMetadata | null> {
    const db = await this.initDatabase();
    const transaction = db.transaction(CACHE_STORE, 'readonly');
    const store = transaction.objectStore(CACHE_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.get(gameId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  static async shouldUpdateCache(gameId: string, maxAgeHours: number = 24): Promise<boolean> {
    try {
      const metadata = await this.getCacheMetadata(gameId);
      if (!metadata) return true;
      
      const lastUpdate = new Date(metadata.lastUpdate);
      const maxAge = maxAgeHours * 60 * 60 * 1000; // Converte para millisegundos
      const now = new Date();
      
      return (now.getTime() - lastUpdate.getTime()) > maxAge;
    } catch (error) {
      console.error('Erro ao verificar cache:', error);
      return true; // Em caso de erro, atualiza o cache
    }
  }

  static async clearCache(gameId?: string): Promise<void> {
    const db = await this.initDatabase();
    const transaction = db.transaction([RESULTS_STORE, CACHE_STORE], 'readwrite');
    
    try {
      if (gameId) {
        // Limpa apenas um jogo específico
        const resultsStore = transaction.objectStore(RESULTS_STORE);
        const index = resultsStore.index('loteria');
        
        const resultsRequest = index.getAllKeys(gameId);
        resultsRequest.onsuccess = () => {
          const keys = resultsRequest.result;
          keys.forEach(key => resultsStore.delete(key));
        };
        
        const cacheStore = transaction.objectStore(CACHE_STORE);
        cacheStore.delete(gameId);
      } else {
        // Limpa todo o cache
        transaction.objectStore(RESULTS_STORE).clear();
        transaction.objectStore(CACHE_STORE).clear();
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      throw error;
    }
  }
}