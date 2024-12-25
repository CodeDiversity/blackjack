import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState, GameStatus, GameMessage, Hand } from '../types/game';
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
  gameStatus: GameStatus.Betting,
  message: GameMessage.PlaceBet,
  chips: INITIAL_CHIPS,
  currentBet: 0,
  previousBet: 0,
  revealIndex: 0,
  bettingHistory: [],
  stats: {
    totalWins: 0,
    totalLosses: 0,
    totalPushes: 0
  },
  showConfetti: false
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    placeBet: (state, action: PayloadAction<number>) => {
      if (state.gameStatus !== GameStatus.Betting || state.chips < action.payload) return;
      state.chips -= action.payload;
      state.currentBet += action.payload;
    },
    startNewGame: (state) => {
      state.gameStatus = GameStatus.Betting;
      state.message = GameMessage.PlaceBet;
      state.playerHand = { cards: [], score: 0, isBusted: false };
      state.dealerHand = { cards: [], score: 0, isBusted: false };
      state.currentBet = 0;
      state.revealIndex = -1;
    },
    resetGame: () => {
      localStorage.removeItem('blackjack-state');
      return initialState;
    },
    setGameStatus: (state, action: PayloadAction<{ status: GameStatus; message: string }>) => {
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
        state.message = state.nextMessage ?? GameMessage.PlaceBet;
        state.nextGameStatus = undefined;
        state.nextMessage = undefined;
        state.playerHand = { cards: [], score: 0, isBusted: false };
        state.dealerHand = { cards: [], score: 0, isBusted: false };
        state.showConfetti = false;
      }
    },
    clearBet: (state) => {
      state.chips += state.currentBet;
      state.currentBet = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(startNewHand.pending, (state) => {
        console.log('Dealing pending...');
        state.gameStatus = GameStatus.Dealing;
        state.message = GameMessage.DealingCards;
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
        state.gameStatus = GameStatus.Playing;
        state.message = GameMessage.YourTurn;
        state.revealIndex = 1;
        state.previousBet = previousBet;
      })
      .addCase(handleHit.fulfilled, (state, action) => {
        if (!action.payload) return;
        const { newDeck, newCards, score, isBusted, betAmount, waitForAnimation } = action.payload;

        state.deck = newDeck;
        state.playerHand = {
          cards: newCards,
          score,
          isBusted,
          waitForAnimation
        };

        if (isBusted) {
          state.gameStatus = GameStatus.Finished;
          state.message = GameMessage.PlayerBust;
          state.bettingHistory = [
            {
              amount: betAmount,
              won: false,
              timestamp: new Date()
            },
            ...state.bettingHistory
          ].slice(0, 5);
          state.currentBet = 0;
          state.nextGameStatus = GameStatus.Betting;
          state.nextMessage = GameMessage.PlaceBet;
          state.stats.totalLosses++;
          return;
        }
      })
      .addCase(handleDealerTurn.pending, (state) => {
        state.gameStatus = GameStatus.DealerTurn;
        state.message = GameMessage.DealerTurn;
        console.log("Dealer's turn...");
        state.revealIndex = state.dealerHand.cards.length - 1;
      })
      .addCase(handleDealerTurn.fulfilled, (state, action) => {
        if (!action.payload) return;
        const { dealerResults, currentDeck, winnings, finalScore } = action.payload;

        const betAmount = state.currentBet;

        if (winnings.amount > betAmount) {
          state.stats.totalWins++;
          state.showConfetti = true;
        } else if (winnings.amount === betAmount) {
          state.stats.totalPushes++;
        } else {
          state.stats.totalLosses++;
        }

        state.deck = currentDeck;
        state.dealerHand = dealerResults[dealerResults.length - 1];
        state.revealIndex = state.dealerHand.cards.length - 1;
        state.gameStatus = GameStatus.Finished;
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

        state.nextGameStatus = GameStatus.Betting;
        state.nextMessage = GameMessage.PlaceBet;
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
          state.gameStatus = GameStatus.Finished;
          state.message = GameMessage.PlayerBust;
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
          state.gameStatus = GameStatus.DealerTurn;
          state.message = GameMessage.DealerTurn;
        }
      });
  }
});

export const { placeBet, startNewGame, resetGame, setGameStatus, updateDealerHand, transitionToBetting, clearBet } = gameSlice.actions;
export default gameSlice.reducer; 