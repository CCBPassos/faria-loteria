import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoteriasApiService } from '../loteriasApi'
import { mockLotteryResults } from '@/test/mocks/lottery-data'

describe('LoteriasApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getLatestResult', () => {
    it('should fetch latest result successfully', async () => {
      const mockResponse = mockLotteryResults[0]
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await LoteriasApiService.getLatestResult('mega-sena')
      
      expect(fetch).toHaveBeenCalledWith('https://loteriascaixa-api.herokuapp.com/api/megasena/latest')
      expect(result).toEqual(mockResponse)
    })

    it('should throw error when API fails', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      await expect(LoteriasApiService.getLatestResult('mega-sena'))
        .rejects
        .toThrow('Erro ao buscar dados da mega-sena: 404')
    })
  })

  describe('getAllResults', () => {
    it('should fetch all results successfully', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLotteryResults)
      })

      const results = await LoteriasApiService.getAllResults('mega-sena')
      
      expect(fetch).toHaveBeenCalledWith('https://loteriascaixa-api.herokuapp.com/api/megasena')
      expect(results).toEqual(mockLotteryResults)
    })

    it('should fallback to latest result when all results fail', async () => {
      const mockLatest = mockLotteryResults[0]
      
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLatest)
        })

      const results = await LoteriasApiService.getAllResults('mega-sena')
      
      expect(results).toEqual([mockLatest])
    })
  })

  describe('getAllAvailableGames', () => {
    it('should return available games', async () => {
      const mockGames = ['megasena', 'lotofacil', 'quina']
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGames)
      })

      const games = await LoteriasApiService.getAllAvailableGames()
      
      expect(games).toEqual(mockGames)
    })

    it('should return default games when API fails', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false
      })

      const games = await LoteriasApiService.getAllAvailableGames()
      
      expect(games).toEqual(['megasena', 'lotofacil', 'quina', 'lotomania'])
    })
  })
})