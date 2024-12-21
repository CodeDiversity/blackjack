import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import { createDeck, calculateHandScore } from '../utils/deckUtils';
import { calculateWinnings } from '../utils/betUtils';
import { Card } from '../types/game';
import { placeBet } from './gameSlice';

const MIN_CARDS_BEFORE_SHUFFLE = 10;

const needsNewDeck = (deck: Card[]) => {
  return deck.length < MIN_CARDS_BEFORE_SHUFFLE;
};

export const startNewHand = createAsyncThunk(
  'game/startNewHand',
  async (_, { getState }) => {
    const state = getState() as RootState;
    if (state.game.currentBet === 0) return null;

    const currentDeck = needsNewDeck(state.game.deck) ? createDeck() : state.game.deck;
    const playerCards = [currentDeck.pop()!, currentDeck.pop()!];
    const dealerCards = [currentDeck.pop()!, currentDeck.pop()!];

    // Return all the data needed for the reducer
    return {
      currentDeck,
      playerCards,
      dealerCards,
      previousBet: state.game.currentBet
    };
  }
);

export const handleDealerTurn = createAsyncThunk(
  'game/dealerTurn',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const currentDeck = [...state.game.deck];
    const dealerCards = [...state.game.dealerHand.cards];
    const dealerScore = calculateHandScore(dealerCards);
    const results = [];

    while (dealerScore < 17) {
      const newCard = currentDeck.pop()!;
      dealerCards.push(newCard);
      results.push({
        cards: [...dealerCards],
        score: calculateHandScore(dealerCards),
        isBusted: calculateHandScore(dealerCards) > 21
      });
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const finalScore = calculateHandScore(dealerCards);
    const isBusted = finalScore > 21;

    const winnings = calculateWinnings(
      finalScore,
      state.game.playerHand.score,
      state.game.currentBet,
      isBusted
    );

    return {
      dealerResults: results,
      currentDeck,
      winnings,
      isBusted
    };
  }
);

export const placePreviousBet = createAsyncThunk(
  'game/placePreviousBet',
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (
      state.game.previousBet === 0 || 
      state.game.chips < state.game.previousBet ||
      state.game.currentBet > 0
    ) return null;

    // Place the bet first
    dispatch(placeBet(state.game.previousBet));
    // Then start new hand
    return dispatch(startNewHand()).unwrap();
  }
);

export const handleHit = createAsyncThunk(
  'game/hit',
  async (_, { getState }) => {
    const state = getState() as RootState;
    if (state.game.gameStatus !== 'playing') return null;

    const newDeck = [...state.game.deck];
    const newCard = newDeck.pop()!;
    const newCards = [...state.game.playerHand.cards, newCard];
    const score = calculateHandScore(newCards);
    const isBusted = score > 21;

    return {
      newDeck,
      newCards,
      score,
      isBusted
    };
  }
);

export const handleDoubleDown = createAsyncThunk(
  'game/doubleDown',
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (
      state.game.gameStatus !== 'playing' || 
      state.game.chips < state.game.currentBet || 
      state.game.playerHand.cards.length > 2
    ) return null;

    // Double the bet
    const newBet = state.game.currentBet * 2;
    const newDeck = [...state.game.deck];
    const newCard = newDeck.pop()!;
    const newCards = [...state.game.playerHand.cards, newCard];
    const score = calculateHandScore(newCards);
    const isBusted = score > 21;

    return {
      newDeck,
      newCards,
      score,
      isBusted,
      newBet,
      additionalBet: state.game.currentBet
    };
  }
);

export const handleStand = createAsyncThunk(
  'game/stand',
  async (_, { dispatch }) => {
    // First update game status
    dispatch(setGameStatus({ status: 'dealerTurn', message: "Dealer's turn..." }));
    // Then start dealer's turn
    return dispatch(handleDealerTurn()).unwrap();
  }
);

// Add action for setting game status
export const setGameStatus = createSlice({
  name: 'game/status',
  initialState: null,
  reducers: {
    setStatus: (state, action: PayloadAction<{ status: GameState['gameStatus']; message: string }>) => {
      state.gameStatus = action.payload.status;
      state.message = action.payload.message;
    }
  }
}).actions; 