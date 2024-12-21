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
  bettingHistory: [],
  stats: {
    totalWins: 0,
    totalLosses: 0,
    totalPushes: 0
  }
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
    setGameStatus: (state, action: PayloadAction<{ status: GameState['gameStatus']; message: string }>) => {
      state.gameStatus = action.payload.status;
      state.message = action.payload.message;
    },
    updateDealerHand: (state, action: PayloadAction<{ hand: Hand; message: string }>) => {
      state.dealerHand = action.payload.hand;
      state.message = action.payload.message;
      state.revealIndex = state.dealerHand.cards.length;
    },
    transitionToBetting: (state) => {
      console.log('Transitioning state:', {
        current: state.gameStatus,
        next: state.nextGameStatus,
        nextMessage: state.nextMessage
      });
      if (state.nextGameStatus) {
        state.gameStatus = state.nextGameStatus;
        state.message = state.nextMessage || 'Place your bet!';
        state.nextGameStatus = undefined;
        state.nextMessage = undefined;
        state.playerHand = { cards: [], score: 0, isBusted: false };
        state.dealerHand = { cards: [], score: 0, isBusted: false };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(startNewHand.pending, (state) => {
        console.log('Dealing pending...');
        state.gameStatus = 'dealing';
        state.message = 'Dealing cards...';
        state.playerHand = { cards: [], score: 0, isBusted: false };
        state.dealerHand = { cards: [], score: 0, isBusted: false };
        state.revealIndex = -1;
      })
      .addCase(startNewHand.fulfilled, (state, action) => {
        console.log('Dealing fulfilled:', action.payload);
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
        console.log("Dealer's turn...");
        state.revealIndex = state.dealerHand.cards.length - 1;
      })
      .addCase(handleDealerTurn.fulfilled, (state, action) => {
        if (!action.payload) return;
        const { dealerResults, currentDeck, winnings, finalScore } = action.payload;
        
        const betAmount = state.currentBet;
        
        if (winnings.amount > betAmount) {
          state.stats.totalWins++;
        } else if (winnings.amount === betAmount) {
          state.stats.totalPushes++;
        } else {
          state.stats.totalLosses++;
        }

        state.deck = currentDeck;
        state.dealerHand = dealerResults[dealerResults.length - 1];
        state.revealIndex = state.dealerHand.cards.length - 1;
        state.gameStatus = 'finished';
        state.message = winnings.message + ` (Dealer: ${finalScore})`;
        state.chips += winnings.amount;
        state.currentBet = 0;
        state.bettingHistory = [
          {
            amount: betAmount,
            won: winnings.amount > betAmount,
            timestamp: new Date()
          },
          ...state.bettingHistory
        ].slice(0, 5);

        state.nextGameStatus = 'betting';
        state.nextMessage = 'Place your bet!';
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

export const { placeBet, startNewGame, resetGame, setGameStatus, updateDealerHand, transitionToBetting } = gameSlice.actions;
export default gameSlice.reducer; 