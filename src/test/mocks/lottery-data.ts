import type { LotteryApiResult } from '@/services/loteriasApi'
import type { LotteryGame } from '@/types/lottery'

export const mockMegaSenaGame: LotteryGame = {
  id: 'mega-sena',
  name: 'Mega-Sena',
  numbersPerGame: 6,
  minNumber: 1,
  maxNumber: 60,
  color: 'mega-sena',
  icon: '🎰'
}

export const mockLotofacilGame: LotteryGame = {
  id: 'lotofacil',
  name: 'Lotofácil',
  numbersPerGame: 15,
  minNumber: 1,
  maxNumber: 25,
  color: 'lotofacil',
  icon: '🍀'
}

export const mockLotteryResults: LotteryApiResult[] = [
  {
    loteria: 'megasena',
    concurso: 2001,
    data: '2023-01-01',
    local: 'São Paulo',
    dezenas: ['01', '02', '03', '04', '05', '06'],
    dezenasOrdemSorteio: ['01', '02', '03', '04', '05', '06'],
    premiacoes: [],
    acumulou: false,
    valorArrecadado: 1000000,
    valorEstimadoProximoConcurso: 2000000
  },
  {
    loteria: 'megasena',
    concurso: 2002,
    data: '2023-01-02',
    local: 'São Paulo',
    dezenas: ['01', '07', '08', '09', '10', '11'],
    dezenasOrdemSorteio: ['01', '07', '08', '09', '10', '11'],
    premiacoes: [],
    acumulou: false,
    valorArrecadado: 1000000,
    valorEstimadoProximoConcurso: 2000000
  }
]