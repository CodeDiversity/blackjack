import { Card } from '../types/game';

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

export function shuffleDeck(deck: Card[]): Card[] {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

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

export function hasBlackjack(cards: Card[]): boolean {
  return calculateHandScore(cards) === 21 && cards.length === 2;
}

// Alias for backward compatibility
export function createNewDeck(): Card[] {
  return createDeck();
}

// Deal a card from the deck
export function dealCard(deck: Card[]): [Card, Card[]] {
  if (deck.length === 0) {
    throw new Error('Cannot deal from empty deck');
  }
  
  const newDeck = [...deck];
  const card = newDeck.pop()!;
  return [card, newDeck];
}