export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: number;
  face: string;
  revealed?: boolean;
}

export interface Hand {
  cards: Card[];
  score: number;
  isBusted: boolean;
}

export interface BetResult {
  amount: number;
  won: boolean;
  timestamp: Date;
}

export interface GameState {
  playerHand: Hand;
  dealerHand: Hand;
  deck: Card[];
  gameStatus: 'betting' | 'dealing' | 'playing' | 'dealerTurn' | 'finished';
  message: string;
  chips: number;
  currentBet: number;
  previousBet: number; // Added to track previous bet
  revealIndex: number;
  bettingHistory: BetResult[];
  stats: {
    totalWins: number;
    totalLosses: number;
    totalPushes: number;
  };
  nextGameStatus?: 'betting' | 'dealing' | 'playing' | 'dealerTurn' | 'finished';
  nextMessage?: string;
}