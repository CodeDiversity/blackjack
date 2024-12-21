import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState } from '../types/game';
import { INITIAL_CHIPS } from '../utils/betUtils';
import { startNewHand, handleDealerTurn, handleHit, handleDoubleDown } from './gameThunks';
import { calculateHandScore } from '../utils/deckUtils';

const initialState: GameState = {
  playerHand: {
    cards: [],
    score: 0,
    isBusted: false
  },
  dealerHand: {
    cards: [],
    score: 0,
    isBusted: false
  },
  deck: [],
  gameStatus: 'betting',
  message: 'Place your bet!',
  chips: INITIAL_CHIPS,
  currentBet: 0,
  previousBet: 0,
  revealIndex: 0,
  bettingHistory: []
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    placeBet: (state, action: PayloadAction<number>) => {
      if (state.gameStatus !== 'betting' || state.chips < action.payload) return;
      state.chips -= action.payload;
      state.currentBet += action.payload;
    },
    startNewGame: (state) => {
      state.gameStatus = 'betting';
      state.message = 'Place your bet!';
      state.playerHand = { cards: [], score: 0, isBusted: false };
      state.dealerHand = { cards: [], score: 0, isBusted: false };
      state.currentBet = 0;
      state.revealIndex = -1;
    },
    resetGame: (state) => {
      localStorage.removeItem('blackjack-state');
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startNewHand.pending, (state) => {
        state.gameStatus = 'dealing';
        state.message = 'Dealing cards...';
        state.playerHand = { cards: [], score: 0, isBusted: false };
        state.dealerHand = { cards: [], score: 0, isBusted: false };
        state.revealIndex = -1;
      })
      .addCase(startNewHand.fulfilled, (state, action) => {
        if (!action.payload) return;
        const { currentDeck, playerCards, dealerCards, previousBet } = action.payload;
        
        state.deck = currentDeck;
        state.playerHand = {
          cards: playerCards,
          score: calculateHandScore(playerCards),
          isBusted: false
        };
        state.dealerHand = {
          cards: dealerCards,
          score: calculateHandScore(dealerCards),
          isBusted: false
        };
        state.gameStatus = 'playing';
        state.message = 'Your turn!';
        state.revealIndex = 1;
        state.previousBet = previousBet;
      })
      .addCase(handleHit.fulfilled, (state, action) => {
        if (!action.payload) return;
        const { newDeck, newCards, score, isBusted } = action.payload;
        
        state.deck = newDeck;
        state.playerHand = {
          cards: newCards,
          score,
          isBusted
        };

        if (isBusted) {
          state.gameStatus = 'finished';
          state.message = 'Bust! Dealer wins!';
          state.currentBet = 0;
          state.bettingHistory = [
            {
              amount: state.currentBet,
              won: false,
              timestamp: new Date()
            },
            ...state.bettingHistory
          ].slice(0, 5);
        }
      })
      .addCase(handleDealerTurn.pending, (state) => {
        state.gameStatus = 'dealerTurn';
        state.message = "Dealer's turn...";
      })
      .addCase(handleDealerTurn.fulfilled, (state, action) => {
        if (!action.payload) return;
        const { dealerResults, currentDeck, winnings, isBusted } = action.payload;
        
        state.deck = currentDeck;
        state.dealerHand = dealerResults[dealerResults.length - 1];
        state.gameStatus = 'finished';
        state.message = winnings.message;
        state.chips += winnings.amount;
        state.currentBet = 0;
        state.bettingHistory = [
          {
            amount: state.currentBet,
            won: winnings.amount > state.currentBet,
            timestamp: new Date()
          },
          ...state.bettingHistory
        ].slice(0, 5);
      })
      .addCase(handleDoubleDown.fulfilled, (state, action) => {
        if (!action.payload) return;
        const { newDeck, newCards, score, isBusted, newBet, additionalBet } = action.payload;
        
        state.deck = newDeck;
        state.chips -= additionalBet;
        state.currentBet = newBet;
        state.playerHand = {
          cards: newCards,
          score,
          isBusted
        };

        if (isBusted) {
          state.gameStatus = 'finished';
          state.message = 'Bust! Dealer wins!';
          state.currentBet = 0;
          state.bettingHistory = [
            {
              amount: newBet,
              won: false,
              timestamp: new Date()
            },
            ...state.bettingHistory
          ].slice(0, 5);
        } else {
          state.gameStatus = 'dealerTurn';
          state.message = "Dealer's turn...";
        }
      });
  }
});

export const { placeBet, startNewGame, resetGame } = gameSlice.actions;
export default gameSlice.reducer; 