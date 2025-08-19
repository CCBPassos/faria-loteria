import { useState, useEffect } from 'react';
import type { LotteryData, LotteryGame } from '@/types/lottery';
import { LoteriasApiService } from '@/services/loteriasApi';
import { IndexedDbService } from '@/services/indexedDb';
import { LotteryAnalysisService } from '@/services/lotteryAnalysis';
import { useToast } from '@/hooks/use-toast';

export const useLotteryData = (games: LotteryGame[]) => {
  const [data, setData] = useState<LotteryData>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  const loadGameData = async (game: LotteryGame, forceRefresh = false) => {
    setLoading(prev => ({ ...prev, [game.id]: true }));
    
    try {
      // Verifica se deve atualizar o cache (24 horas de cache por padrão)
      const shouldUpdate = forceRefresh || await IndexedDbService.shouldUpdateCache(game.id, 24);
      
      let results;
      
      if (shouldUpdate) {
        // Busca dados da API
        console.log(`Buscando dados da API para ${game.name}...`);
        results = await LoteriasApiService.getAllResults(game.id);
        
        // Salva no cache
        await IndexedDbService.saveResults(game.id, results);
        
        toast({
          title: "Dados atualizados",
          description: `${game.name}: ${results.length} sorteios carregados da API`,
        });
      } else {
        // Usa dados do cache
        console.log(`Usando dados do cache para ${game.name}...`);
        results = await IndexedDbService.getResults(game.id);
        
        if (results.length === 0) {
          // Se não há dados no cache, busca da API
          results = await LoteriasApiService.getAllResults(game.id);
          await IndexedDbService.saveResults(game.id, results);
        }
      }
      
      // Analisa os resultados
      const analysis = LotteryAnalysisService.analyzeResults(results, game);
      
      setData(prev => ({
        ...prev,
        [game.id]: analysis
      }));
      
    } catch (error) {
      console.error(`Erro ao carregar dados para ${game.name}:`, error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: `Não foi possível carregar os dados da ${game.name}. Verifique sua conexão.`,
      });
      
      // Tenta usar dados do cache em caso de erro
      try {
        const cachedResults = await IndexedDbService.getResults(game.id);
        if (cachedResults.length > 0) {
          const analysis = LotteryAnalysisService.analyzeResults(cachedResults, game);
          setData(prev => ({
            ...prev,
            [game.id]: analysis
          }));
          
          toast({
            title: "Usando dados do cache",
            description: `Carregados ${cachedResults.length} sorteios salvos localmente para ${game.name}`,
          });
        }
      } catch (cacheError) {
        console.error('Erro ao acessar cache:', cacheError);
      }
    } finally {
      setLoading(prev => ({ ...prev, [game.id]: false }));
    }
  };

  const refreshGame = (game: LotteryGame) => {
    loadGameData(game, true); // Force refresh
    setLastUpdate(new Date());
  };

  const refreshAll = () => {
    games.forEach(game => loadGameData(game, true)); // Force refresh
    setLastUpdate(new Date());
  };

  const clearCache = async () => {
    try {
      await IndexedDbService.clearCache();
      toast({
        title: "Cache limpo",
        description: "Todos os dados salvos localmente foram removidos",
      });
      
      // Recarrega todos os jogos
      games.forEach(game => loadGameData(game, true));
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível limpar o cache",
      });
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setError(null);
        console.log('Inicializando aplicação...');
        
        // Inicializa o banco de dados
        await IndexedDbService.initDatabase();
        console.log('IndexedDB inicializado com sucesso');
        
        // Carrega dados iniciais para todos os jogos
        const loadPromises = games.map(game => loadGameData(game));
        await Promise.allSettled(loadPromises);
        
        setIsInitialized(true);
        console.log('Aplicação inicializada com sucesso');
        
      } catch (error) {
        console.error('Erro crítico na inicialização:', error);
        setError('Falha na inicialização da aplicação');
        
        // Fallback: tenta carregar apenas da API
        try {
          console.log('Tentando fallback para API...');
          const fallbackPromises = games.map(game => loadGameData(game, true));
          await Promise.allSettled(fallbackPromises);
          setIsInitialized(true);
          
          toast({
            title: "Modo limitado",
            description: "Aplicação funcionando sem cache local",
          });
        } catch (fallbackError) {
          console.error('Falha no fallback:', fallbackError);
          setError('Não foi possível conectar com os serviços');
        }
      }
    };

    initializeApp();
  }, [games]);

  return {
    data,
    loading,
    error,
    isInitialized,
    lastUpdate,
    refreshGame,
    refreshAll,
    clearCache
  };
};