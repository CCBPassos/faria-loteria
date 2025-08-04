import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App'
import { LoteriasApiService } from '@/services/loteriasApi'
import { IndexedDbService } from '@/services/indexedDb'
import { mockLotteryResults } from '@/test/mocks/lottery-data'

// Mock services
vi.mock('@/services/loteriasApi')
vi.mock('@/services/indexedDb')

const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('Lottery App Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(IndexedDbService.initDatabase).mockResolvedValue(undefined)
    vi.mocked(IndexedDbService.shouldUpdateCache).mockResolvedValue(false)
    vi.mocked(IndexedDbService.getResults).mockResolvedValue(mockLotteryResults)
    vi.mocked(IndexedDbService.saveResults).mockResolvedValue(undefined)
    vi.mocked(IndexedDbService.clearCache).mockResolvedValue(undefined)
    vi.mocked(LoteriasApiService.getAllResults).mockResolvedValue(mockLotteryResults)
  })

  it('should render the main app', async () => {
    render(<App />, { wrapper: AppWrapper })
    
    expect(screen.getByText('Análise Estatística das Loterias')).toBeInTheDocument()
  })

  it('should display lottery cards', async () => {
    render(<App />, { wrapper: AppWrapper })
    
    await waitFor(() => {
      expect(screen.getByText('Mega-Sena')).toBeInTheDocument()
      expect(screen.getByText('Lotofácil')).toBeInTheDocument()
      expect(screen.getByText('Quina')).toBeInTheDocument()
      expect(screen.getByText('Lotomania')).toBeInTheDocument()
    })
  })

  it('should load lottery data on mount', async () => {
    render(<App />, { wrapper: AppWrapper })
    
    await waitFor(() => {
      expect(IndexedDbService.initDatabase).toHaveBeenCalled()
      expect(LoteriasApiService.getAllResults).toHaveBeenCalledWith('mega-sena')
      expect(LoteriasApiService.getAllResults).toHaveBeenCalledWith('lotofacil')
      expect(LoteriasApiService.getAllResults).toHaveBeenCalledWith('quina')
      expect(LoteriasApiService.getAllResults).toHaveBeenCalledWith('lotomania')
    })
  })
})