import { describe, it, expect } from 'vitest'
import { LotteryAnalysisService } from '../lotteryAnalysis'
import { mockMegaSenaGame, mockLotteryResults } from '@/test/mocks/lottery-data'

describe('LotteryAnalysisService', () => {
  describe('analyzeResults', () => {
    it('should analyze lottery results correctly', () => {
      const analysis = LotteryAnalysisService.analyzeResults(mockLotteryResults, mockMegaSenaGame)
      
      expect(analysis).toHaveProperty('topNumbers')
      expect(analysis).toHaveProperty('suggestions')
      expect(analysis.topNumbers).toHaveLength(60) // All possible numbers for Mega-Sena
      expect(analysis.suggestions).toHaveLength(5)
      expect(analysis.suggestions[0]).toHaveLength(6) // 6 numbers per game for Mega-Sena
    })

    it('should calculate frequencies correctly', () => {
      const analysis = LotteryAnalysisService.analyzeResults(mockLotteryResults, mockMegaSenaGame)
      
      // Number 1 appears in both results, so frequency should be 2
      const number1 = analysis.topNumbers.find(n => n.number === 1)
      expect(number1?.frequency).toBe(2)
      expect(number1?.percentage).toBe(100) // 2 out of 2 draws
      
      // Number 2 appears only in first result
      const number2 = analysis.topNumbers.find(n => n.number === 2)
      expect(number2?.frequency).toBe(1)
      expect(number2?.percentage).toBe(50) // 1 out of 2 draws
      
      // Number 60 never appears
      const number60 = analysis.topNumbers.find(n => n.number === 60)
      expect(number60?.frequency).toBe(0)
      expect(number60?.percentage).toBe(0)
    })

    it('should sort numbers by frequency', () => {
      const analysis = LotteryAnalysisService.analyzeResults(mockLotteryResults, mockMegaSenaGame)
      
      // Check that numbers are sorted by frequency (descending)
      for (let i = 0; i < analysis.topNumbers.length - 1; i++) {
        const current = analysis.topNumbers[i]
        const next = analysis.topNumbers[i + 1]
        
        // Either current frequency is higher, or they're equal and current number is lower
        expect(
          current.frequency > next.frequency || 
          (current.frequency === next.frequency && current.number < next.number)
        ).toBe(true)
      }
    })

    it('should generate valid suggestions', () => {
      const analysis = LotteryAnalysisService.analyzeResults(mockLotteryResults, mockMegaSenaGame)
      
      analysis.suggestions.forEach(suggestion => {
        // Each suggestion should have correct number of elements
        expect(suggestion).toHaveLength(mockMegaSenaGame.numbersPerGame)
        
        // All numbers should be unique
        expect(new Set(suggestion).size).toBe(suggestion.length)
        
        // All numbers should be within valid range
        suggestion.forEach(number => {
          expect(number).toBeGreaterThanOrEqual(mockMegaSenaGame.minNumber)
          expect(number).toBeLessThanOrEqual(mockMegaSenaGame.maxNumber)
        })
        
        // Numbers should be sorted
        const sortedSuggestion = [...suggestion].sort((a, b) => a - b)
        expect(suggestion).toEqual(sortedSuggestion)
      })
    })
  })
})