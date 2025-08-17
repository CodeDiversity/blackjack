import { createAction } from '@reduxjs/toolkit';
import { Hand, Card } from '../types/game';
import { GameResult } from '../services/gameFlowService';

// Normalized action creators for consistent state updates
export const gameActions = {
  // Game flow actions
  startDealing: createAction('game/startDealing'),
  cardsDealt: createAction<{
    playerCards: Card[];
    dealerCards: Card[];
    deck: Card[];
    previousBet: number;
  }>('game/cardsDealt'),
  
  // Player actions
  playerHit: createAction<{
    newCards: Card[];
    newDeck: Card[];
    isBusted: boolean;
  }>('game/playerHit'),
  
  playerStand: createAction('game/playerStand'),
  
  playerDoubleDown: createAction<{
    newCards: Card[];
    newDeck: Card[];
    newBet: number;
    additionalBet: number;
    isBusted: boolean;
  }>('game/playerDoubleDown'),
  
  // Dealer actions
  dealerTurnStart: createAction('game/dealerTurnStart'),
  dealerHit: createAction<{
    newHand: Hand;
    newDeck: Card[];
  }>('game/dealerHit'),
  
  // Game end
  gameEnd: createAction<{
    result: GameResult;
    finalDealerHand: Hand;
    finalDeck: Card[];
  }>('game/gameEnd'),
  
  // Betting actions
  betPlaced: createAction<number>('game/betPlaced'),
  betCleared: createAction('game/betCleared'),
  previousBetPlaced: createAction<number>('game/previousBetPlaced'),
  
  // Utility actions
  revealCard: createAction<number>('game/revealCard'),
  transitionComplete: createAction('game/transitionComplete'),
  confettiShown: createAction('game/confettiShown'),
  
  // Reset actions
  newGameStarted: createAction('game/newGameStarted'),
  gameReset: createAction('game/gameReset')
};

// Action type unions for better type safety
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

// Helper functions for creating common action payloads
export const actionCreators = {
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
  
  createHitResult: (
    newCards: Card[],
    newDeck: Card[],
    isBusted: boolean
  ) => gameActions.playerHit({
    newCards,
    newDeck,
    isBusted
  }),
  
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