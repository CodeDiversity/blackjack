import { createAction } from '@reduxjs/toolkit';
import { Hand, Card } from '../types/game';
import { GameResult } from '../services/gameFlowService';

/**
 * Redux action creators for blackjack game state management.
 * These actions are dispatched to update the game state in a predictable way.
 */
export const gameActions = {
  // Game flow actions
  /** Initiates the card dealing process */
  startDealing: createAction('game/startDealing'),
  
  /** 
   * Action dispatched when cards have been dealt to both player and dealer
   * @param payload - Contains dealt cards and remaining deck
   */
  cardsDealt: createAction<{
    playerCards: Card[];
    dealerCards: Card[];
    deck: Card[];
    previousBet: number;
  }>('game/cardsDealt'),
  
  // Player actions
  /** 
   * Action dispatched when player hits (requests another card)
   * @param payload - Contains new cards, updated deck, and bust status
   */
  playerHit: createAction<{
    newCards: Card[];
    newDeck: Card[];
    isBusted: boolean;
  }>('game/playerHit'),
  
  /** Action dispatched when player stands (ends their turn) */
  playerStand: createAction('game/playerStand'),
  
  /** 
   * Action dispatched when player doubles down
   * @param payload - Contains new cards, deck, bet amounts, and bust status
   */
  playerDoubleDown: createAction<{
    newCards: Card[];
    newDeck: Card[];
    newBet: number;
    additionalBet: number;
    isBusted: boolean;
  }>('game/playerDoubleDown'),
  
  // Dealer actions
  /** Action dispatched when dealer's turn begins */
  dealerTurnStart: createAction('game/dealerTurnStart'),
  
  /** 
   * Action dispatched when dealer hits (takes another card)
   * @param payload - Contains dealer's new hand and updated deck
   */
  dealerHit: createAction<{
    newHand: Hand;
    newDeck: Card[];
  }>('game/dealerHit'),
  
  // Game end
  /** 
   * Action dispatched when the game round ends
   * @param payload - Contains game result, final hands, and deck
   */
  gameEnd: createAction<{
    result: GameResult;
    finalDealerHand: Hand;
    finalDeck: Card[];
  }>('game/gameEnd'),
  
  // Betting actions
  /** 
   * Action dispatched when a bet is placed
   * @param payload - The bet amount
   */
  betPlaced: createAction<number>('game/betPlaced'),
  
  /** Action dispatched when the current bet is cleared */
  betCleared: createAction('game/betCleared'),
  
  /** 
   * Action dispatched when the previous bet amount is re-used
   * @param payload - The previous bet amount
   */
  previousBetPlaced: createAction<number>('game/previousBetPlaced'),
  
  // Utility actions
  /** 
   * Action dispatched to reveal a dealer card
   * @param payload - Index of the card to reveal
   */
  revealCard: createAction<number>('game/revealCard'),
  
  /** Action dispatched when a state transition is complete */
  transitionComplete: createAction('game/transitionComplete'),
  
  /** Action dispatched when confetti animation is shown */
  confettiShown: createAction('game/confettiShown'),
  
  // Reset actions
  /** Action dispatched to start a new game */
  newGameStarted: createAction('game/newGameStarted'),
  
  /** Action dispatched to reset the entire game state */
  gameReset: createAction('game/gameReset')
};

/**
 * Union type of all possible game actions for type safety in reducers.
 */
export type GameAction = 
  | ReturnType<typeof gameActions.startDealing>
  | ReturnType<typeof gameActions.cardsDealt>
  | ReturnType<typeof gameActions.playerHit>
  | ReturnType<typeof gameActions.playerStand>
  | ReturnType<typeof gameActions.playerDoubleDown>
  | ReturnType<typeof gameActions.dealerTurnStart>
  | ReturnType<typeof gameActions.dealerHit>
  | ReturnType<typeof gameActions.gameEnd>
  | ReturnType<typeof gameActions.betPlaced>
  | ReturnType<typeof gameActions.betCleared>
  | ReturnType<typeof gameActions.previousBetPlaced>
  | ReturnType<typeof gameActions.revealCard>
  | ReturnType<typeof gameActions.transitionComplete>
  | ReturnType<typeof gameActions.confettiShown>
  | ReturnType<typeof gameActions.newGameStarted>
  | ReturnType<typeof gameActions.gameReset>;

/**
 * Helper functions for creating common action payloads with proper typing.
 * These provide a more convenient API for dispatching actions.
 */
export const actionCreators = {
  /**
   * Creates an action for when cards are dealt to start a round.
   * @param playerCards - Cards dealt to the player
   * @param dealerCards - Cards dealt to the dealer
   * @param deck - Remaining deck after dealing
   * @param previousBet - The previous bet amount
   * @returns A cardsDealt action
   */
  createDealResult: (
    playerCards: Card[],
    dealerCards: Card[],
    deck: Card[],
    previousBet: number
  ) => gameActions.cardsDealt({
    playerCards,
    dealerCards,
    deck,
    previousBet
  }),
  
  /**
   * Creates an action for when the player hits.
   * @param newCards - Player's cards after hitting
   * @param newDeck - Remaining deck after dealing
   * @param isBusted - Whether the player busted
   * @returns A playerHit action
   */
  createHitResult: (
    newCards: Card[],
    newDeck: Card[],
    isBusted: boolean
  ) => gameActions.playerHit({
    newCards,
    newDeck,
    isBusted
  }),
  
  /**
   * Creates an action for when the player doubles down.
   * @param newCards - Player's cards after doubling down
   * @param newDeck - Remaining deck after dealing
   * @param newBet - The total bet amount after doubling
   * @param additionalBet - The additional bet amount
   * @param isBusted - Whether the player busted
   * @returns A playerDoubleDown action
   */
  createDoubleDownResult: (
    newCards: Card[],
    newDeck: Card[],
    newBet: number,
    additionalBet: number,
    isBusted: boolean
  ) => gameActions.playerDoubleDown({
    newCards,
    newDeck,
    newBet,
    additionalBet,
    isBusted
  }),
  
  /**
   * Creates an action for when the game ends.
   * @param result - The game result with winnings and outcome
   * @param finalDealerHand - The dealer's final hand
   * @param finalDeck - The remaining deck
   * @returns A gameEnd action
   */
  createGameEndResult: (
    result: GameResult,
    finalDealerHand: Hand,
    finalDeck: Card[]
  ) => gameActions.gameEnd({
    result,
    finalDealerHand,
    finalDeck
  })
};