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

export enum GameStatus {
  Betting = 'betting',
  Dealing = 'dealing',
  Playing = 'playing',
  DealerTurn = 'dealerTurn',
  Finished = 'finished'
}

export enum GameMessage {
  PlaceBet = 'Place your bet!',
  DealingCards = 'Dealing cards...',
  YourTurn = 'Your turn!',
  DealerTurn = "Dealer's turn...",
  PlayerBust = 'Bust! Dealer wins!',
  Push = 'Push!',
  PlayerWins = 'You win!',
  DealerWins = 'Dealer wins!'
}

export interface GameState {
  playerHand: Hand;
  dealerHand: Hand;
  deck: Card[];
  gameStatus: GameStatus;
  message: string;
  chips: number;
  currentBet: number;
  previousBet: number;
  revealIndex: number;
  bettingHistory: BetResult[];
  stats: {
    totalWins: number;
    totalLosses: number;
    totalPushes: number;
  };
  nextGameStatus?: GameStatus;
  nextMessage?: string;
}