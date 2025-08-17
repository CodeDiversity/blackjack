/**
 * Represents a playing card in the blackjack game.
 */
export interface Card {
  /** The card's suit (hearts, diamonds, clubs, or spades) */
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  /** The numerical value of the card (1-10) */
  value: number;
  /** The face representation of the card (2-10, J, Q, K, A) */
  face: string;
  /** Whether the card is revealed (for dealer's hidden card) */
  revealed?: boolean;
}

/**
 * Represents a hand of cards for either player or dealer.
 */
export interface Hand {
  /** Array of cards in the hand */
  cards: Card[];
  /** Current calculated score of the hand */
  score: number;
  /** Whether this hand has busted (exceeded 21) */
  isBusted: boolean;
}

/**
 * Represents the result of a betting round.
 */
export interface BetResult {
  /** The amount that was bet */
  amount: number;
  /** Whether the bet was won */
  won: boolean;
  /** When the bet was placed */
  timestamp: Date;
}

/**
 * Enumeration of possible game states.
 */
export enum GameStatus {
  /** Player is placing a bet */
  Betting = 'betting',
  /** Cards are being dealt */
  Dealing = 'dealing',
  /** Player is making their move */
  Playing = 'playing',
  /** Dealer is taking their turn */
  DealerTurn = 'dealerTurn',
  /** Game round is complete */
  Finished = 'finished'
}

/**
 * Predefined messages displayed to the player during gameplay.
 */
export enum GameMessage {
  /** Prompt to place a bet */
  PlaceBet = 'Place your bet!',
  /** Cards are being dealt */
  DealingCards = 'Dealing cards...',
  /** Player's turn to act */
  YourTurn = 'Your turn!',
  /** Dealer is taking their turn */
  DealerTurn = "Dealer's turn...",
  /** Player has busted */
  PlayerBust = 'Bust! Dealer wins!',
  /** Tie game */
  Push = 'Push!',
  /** Player wins */
  PlayerWins = 'You win!',
  /** Dealer wins */
  DealerWins = 'Dealer wins!',
  /** Dealer has blackjack */
  DealerBlackjack = 'Dealer Blackjack!'
}

/**
 * The complete state of the blackjack game.
 */
export interface GameState {
  /** Player's current hand */
  playerHand: Hand;
  /** Dealer's current hand */
  dealerHand: Hand;
  /** Remaining cards in the deck */
  deck: Card[];
  /** Current state of the game */
  gameStatus: GameStatus;
  /** Current message to display to the player */
  message: string;
  /** Player's current chip count */
  chips: number;
  /** Current bet amount */
  currentBet: number;
  /** Previous bet amount (for quick rebetting) */
  previousBet: number;
  /** Index of the last revealed dealer card */
  revealIndex: number;
  /** History of recent betting results */
  bettingHistory: BetResult[];
  /** Player's win/loss statistics */
  stats: {
    /** Total number of wins */
    totalWins: number;
    /** Total number of losses */
    totalLosses: number;
    /** Total number of pushes (ties) */
    totalPushes: number;
  };
  /** Next game status for transitions */
  nextGameStatus?: GameStatus;
  /** Next message for transitions */
  nextMessage?: string;
  /** Whether to show confetti animation */
  showConfetti: boolean;
}