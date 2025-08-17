import { GameState, GameStatus, GameMessage, Hand, BetResult } from '../types/game';

export interface GameResult {
  type: 'win' | 'loss' | 'push' | 'blackjack' | 'bust';
  playerScore: number;
  dealerScore: number;
  winnings: number;
  message: string;
}

export interface GameEndState {
  gameStatus: GameStatus;
  message: string;
  chips: number;
  currentBet: number;
  bettingHistory: BetResult[];
  stats: {
    totalWins: number;
    totalLosses: number;
    totalPushes: number;
  };
  showConfetti: boolean;
  nextGameStatus?: GameStatus;
  nextMessage?: string;
}

export class GameFlowService {
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

  static shouldDealerHit(dealerHand: Hand): boolean {
    return dealerHand.score < 17 || (dealerHand.score === 17 && this.isSoftSeventeen(dealerHand));
  }

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

  static validateBet(chips: number, currentBet: number, additionalBet: number): boolean {
    return chips >= additionalBet && (currentBet + additionalBet) > 0;
  }

  static canDoubleDown(playerHand: Hand, chips: number, currentBet: number): boolean {
    return (
      playerHand.cards.length === 2 &&
      chips >= currentBet &&
      currentBet > 0
    );
  }
}