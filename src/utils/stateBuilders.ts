import { GameStatus, GameMessage, Hand, Card } from '../types/game';
import { calculateHandScore, createNewDeck } from './deckUtils';

export interface StateUpdate {
  gameStatus?: GameStatus;
  message?: string;
  playerHand?: Hand;
  dealerHand?: Hand;
  deck?: Card[];
  revealIndex?: number;
  showConfetti?: boolean;
  nextGameStatus?: GameStatus;
  nextMessage?: string;
}

export class StateBuilders {
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

  static buildDealerTurnState(revealIndex?: number): StateUpdate {
    return {
      gameStatus: GameStatus.DealerTurn,
      message: GameMessage.DealerTurn,
      revealIndex: revealIndex ?? -1
    };
  }

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