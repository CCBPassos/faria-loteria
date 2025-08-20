import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Edit, Check } from 'lucide-react';
import type { LotteryGame } from '@/types/lottery';
import type { BetTicket } from '@/types/betting';

interface ManualBetInputProps {
  game: LotteryGame;
  initialTicket?: Partial<BetTicket>;
  onBetSubmit: (ticket: BetTicket) => void;
  onCancel?: () => void;
}

export const ManualBetInput = ({ game, initialTicket, onBetSubmit, onCancel }: ManualBetInputProps) => {
  const [numbers, setNumbers] = useState<string>(
    initialTicket?.numbers?.join(', ') || ''
  );
  const [authCode, setAuthCode] = useState<string>(
    initialTicket?.authCode || ''
  );
  const [drawNumber, setDrawNumber] = useState<string>(
    initialTicket?.drawNumber?.toString() || ''
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    try {
      setError(null);
      
      // Validar números
      const numberArray = numbers
        .split(',')
        .map(n => parseInt(n.trim()))
        .filter(n => !isNaN(n));
      
      if (numberArray.length !== game.numbersPerGame) {
        setError(`Selecione exatamente ${game.numbersPerGame} números para ${game.name}`);
        return;
      }
      
      // Validar range
      const invalidNumbers = numberArray.filter(num => 
        num < game.minNumber || num > game.maxNumber
      );
      if (invalidNumbers.length > 0) {
        setError(`Números devem estar entre ${game.minNumber} e ${game.maxNumber}`);
        return;
      }
      
      // Validar números únicos
      const uniqueNumbers = new Set(numberArray);
      if (uniqueNumbers.size !== numberArray.length) {
        setError('Não é possível repetir números');
        return;
      }
      
      // Criar ticket
      const ticket: BetTicket = {
        gameId: game.id,
        numbers: numberArray.sort((a, b) => a - b),
        betType: 'simple',
        cost: getGameBaseCost(game.id),
        drawNumber: drawNumber ? parseInt(drawNumber) : undefined,
        betDate: new Date().toISOString(),
        ...(authCode && { authCode })
      };
      
      onBetSubmit(ticket);
    } catch (err) {
      setError('Erro ao processar aposta. Verifique os dados inseridos.');
    }
  };

  const getGameBaseCost = (gameId: string): number => {
    const baseCosts: Record<string, number> = {
      'mega-sena': 5.00,
      'lotofacil': 3.00,
      'quina': 2.50,
      'lotomania': 3.00
    };
    return baseCosts[gameId] || 2.50;
  };

  const generateExampleNumbers = () => {
    const exampleNumbers: number[] = [];
    while (exampleNumbers.length < game.numbersPerGame) {
      const num = Math.floor(Math.random() * (game.maxNumber - game.minNumber + 1)) + game.minNumber;
      if (!exampleNumbers.includes(num)) {
        exampleNumbers.push(num);
      }
    }
    setNumbers(exampleNumbers.sort((a, b) => a - b).join(', '));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          Inserir Aposta Manualmente - {game.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="numbers">
            Números da Aposta ({game.numbersPerGame} números de {game.minNumber} a {game.maxNumber})
          </Label>
          <Input
            id="numbers"
            placeholder={`Ex: ${Array.from({length: game.numbersPerGame}, (_, i) => (i + 1).toString().padStart(2, '0')).join(', ')}`}
            value={numbers}
            onChange={(e) => setNumbers(e.target.value)}
            className="font-mono"
          />
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={generateExampleNumbers}
            className="text-xs"
          >
            Gerar Números Aleatórios
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="authCode">
            Código de Autenticação (opcional)
          </Label>
          <Input
            id="authCode"
            placeholder="Ex: A23C-9612061BB99E1AD2B1-7"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Código encontrado no QR code ou no bilhete físico
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="drawNumber">
            Número do Concurso (opcional)
          </Label>
          <Input
            id="drawNumber"
            type="number"
            placeholder="Ex: 2500"
            value={drawNumber}
            onChange={(e) => setDrawNumber(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Deixe em branco para verificar contra o último sorteio
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSubmit} className="flex-1">
            <Check className="h-4 w-4 mr-2" />
            Verificar Aposta
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md">
          <p className="font-semibold mb-1">Dicas para inserção:</p>
          <ul className="space-y-1">
            <li>• Separe os números por vírgula (ex: 01, 15, 23, 32, 44, 55)</li>
            <li>• Para {game.name}: selecione {game.numbersPerGame} números de {game.minNumber} a {game.maxNumber}</li>
            <li>• O código de autenticação pode ser encontrado no QR code do bilhete</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};