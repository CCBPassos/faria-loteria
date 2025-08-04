import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useLotteryData } from '../useLotteryData'
import { mockMegaSenaGame, mockLotteryResults } from '@/test/mocks/lottery-data'
import { LoteriasApiService } from '@/services/loteriasApi'
import { IndexedDbService } from '@/services/indexedDb'

// Mock the services
vi.mock('@/services/loteriasApi')
vi.mock('@/services/indexedDb')

describe('useLotteryData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(IndexedDbService.initDatabase).mockResolvedValue(undefined)
    vi.mocked(IndexedDbService.shouldUpdateCache).mockResolvedValue(false)
    vi.mocked(IndexedDbService.getResults).mockResolvedValue(mockLotteryResults)
    vi.mocked(IndexedDbService.saveResults).mockResolvedValue(undefined)
    vi.mocked(LoteriasApiService.getAllResults).mockResolvedValue(mockLotteryResults)
  })

  it('should initialize with empty data', () => {
    const { result } = renderHook(() => useLotteryData([]))
    
    expect(result.current.data).toEqual({})
    expect(result.current.loading).toEqual({})
  })

  it('should load data for games on mount', async () => {
    const games = [mockMegaSenaGame]
    
    const { result } = renderHook(() => useLotteryData(games))
    
    await waitFor(() => {
      expect(IndexedDbService.initDatabase).toHaveBeenCalled()
    })
    
    await waitFor(() => {
      expect(result.current.data['mega-sena']).toBeDefined()
    })
  })

  it('should handle refresh functionality', async () => {
    const games = [mockMegaSenaGame]
    vi.mocked(IndexedDbService.shouldUpdateCache).mockResolvedValue(true)
    
    const { result } = renderHook(() => useLotteryData(games))
    
    await waitFor(() => {
      expect(result.current.refreshGame).toBeDefined()
    })
    
    result.current.refreshGame(mockMegaSenaGame)
    
    await waitFor(() => {
      expect(LoteriasApiService.getAllResults).toHaveBeenCalledWith('mega-sena')
    })
  })

  it('should clear cache when requested', async () => {
    const games = [mockMegaSenaGame]
    vi.mocked(IndexedDbService.clearCache).mockResolvedValue(undefined)
    
    const { result } = renderHook(() => useLotteryData(games))
    
    await waitFor(() => {
      expect(result.current.clearCache).toBeDefined()
    })
    
    await result.current.clearCache()
    
    expect(IndexedDbService.clearCache).toHaveBeenCalled()
  })
})