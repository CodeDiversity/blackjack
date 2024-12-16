import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGameLogic } from '../useGameLogic';
import { act } from 'react';

describe('useGameLogic', () => {
  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useGameLogic());

    expect(result.current.gameState).toMatchObject({
      gameStatus: 'betting',
      chips: 1000,
      currentBet: 0,
      previousBet: 0
    });
  });

  it('should handle placing bets', () => {
    const { result } = renderHook(() => useGameLogic());

    act(() => {
      result.current.placeBet(100);
    });

    expect(result.current.gameState.chips).toBe(900);
    expect(result.current.gameState.currentBet).toBe(100);
  });

  it('should handle placing previous bet', () => {
    const { result } = renderHook(() => useGameLogic());

    // Place initial bet and start hand
    act(() => {
      result.current.placeBet(100);
      result.current.startNewHand();
    });

    // Start new game
    act(() => {
      result.current.startNewHand();
    });

    // Place previous bet
    act(() => {
      result.current.placePreviousBet();
      result.current.startNewHand();
    });

    expect(result.current.gameState.currentBet).toBe(100);
    expect(result.current.gameState.chips).toBe(800);
  });

  it('should handle player bust', () => {
    const { result } = renderHook(() => useGameLogic());

    // Setup game state with high cards
    act(() => {
      result.current.placeBet(100);
      result.current.startNewHand();
    });

    // Force multiple hits to bust
    while (result.current.gameState.gameStatus === 'playing') {
      act(() => {
        result.current.handleHit();
      });
    }

    expect(result.current.gameState.gameStatus).toBe('betting');
    expect(result.current.gameState.message).toContain('Place your bet!');
  });
});