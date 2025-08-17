import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from './store';
import { finalizeBet, doubleDown as doubleBet, addWinnings, placePreviousBet as placePreviousBetAction } from './bettingSlice';
import { recordGameResult } from './statisticsSlice';
import { updateGameState } from './gameStateSlice';
import { StateBuilders } from '../utils/stateBuilders';
import { GameFlowService, GameResult } from '../services/gameFlowService';
import { createNewDeck, dealCard, calculateHandScore } from '../utils/deckUtils';
import { Hand, Card, GameStatus } from '../types/game';

// Start a new hand - deal initial cards
export const startNewHand = createAsyncThunk<
  {
    currentDeck: Card[];
    playerCards: Card[];
    dealerCards: Card[];
    previousBet: number;
  } | null,
  void,
  { state: RootState }
>('newGame/startNewHand', async (_, { getState }) => {
  const state = getState();
  
  // Allow dealing if status is Betting or already Dealing (for retry)
  if (![GameStatus.Betting, GameStatus.Dealing].includes(state.gameState.gameStatus) || state.betting.currentBet <= 0) {
    return null;
  }

  // Create and shuffle deck
  let currentDeck = createNewDeck();
  
  // Deal initial cards
  const playerCards: Card[] = [];
  const dealerCards: Card[] = [];
  
  // Deal 2 cards to player, 2 to dealer (alternating)
  for (let i = 0; i < 2; i++) {
    const [playerCard, deckAfterPlayer] = dealCard(currentDeck);
    playerCards.push(playerCard);
    currentDeck = deckAfterPlayer;
    
    const [dealerCard, deckAfterDealer] = dealCard(currentDeck);
    dealerCards.push(dealerCard);
    currentDeck = deckAfterDealer;
  }

  const previousBet = state.betting.currentBet;

  return {
    currentDeck,
    playerCards,
    dealerCards,
    previousBet
  };
});

// Handle player hit
export const handleHit = createAsyncThunk<
  {
    newDeck: Card[];
    newCards: Card[];
    score: number;
    isBusted: boolean;
    shouldStartDealerTurn: boolean;
  } | null,
  void,
  { state: RootState }
>('newGame/handleHit', async (_, { getState, dispatch }) => {
  const state = getState();
  
  if (state.gameState.gameStatus !== GameStatus.Playing) {
    return null;
  }

  const [newCard, newDeck] = dealCard(state.gameState.deck);
  const newCards = [...state.gameState.playerHand.cards, newCard];
  const score = calculateHandScore(newCards);
  const isBusted = score > 21;
  
  // If player busts, handle the loss immediately
  if (isBusted) {
    console.log('Player busted, calling handlePlayerBust');
    dispatch(handlePlayerBust()).unwrap().catch(() => {});
  }
  
  return {
    newDeck,
    newCards,
    score,
    isBusted,
    shouldStartDealerTurn: score === 21
  };
});

// Handle player stand
export const handleStand = createAsyncThunk<
  void,
  void,
  { state: RootState }
>('newGame/handleStand', async (_, { dispatch }) => {
  dispatch(updateGameState(StateBuilders.buildDealerTurnState()));
  await dispatch(handleDealerTurn()).unwrap();
});

// Handle double down
export const handleDoubleDown = createAsyncThunk<
  {
    newDeck: Card[];
    newCards: Card[];
    score: number;
    isBusted: boolean;
    newBet: number;
    additionalBet: number;
  } | null,
  void,
  { state: RootState }
>('newGame/handleDoubleDown', async (_, { getState, dispatch }) => {
  const state = getState();
  
  if (!GameFlowService.canDoubleDown(
    state.gameState.playerHand,
    state.betting.chips,
    state.betting.currentBet
  )) {
    return null;
  }

  const additionalBet = state.betting.currentBet;
  
  // Update betting state
  dispatch(doubleBet());
  
  // Deal one card
  const [newCard, newDeck] = dealCard(state.gameState.deck);
  const newCards = [...state.gameState.playerHand.cards, newCard];
  const score = calculateHandScore(newCards);
  const isBusted = score > 21;
  
  // If player busts, handle the loss immediately
  if (isBusted) {
    console.log('Player busted on double down, calling handlePlayerBust');
    dispatch(handlePlayerBust()).unwrap().catch(() => {});
  }
  
  return {
    newDeck,
    newCards,
    score,
    isBusted,
    newBet: additionalBet * 2,
    additionalBet
  };
});

// Handle dealer turn
export const handleDealerTurn = createAsyncThunk<
  {
    dealerResults: Hand[];
    currentDeck: Card[];
    result: GameResult;
  } | null,
  void,
  { state: RootState }
>('newGame/handleDealerTurn', async (_, { getState, dispatch }) => {
  const state = getState();
  
  let currentDeck = state.gameState.deck;
  let dealerHand = { ...state.gameState.dealerHand };
  const dealerResults: Hand[] = [dealerHand];
  
  // Dealer hits until 17 or higher
  while (GameFlowService.shouldDealerHit(dealerHand)) {
    const [newCard, newDeck] = dealCard(currentDeck);
    currentDeck = newDeck;
    
    dealerHand = {
      cards: [...dealerHand.cards, newCard],
      score: calculateHandScore([...dealerHand.cards, newCard]),
      isBusted: false
    };
    
    if (dealerHand.score > 21) {
      dealerHand.isBusted = true;
    }
    
    dealerResults.push({ ...dealerHand });
    
    // Add delay for animation
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Determine game result
  const result = GameFlowService.determineGameResult(
    state.gameState.playerHand,
    dealerHand,
    state.betting.currentBet
  );
  
  // Update betting state - finalize the bet and add winnings
  const betAmount = state.betting.currentBet;
  dispatch(finalizeBet({
    amount: betAmount,
    won: result.winnings > betAmount,
    timestamp: new Date()
  }));
  
  // Add winnings to chips
  dispatch(addWinnings(result.winnings));
  
  // Update statistics
  let gameResultType: 'win' | 'loss' | 'push';
  if (result.winnings > betAmount) {
    gameResultType = 'win';
  } else if (result.winnings === betAmount) {
    gameResultType = 'push';
  } else {
    gameResultType = 'loss';
  }
  
  
  dispatch(recordGameResult({
    result: gameResultType,
    amount: betAmount,
    winnings: result.winnings
  }));
  
  return {
    dealerResults,
    currentDeck,
    result
  };
});

// Place previous bet with multiplier
export const placePreviousBet = createAsyncThunk<
  void,
  number | undefined,
  { state: RootState }
>('newGame/placePreviousBet', async (multiplier, { getState, dispatch }) => {
  const actualMultiplier = multiplier ?? 1;
  const state = getState();
  const amount = state.betting.previousBet * actualMultiplier;
  
  if (state.betting.chips >= amount && state.betting.previousBet > 0) {
    dispatch(placePreviousBetAction(actualMultiplier));
  }
});

// Handle player bust
export const handlePlayerBust = createAsyncThunk<
  void,
  void,
  { state: RootState }
>('newGame/handlePlayerBust', async (_, { getState, dispatch }) => {
  const state = getState();
  const betAmount = state.betting.currentBet;
  
  console.log('handlePlayerBust called with betAmount:', betAmount);
  
  if (betAmount > 0) {
    // Record the loss
    dispatch(recordGameResult({
      result: 'loss',
      amount: betAmount,
      winnings: 0
    }));
    
    // Finalize the bet
    dispatch(finalizeBet({
      amount: betAmount,
      won: false,
      timestamp: new Date()
    }));
  }
});

// Handle bust animation (simplified)
export const handleBustAnimation = createAsyncThunk<
  { betAmount: number } | null,
  void,
  { state: RootState }
>('newGame/handleBustAnimation', async (_, { getState, dispatch }) => {
  const state = getState();
  const betAmount = state.betting.currentBet;
  
  if (betAmount > 0) {
    // Record the loss
    dispatch(recordGameResult({
      result: 'loss',
      amount: betAmount,
      winnings: 0
    }));
    
    // Finalize the bet
    dispatch(finalizeBet({
      amount: betAmount,
      won: false,
      timestamp: new Date()
    }));
    
    return { betAmount };
  }
  
  return null;
});