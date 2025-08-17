import { Card } from '../types/game';

/**
 * Creates a new shuffled deck of 52 playing cards.
 * @returns A shuffled array of Card objects representing a complete deck
 */
export function createDeck(): Card[] {
  const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const deck: Card[] = [];

  suits.forEach(suit => {
    // Add number cards
    for (let i = 2; i <= 10; i++) {
      deck.push({ suit, value: i, face: i.toString() });
    }
    // Add face cards
    deck.push({ suit, value: 10, face: 'J' });
    deck.push({ suit, value: 10, face: 'Q' });
    deck.push({ suit, value: 10, face: 'K' });
    deck.push({ suit, value: 1, face: 'A' }); // Ace value handled by calculateHandScore
  });

  return shuffleDeck(deck);
}

/**
 * Shuffles a deck of cards using the Fisher-Yates algorithm.
 * @param deck - The deck of cards to shuffle
 * @returns A new shuffled array of cards
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

/**
 * Calculates the total score of a hand of cards according to blackjack rules.
 * Aces are counted as 11 when possible, otherwise as 1.
 * @param cards - Array of cards to calculate the score for
 * @returns The optimal score for the hand
 */
export function calculateHandScore(cards: Card[]): number {
  let score = 0;
  let aces = 0;

  cards.forEach(card => {
    if (card.face === 'A') {
      aces += 1;
    } else {
      score += card.value;
    }
  });

  // Add aces
  for (let i = 0; i < aces; i++) {
    if (score + 11 <= 21) {
      score += 11;
    } else {
      score += 1;
    }
  }

  return score;
}

/**
 * Determines if a hand is a blackjack (21 with exactly 2 cards).
 * @param cards - Array of cards to check
 * @returns True if the hand is a blackjack, false otherwise
 */
export function hasBlackjack(cards: Card[]): boolean {
  return calculateHandScore(cards) === 21 && cards.length === 2;
}

/**
 * Alias for createDeck() for backward compatibility.
 * @returns A shuffled array of Card objects representing a complete deck
 */
export function createNewDeck(): Card[] {
  return createDeck();
}

/**
 * Deals a single card from the top of the deck.
 * @param deck - The deck to deal from
 * @returns A tuple containing the dealt card and the remaining deck
 * @throws Error if the deck is empty
 */
export function dealCard(deck: Card[]): [Card, Card[]] {
  if (deck.length === 0) {
    throw new Error('Cannot deal from empty deck');
  }
  
  const newDeck = [...deck];
  const card = newDeck.pop()!;
  return [card, newDeck];
}