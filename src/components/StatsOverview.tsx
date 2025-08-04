import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Clock, Database, TrendingUp } from "lucide-react";
import type { LotteryData } from "@/types/lottery";

interface StatsOverviewProps {
  data: LotteryData;
  lastUpdate: Date;
}

export const StatsOverview = ({ data, lastUpdate }: StatsOverviewProps) => {
  const totalGames = Object.keys(data).length;
  const totalSuggestions = Object.values(data).reduce((acc, game) => acc + game.suggestions.length, 0);
  
  const getMostFrequentNumber = () => {
    let maxFrequency = 0;
    let mostFrequent = 0;
    
    Object.values(data).forEach(game => {
      if (game.topNumbers.length > 0 && game.topNumbers[0].frequency > maxFrequency) {
        maxFrequency = game.topNumbers[0].frequency;
        mostFrequent = game.topNumbers[0].number;
      }
    });
    
    return { number: mostFrequent, frequency: maxFrequency };
  };

  const mostFrequent = getMostFrequentNumber();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Modalidades</CardTitle>
          <Database className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{totalGames}</div>
          <p className="text-xs text-muted-foreground">jogos analisados</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sugestões</CardTitle>
          <TrendingUp className="h-4 w-4 text-accent-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent-foreground">{totalSuggestions}</div>
          <p className="text-xs text-muted-foreground">combinações geradas</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mais Sorteado</CardTitle>
          <BarChart3 className="h-4 w-4 text-chart-3" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-lg font-bold bg-chart-3/20 border-chart-3/40">
              {mostFrequent.number.toString().padStart(2, '0')}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{mostFrequent.frequency} ocorrências</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-muted/20 to-muted/10 border-border/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium">
            {lastUpdate.toLocaleDateString('pt-BR')}
          </div>
          <p className="text-xs text-muted-foreground">
            {lastUpdate.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};