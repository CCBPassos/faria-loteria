import { Loader2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen = ({ message = "Carregando aplicação..." }: LoadingScreenProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-center text-muted-foreground">{message}</p>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {['🎰', '🍀', '⭐', '🎯'].map((icon, index) => (
              <div 
                key={index}
                className="w-8 h-8 flex items-center justify-center text-lg animate-pulse"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {icon}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};