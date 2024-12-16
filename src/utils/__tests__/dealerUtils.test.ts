import { describe, it, expect } from 'vitest';
import { shouldDealerHit, getInitialDealerState, DEALER_STAND_THRESHOLD } from '../dealerUtils';

describe('dealerUtils', () => {
  describe('shouldDealerHit', () => {
    it('should hit when score is below threshold', () => {
      expect(shouldDealerHit(16)).toBe(true);
    });

    it('should stand when score equals threshold', () => {
      expect(shouldDealerHit(DEALER_STAND_THRESHOLD)).toBe(false);
    });

    it('should stand when score is above threshold', () => {
      expect(shouldDealerHit(18)).toBe(false);
    });
  });

  describe('getInitialDealerState', () => {
    it('should return correct initial state', () => {
      const hand = {
        cards: [
          { suit: 'hearts', value: 10, face: 'K' },
          { suit: 'clubs', value: 7, face: '7' }
        ],
        score: 0,
        isBusted: false
      };

      const state = getInitialDealerState(hand);
      expect(state.score).toBe(17);
      expect(state.isBusted).toBe(false);
      expect(state.cards).toEqual(hand.cards);
    });
  });
});