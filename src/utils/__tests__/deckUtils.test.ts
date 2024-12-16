import { describe, it, expect } from 'vitest';
import { createDeck, shuffleDeck, calculateHandScore } from '../deckUtils';
import { Card } from '../../types/game';

describe('deckUtils', () => {
  describe('createDeck', () => {
    it('should create a deck with 52 cards', () => {
      const deck = createDeck();
      expect(deck).toHaveLength(52);
    });

    it('should have correct number of cards per suit', () => {
      const deck = createDeck();
      const hearts = deck.filter(card => card.suit === 'hearts');
      expect(hearts).toHaveLength(13);
    });

    it('should have correct number of each value', () => {
      const deck = createDeck();
      const aces = deck.filter(card => card.face === 'A');
      const kings = deck.filter(card => card.face === 'K');
      expect(aces).toHaveLength(4);
      expect(kings).toHaveLength(4);
    });
  });

  describe('shuffleDeck', () => {
    it('should return a deck with the same cards but in different order', () => {
      const originalDeck = createDeck();
      const shuffled = shuffleDeck([...originalDeck]);
      
      expect(shuffled).toHaveLength(originalDeck.length);
      expect(shuffled).not.toEqual(originalDeck);
      
    });
  });

  describe('calculateHandScore', () => {
    it('should correctly calculate numeric cards', () => {
      const hand: Card[] = [
        { suit: 'hearts', value: 10, face: '10' },
        { suit: 'clubs', value: 5, face: '5' }
      ];
      expect(calculateHandScore(hand)).toBe(15);
    });

    it('should correctly calculate face cards', () => {
      const hand: Card[] = [
        { suit: 'hearts', value: 10, face: 'K' },
        { suit: 'clubs', value: 10, face: 'Q' }
      ];
      expect(calculateHandScore(hand)).toBe(20);
    });

    it('should handle aces correctly (as 11)', () => {
      const hand: Card[] = [
        { suit: 'hearts', value: 11, face: 'A' },
        { suit: 'clubs', value: 10, face: '10' }
      ];
      expect(calculateHandScore(hand)).toBe(21);
    });

    it('should handle multiple aces correctly', () => {
      const hand: Card[] = [
        { suit: 'hearts', value: 11, face: 'A' },
        { suit: 'clubs', value: 11, face: 'A' },
        { suit: 'diamonds', value: 5, face: '5' }
      ];
      expect(calculateHandScore(hand)).toBe(17); // One ace as 11, one as 1
    });
  });
});