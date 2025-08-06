import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { LotteryGame } from '@/types/lottery';
import type { BetTicket } from '@/types/betting';
import { BetAnalysisService } from '@/services/betAnalysis';

interface BetInputFormProps {
  game: LotteryGame;
  onSubmit: (ticket: BetTicket) => void;
}

export const BetInputForm = ({ game, onSubmit }: BetInputFormProps) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleAddNumber = () => {
    const num = parseInt(inputValue.trim());
    
    if (isNaN(num)) {
      setErrors(['Digite um número válido']);
      return;
    }

    if (selectedNumbers.includes(num)) {
      setErrors(['Este número já foi selecionado']);
      return;
    }

    if (num < game.minNumber || num > game.maxNumber) {
      setErrors([`Número deve estar entre ${game.minNumber} e ${game.maxNumber}`]);
      return;
    }

    if (selectedNumbers.length >= game.numbersPerGame) {
      setErrors([`Máximo de ${game.numbersPerGame} números permitidos`]);
      return;
    }

    setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    setInputValue('');
    setErrors([]);
  };

  const handleRemoveNumber = (numToRemove: number) => {
    setSelectedNumbers(selectedNumbers.filter(num => num !== numToRemove));
    setErrors([]);
  };

  const handleSubmit = () => {
    const validation = BetAnalysisService.validateBetNumbers(selectedNumbers, game);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const ticket: BetTicket = {
      gameId: game.id,
      numbers: selectedNumbers,
      betType: 'simple',
      cost: 4.50, // Valor padrão simulado
      betDate: new Date().toISOString()
    };

    onSubmit(ticket);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddNumber();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">{game.icon}</span>
          Digite os números da sua aposta - {game.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input para adicionar números */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="number-input">
              Adicionar número ({game.minNumber}-{game.maxNumber})
            </Label>
            <Input
              id="number-input"
              type="number"
              min={game.minNumber}
              max={game.maxNumber}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Digite um número entre ${game.minNumber} e ${game.maxNumber}`}
            />
          </div>
          <Button 
            onClick={handleAddNumber}
            className="mt-6"
            disabled={!inputValue.trim()}
          >
            Adicionar
          </Button>
        </div>

        {/* Números selecionados */}
        <div>
          <Label>
            Números selecionados ({selectedNumbers.length}/{game.numbersPerGame})
          </Label>
          <div className="flex flex-wrap gap-2 mt-2 min-h-[40px] p-2 border rounded-md">
            {selectedNumbers.length === 0 ? (
              <span className="text-muted-foreground text-sm">
                Nenhum número selecionado
              </span>
            ) : (
              selectedNumbers.map((num) => (
                <Badge
                  key={num}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveNumber(num)}
                >
                  {num.toString().padStart(2, '0')}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* Erros */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Botão de verificar */}
        <Button 
          onClick={handleSubmit}
          className="w-full"
          disabled={selectedNumbers.length !== game.numbersPerGame}
        >
          Verificar Aposta
        </Button>
      </CardContent>
    </Card>
  );
};