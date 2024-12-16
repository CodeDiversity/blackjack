import { GameState, Hand } from '../types/game';
import { calculateHandScore } from './deckUtils';

export const REVEAL_DELAY = 1000;
export const DEALER_STAND_THRESHOLD = 17;

export function shouldDealerHit(score: number): boolean {
  return score < DEALER_STAND_THRESHOLD;
}

export function getInitialDealerState(hand: Hand): GameState['dealerHand'] {
  return {
    cards: hand.cards,
    score: calculateHandScore(hand.cards),
    isBusted: false
  };
}