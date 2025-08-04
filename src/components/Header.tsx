import { Button } from "@/components/ui/button";
import { RefreshCw, BarChart3, Trash2 } from "lucide-react";

interface HeaderProps {
  onRefreshAll: () => void;
  onClearCache?: () => void;
  isLoading: boolean;
}

export const Header = ({ onRefreshAll, onClearCache, isLoading }: HeaderProps) => {
  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Loteria Analytics
              </h1>
              <p className="text-sm text-muted-foreground">
                Análise estatística dos jogos da Caixa Econômica Federal
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {onClearCache && (
              <Button
                variant="outline"
                onClick={onClearCache}
                disabled={isLoading}
                className="border-destructive/20 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Cache
              </Button>
            )}
            <Button
              onClick={onRefreshAll}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar Dados
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};