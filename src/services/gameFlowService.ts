import { GameState, GameStatus, GameMessage, Hand, BetResult } from '../types/game';

/**
 * Result of a completed blackjack game round.
 */
export interface GameResult {
  /** The type of result (win, loss, push, blackjack, bust) */
  type: 'win' | 'loss' | 'push' | 'blackjack' | 'bust';
  /** Final score of the player's hand */
  playerScore: number;
  /** Final score of the dealer's hand */
  dealerScore: number;
  /** Amount of chips won (includes original bet if returned) */
  winnings: number;
  /** Message to display for this result */
  message: string;
}

/**
 * Complete state update for when a game ends.
 */
export interface GameEndState {
  /** Updated game status */
  gameStatus: GameStatus;
  /** Message to display */
  message: string;
  /** Updated chip count */
  chips: number;
  /** Updated current bet amount */
  currentBet: number;
  /** Updated betting history */
  bettingHistory: BetResult[];
  /** Updated win/loss statistics */
  stats: {
    totalWins: number;
    totalLosses: number;
    totalPushes: number;
  };
  /** Whether to show confetti animation */
  showConfetti: boolean;
  /** Next game status for transitions */
  nextGameStatus?: GameStatus;
  /** Next message for transitions */
  nextMessage?: string;
}

/**
 * Service class that handles game flow logic and calculations.
 * Contains the core business rules for blackjack gameplay.
 */
export class GameFlowService {
  /**
   * Determines the outcome of a blackjack round based on final hands.
   * Implements standard blackjack rules including blackjack bonuses.
   * @param playerHand - The player's final hand
   * @param dealerHand - The dealer's final hand
   * @param betAmount - The amount bet on this round
   * @returns The complete game result with winnings and message
   */
  static determineGameResult(
    playerHand: Hand,
    dealerHand: Hand,
    betAmount: number
  ): GameResult {
    const playerScore = playerHand.score;
    const dealerScore = dealerHand.score;
    
    console.log('GameFlowService.determineGameResult:', {
      playerScore,
      dealerScore,
      playerCards: playerHand.cards.length,
      dealerCards: dealerHand.cards.length,
      playerBusted: playerHand.isBusted,
      dealerBusted: dealerHand.isBusted,
      betAmount
    });

    // Player bust
    if (playerHand.isBusted) {
      return {
        type: 'bust',
        playerScore,
        dealerScore,
        winnings: 0,
        message: GameMessage.PlayerBust
      };
    }

    // Dealer bust
    if (dealerHand.isBusted) {
      return {
        type: 'win',
        playerScore,
        dealerScore,
        winnings: betAmount * 2,
        message: GameMessage.PlayerWins
      };
    }

    // Blackjack check
    const playerBlackjack = playerScore === 21 && playerHand.cards.length === 2;
    const dealerBlackjack = dealerScore === 21 && dealerHand.cards.length === 2;

    if (playerBlackjack && dealerBlackjack) {
      return {
        type: 'push',
        playerScore,
        dealerScore,
        winnings: betAmount,
        message: GameMessage.Push
      };
    }

    if (playerBlackjack) {
      return {
        type: 'blackjack',
        playerScore,
        dealerScore,
        winnings: betAmount + Math.floor(betAmount * 1.5),
        message: 'Blackjack! You win!'
      };
    }

    if (dealerBlackjack) {
      return {
        type: 'loss',
        playerScore,
        dealerScore,
        winnings: 0,
        message: GameMessage.DealerBlackjack
      };
    }

    // Regular comparison
    if (playerScore > dealerScore) {
      console.log('GameResult: Player wins');
      return {
        type: 'win',
        playerScore,
        dealerScore,
        winnings: betAmount * 2,
        message: GameMessage.PlayerWins
      };
    } else if (dealerScore > playerScore) {
      console.log('GameResult: Dealer wins (should be loss)');
      return {
        type: 'loss',
        playerScore,
        dealerScore,
        winnings: 0,
        message: GameMessage.DealerWins
      };
    } else {
      console.log('GameResult: Push (tie)');
      return {
        type: 'push',
        playerScore,
        dealerScore,
        winnings: betAmount,
        message: GameMessage.Push
      };
    }
  }

  /**
   * Builds the complete end game state including updated stats and chips.
   * @param currentState - The current game state
   * @param result - The determined game result
   * @returns Complete state update for game end
   */
  static buildGameEndState(
    currentState: GameState,
    result: GameResult
  ): GameEndState {
    const betAmount = currentState.currentBet;
    const newBetResult: BetResult = {
      amount: betAmount,
      won: result.winnings > betAmount,
      timestamp: new Date()
    };

    // Update stats
    const stats = { ...currentState.stats };
    if (result.winnings > betAmount) {
      stats.totalWins++;
    } else if (result.winnings === betAmount) {
      stats.totalPushes++;
    } else {
      stats.totalLosses++;
    }

    return {
      gameStatus: GameStatus.Finished,
      message: `${result.message} (Dealer: ${result.dealerScore})`,
      chips: currentState.chips + result.winnings,
      currentBet: 0,
      bettingHistory: [newBetResult, ...currentState.bettingHistory].slice(0, 5),
      stats,
      showConfetti: result.winnings > betAmount,
      nextGameStatus: GameStatus.Betting,
      nextMessage: GameMessage.PlaceBet
    };
  }

  /**
   * Determines if the dealer should hit according to standard blackjack rules.
   * Dealer must hit on 16 or less, and on soft 17.
   * @param dealerHand - The dealer's current hand
   * @returns True if dealer should hit, false if dealer should stand
   */
  static shouldDealerHit(dealerHand: Hand): boolean {
    return dealerHand.score < 17 || (dealerHand.score === 17 && this.isSoftSeventeen(dealerHand));
  }

  /**
   * Checks if a hand is a soft 17 (17 containing an ace counted as 11).
   * @param hand - The hand to check
   * @returns True if the hand is a soft 17
   */
  private static isSoftSeventeen(hand: Hand): boolean {
    if (hand.score !== 17) return false;
    
    let aces = 0;
    let total = 0;
    
    for (const card of hand.cards) {
      if (card.value === 1) {
        aces++;
        total += 11;
      } else {
        total += Math.min(card.value, 10);
      }
    }
    
    // Adjust for aces
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    
    return total === 17 && aces > 0;
  }

  /**
   * Validates that a bet can be placed with current chips.
   * @param chips - Current chip count
   * @param currentBet - Current bet amount
   * @param additionalBet - Additional bet to place
   * @returns True if bet is valid
   */
  static validateBet(chips: number, currentBet: number, additionalBet: number): boolean {
    return chips >= additionalBet && (currentBet + additionalBet) > 0;
  }

  /**
   * Determines if the player can double down based on game state.
   * Player can only double down with exactly 2 cards and sufficient chips.
   * @param playerHand - The player's current hand
   * @param chips - Current chip count
   * @param currentBet - Current bet amount
   * @returns True if double down is allowed
   */
  static canDoubleDown(playerHand: Hand, chips: number, currentBet: number): boolean {
    return (
      playerHand.cards.length === 2 &&
      chips >= currentBet &&
      currentBet > 0
    );
  }
}