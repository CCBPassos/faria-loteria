import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LotteryCard } from '../LotteryCard'
import { mockMegaSenaGame } from '@/test/mocks/lottery-data'

const mockResults = {
  topNumbers: [
    { number: 1, frequency: 10, percentage: 20 },
    { number: 2, frequency: 8, percentage: 16 },
    { number: 3, frequency: 6, percentage: 12 }
  ],
  suggestions: [
    [1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12]
  ]
}

describe('LotteryCard', () => {
  const defaultProps = {
    game: mockMegaSenaGame,
    results: mockResults,
    isLoading: false,
    onRefresh: vi.fn()
  }

  it('should render game information correctly', () => {
    render(<LotteryCard {...defaultProps} />)
    
    expect(screen.getByText('Mega-Sena')).toBeInTheDocument()
    expect(screen.getByText('🎰')).toBeInTheDocument()
  })

  it('should display loading state', () => {
    render(<LotteryCard {...defaultProps} isLoading={true} />)
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('should display top numbers', () => {
    render(<LotteryCard {...defaultProps} />)
    
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should display suggestions', () => {
    render(<LotteryCard {...defaultProps} />)
    
    // Check if suggestion numbers are displayed
    expect(screen.getByText('01 02 03 04 05 06')).toBeInTheDocument()
    expect(screen.getByText('07 08 09 10 11 12')).toBeInTheDocument()
  })

  it('should call onRefresh when refresh button is clicked', () => {
    const mockOnRefresh = vi.fn()
    render(<LotteryCard {...defaultProps} onRefresh={mockOnRefresh} />)
    
    const refreshButton = screen.getByRole('button', { name: /atualizar/i })
    fireEvent.click(refreshButton)
    
    expect(mockOnRefresh).toHaveBeenCalledTimes(1)
  })

  it('should handle empty results gracefully', () => {
    const emptyResults = {
      topNumbers: [],
      suggestions: []
    }
    
    render(<LotteryCard {...defaultProps} results={emptyResults} />)
    
    expect(screen.getByText('Mega-Sena')).toBeInTheDocument()
    // Should not crash and should still display the game name
  })
})