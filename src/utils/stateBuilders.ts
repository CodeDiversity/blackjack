import { GameStatus, GameMessage, Hand, Card } from '../types/game';
import { calculateHandScore, createNewDeck } from './deckUtils';

/**
 * Partial game state update object used for immutable state management.
 */
export interface StateUpdate {
  /** Updated game status */
  gameStatus?: GameStatus;
  /** Updated message to display */
  message?: string;
  /** Updated player hand */
  playerHand?: Hand;
  /** Updated dealer hand */
  dealerHand?: Hand;
  /** Updated deck */
  deck?: Card[];
  /** Updated reveal index for dealer cards */
  revealIndex?: number;
  /** Whether to show confetti animation */
  showConfetti?: boolean;
  /** Next game status for transitions */
  nextGameStatus?: GameStatus;
  /** Next message for transitions */
  nextMessage?: string;
}

/**
 * Utility class for building game state updates in a consistent manner.
 * All methods return partial state objects that can be merged with existing state.
 */
export class StateBuilders {
  /**
   * Creates a state update for the dealing phase.
   * @returns State update with dealing status and empty hands
   */
  static buildDealingState(): StateUpdate {
    return {
      gameStatus: GameStatus.Dealing,
      message: GameMessage.DealingCards,
      playerHand: { cards: [], score: 0, isBusted: false },
      dealerHand: { cards: [], score: 0, isBusted: false },
      revealIndex: -1,
      showConfetti: false
    };
  }

  /**
   * Creates a state update for the playing phase after cards are dealt.
   * @param playerCards - Cards dealt to the player
   * @param dealerCards - Cards dealt to the dealer
   * @param deck - Remaining deck after dealing
   * @returns State update with playing status and populated hands
   */
  static buildPlayingState(
    playerCards: Card[],
    dealerCards: Card[],
    deck: Card[]
  ): StateUpdate {
    return {
      gameStatus: GameStatus.Playing,
      message: GameMessage.YourTurn,
      playerHand: {
        cards: playerCards,
        score: calculateHandScore(playerCards),
        isBusted: false
      },
      dealerHand: {
        cards: dealerCards,
        score: calculateHandScore(dealerCards),
        isBusted: false
      },
      deck,
      revealIndex: 1
    };
  }

  /**
   * Creates a state update after the player hits.
   * @param newCards - Player's updated cards after hitting
   * @param newDeck - Remaining deck after dealing the hit card
   * @param isBusted - Whether the player has busted
   * @returns State update with new player hand and appropriate message
   */
  static buildPlayerHitState(
    newCards: Card[],
    newDeck: Card[],
    isBusted: boolean
  ): StateUpdate {
    const score = calculateHandScore(newCards);
    
    return {
      playerHand: {
        cards: newCards,
        score,
        isBusted
      },
      deck: newDeck,
      message: isBusted ? GameMessage.PlayerBust : GameMessage.YourTurn
    };
  }

  /**
   * Creates a state update for the dealer's turn.
   * @param revealIndex - Optional index of the last revealed dealer card
   * @returns State update with dealer turn status
   */
  static buildDealerTurnState(revealIndex?: number): StateUpdate {
    return {
      gameStatus: GameStatus.DealerTurn,
      message: GameMessage.DealerTurn,
      revealIndex: revealIndex ?? -1
    };
  }

  /**
   * Creates a state update after the player doubles down.
   * @param newCards - Player's updated cards after doubling down
   * @param newDeck - Remaining deck after dealing the double down card
   * @param isBusted - Whether the player has busted
   * @returns State update with new player hand and appropriate game status
   */
  static buildDoubleDownState(
    newCards: Card[],
    newDeck: Card[],
    isBusted: boolean
  ): StateUpdate {
    const score = calculateHandScore(newCards);
    
    const baseState: StateUpdate = {
      playerHand: {
        cards: newCards,
        score,
        isBusted
      },
      deck: newDeck
    };

    if (isBusted) {
      return {
        ...baseState,
        gameStatus: GameStatus.Finished,
        message: GameMessage.PlayerBust,
        nextGameStatus: GameStatus.Betting,
        nextMessage: GameMessage.PlaceBet
      };
    } else {
      return {
        ...baseState,
        gameStatus: GameStatus.DealerTurn,
        message: GameMessage.DealerTurn
      };
    }
  }

  /**
   * Creates a state update for starting a new game.
   * @returns State update with fresh game state
   */
  static buildNewGameState(): StateUpdate {
    return {
      gameStatus: GameStatus.Betting,
      message: GameMessage.PlaceBet,
      playerHand: { cards: [], score: 0, isBusted: false },
      dealerHand: { cards: [], score: 0, isBusted: false },
      deck: createNewDeck(),
      revealIndex: -1,
      showConfetti: false
    };
  }

  /**
   * Creates a state update for transitioning to a new game status.
   * @param nextStatus - The next game status to transition to
   * @param nextMessage - The message to display in the next status
   * @returns State update with transition data
   */
  static buildTransitionState(
    nextStatus: GameStatus,
    nextMessage: string
  ): StateUpdate {
    return {
      gameStatus: nextStatus,
      message: nextMessage,
      playerHand: { cards: [], score: 0, isBusted: false },
      dealerHand: { cards: [], score: 0, isBusted: false },
      showConfetti: false,
      nextGameStatus: undefined,
      nextMessage: undefined
    };
  }

  /**
   * Merges two state updates, only including properties that have actually changed.
   * @param currentState - The current state to compare against
   * @param update - The new state update to merge
   * @returns A merged state update containing only changed properties
   */
  static mergeStateUpdate(currentState: StateUpdate, update: StateUpdate): StateUpdate {
    const merged: StateUpdate = {};
    
    // Only include properties that have changed
    Object.keys(update).forEach(key => {
      const typedKey = key as keyof StateUpdate;
      const newValue = update[typedKey];
      
      if (newValue !== undefined && newValue !== currentState[typedKey]) {
        (merged as Record<string, unknown>)[typedKey] = newValue;
      }
    });
    
    return merged;
  }
}