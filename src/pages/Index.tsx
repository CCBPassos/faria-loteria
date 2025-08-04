import { Header } from "@/components/Header";
import { StatsOverview } from "@/components/StatsOverview";
import { LotteryCard } from "@/components/LotteryCard";
import { useLotteryData } from "@/hooks/useLotteryData";
import { LOTTERY_GAMES } from "@/types/lottery";

const Index = () => {
  const { data, loading, lastUpdate, refreshGame, refreshAll } = useLotteryData(LOTTERY_GAMES);
  
  const isAnyLoading = Object.values(loading).some(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Header onRefreshAll={refreshAll} isLoading={isAnyLoading} />
      
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
            Dados simulados para demonstração. Em produção, seria integrado com APIs oficiais da CEF.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
