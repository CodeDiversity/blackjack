import { describe, it, expect } from 'vitest';
import { calculateWinnings, INITIAL_CHIPS } from '../betUtils';

describe('betUtils', () => {
  describe('calculateWinnings', () => {
    it('should return double bet when player wins', () => {
      const result = calculateWinnings(18, 20, 100, false);
      expect(result.amount).toBe(200);
      expect(result.message).toBe('You win!');
    });

    it('should return 0 when dealer wins', () => {
      const result = calculateWinnings(20, 18, 100, false);
      expect(result.amount).toBe(0);
      expect(result.message).toBe('Dealer wins!');
    });

    it('should return original bet on push', () => {
      const result = calculateWinnings(20, 20, 100, false);
      expect(result.amount).toBe(100);
      expect(result.message).toBe('Push!');
    });

    it('should return double bet when dealer busts', () => {
      const result = calculateWinnings(22, 20, 100, true);
      expect(result.amount).toBe(200);
      expect(result.message).toBe('Dealer busts! You win!');
    });
  });

  it('should have correct initial chips amount', () => {
    expect(INITIAL_CHIPS).toBe(1000);
  });
});