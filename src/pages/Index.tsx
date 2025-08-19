import { Header } from "@/components/Header";
import { StatsOverview } from "@/components/StatsOverview";
import { LotteryCard } from "@/components/LotteryCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { useLotteryData } from "@/hooks/useLotteryData";
import { LOTTERY_GAMES } from "@/types/lottery";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { data, loading, error, isInitialized, lastUpdate, refreshGame, refreshAll, clearCache } = useLotteryData(LOTTERY_GAMES);
  
  const isAnyLoading = Object.values(loading).some(Boolean);

  // Show loading screen during initialization
  if (!isInitialized && !error) {
    return <LoadingScreen message="Iniciando aplicação..." />;
  }

  // Show error screen if critical error occurred
  if (error && !isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Erro na Aplicação</CardTitle>
            </div>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="w-full">
              Recarregar Aplicação
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onRefreshAll={refreshAll} onClearCache={clearCache} isLoading={isAnyLoading} />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <StatsOverview data={data} lastUpdate={lastUpdate} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {LOTTERY_GAMES.map(game => (
            <LotteryCard
              key={game.id}
              game={game}
              results={data[game.id] || { topNumbers: [], suggestions: [] }}
              onRefresh={() => refreshGame(game)}
              isLoading={loading[game.id]}
            />
          ))}
        </div>
        
        <footer className="text-center py-8 border-t border-border/20">
          <p className="text-sm text-muted-foreground">
            📊 Dados reais obtidos via API da Caixa Econômica Federal
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            🔄 Cache local disponível • Atualização automática a cada 24h
          </p>
          <p className="text-xs text-muted-foreground/75 mt-1">
            Última atualização: {lastUpdate ? new Date(lastUpdate).toLocaleString('pt-BR') : 'Carregando...'}
          </p>
        </footer>
      </main>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
