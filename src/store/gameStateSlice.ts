import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameStatus, GameMessage, Hand, Card } from '../types/game';
import { StateBuilders, StateUpdate } from '../utils/stateBuilders';
import { startNewHand, handleHit, handleDealerTurn, handleDoubleDown, handleBustAnimation } from './gameThunks';
import { calculateHandScore, createNewDeck } from '../utils/deckUtils';

// Core game state (hands, deck, status, message)
export interface CoreGameState {
  playerHand: Hand;
  dealerHand: Hand;
  deck: Card[];
  gameStatus: GameStatus;
  message: string;
  revealIndex: number;
  nextGameStatus?: GameStatus;
  nextMessage?: string;
  showConfetti: boolean;
}

const initialCoreState: CoreGameState = {
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
  deck: createNewDeck(),
  gameStatus: GameStatus.Betting,
  message: GameMessage.PlaceBet,
  revealIndex: 0,
  showConfetti: false
};

const gameStateSlice = createSlice({
  name: 'gameState',
  initialState: initialCoreState,
  reducers: {
    updateGameState: (state, action: PayloadAction<StateUpdate>) => {
      // Apply state update using builders
      Object.assign(state, action.payload);
    },
    
    setGameStatus: (state, action: PayloadAction<{ status: GameStatus; message: string }>) => {
      state.gameStatus = action.payload.status;
      state.message = action.payload.message;
    },
    
    updatePlayerHand: (state, action: PayloadAction<Hand>) => {
      state.playerHand = action.payload;
    },
    
    updateDealerHand: (state, action: PayloadAction<{ hand: Hand; message: string }>) => {
      state.dealerHand = action.payload.hand;
      state.message = action.payload.message;
      state.revealIndex = state.dealerHand.cards.length;
    },
    
    setRevealIndex: (state, action: PayloadAction<number>) => {
      state.revealIndex = action.payload;
    },
    
    startNewGame: (state) => {
      Object.assign(state, StateBuilders.buildNewGameState());
    },
    
    transitionToBetting: (state) => {
      if (state.nextGameStatus) {
        const transition = StateBuilders.buildTransitionState(
          state.nextGameStatus,
          state.nextMessage ?? GameMessage.PlaceBet
        );
        Object.assign(state, transition);
      }
    },
    
    setShowConfetti: (state, action: PayloadAction<boolean>) => {
      state.showConfetti = action.payload;
    },
    
    clearNextTransition: (state) => {
      state.nextGameStatus = undefined;
      state.nextMessage = undefined;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(startNewHand.pending, (state) => {
        state.gameStatus = GameStatus.Dealing;
        state.message = GameMessage.DealingCards;
        state.playerHand = { cards: [], score: 0, isBusted: false };
        state.dealerHand = { cards: [], score: 0, isBusted: false };
        state.revealIndex = -1;
      })
      .addCase(startNewHand.fulfilled, (state, action) => {
        if (!action.payload) return;

        const { currentDeck, playerCards, dealerCards } = action.payload;

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
      })
      .addCase(startNewHand.rejected, (state) => {
        state.gameStatus = GameStatus.Betting;
        state.message = 'Error dealing cards. Try again.';
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
          state.gameStatus = GameStatus.Finished;
          state.message = GameMessage.PlayerBust;
          state.nextGameStatus = GameStatus.Betting;
          state.nextMessage = GameMessage.PlaceBet;
        }
      })
      .addCase(handleDoubleDown.fulfilled, (state, action) => {
        if (!action.payload) return;
        const { newDeck, newCards, score, isBusted } = action.payload;

        state.deck = newDeck;
        state.playerHand = {
          cards: newCards,
          score,
          isBusted
        };

        if (isBusted) {
          state.gameStatus = GameStatus.Finished;
          state.message = GameMessage.PlayerBust;
          state.nextGameStatus = GameStatus.Betting;
          state.nextMessage = GameMessage.PlaceBet;
        } else {
          state.gameStatus = GameStatus.DealerTurn;
          state.message = GameMessage.DealerTurn;
        }
      })
      .addCase(handleDealerTurn.pending, (state) => {
        state.gameStatus = GameStatus.DealerTurn;
        state.message = GameMessage.DealerTurn;
        state.revealIndex = state.dealerHand.cards.length - 1;
      })
      .addCase(handleDealerTurn.fulfilled, (state, action) => {
        if (!action.payload) return;
        const { dealerResults, currentDeck, result } = action.payload;

        state.deck = currentDeck;
        state.dealerHand = dealerResults[dealerResults.length - 1];
        state.revealIndex = state.dealerHand.cards.length - 1;
        state.gameStatus = GameStatus.Finished;
        state.message = `${result.message} (Dealer: ${result.dealerScore})`;
        state.showConfetti = result.winnings > 0;
        state.nextGameStatus = GameStatus.Betting;
        state.nextMessage = GameMessage.PlaceBet;
      })
      .addCase(handleBustAnimation.fulfilled, (state) => {
        state.gameStatus = GameStatus.Finished;
        state.nextGameStatus = GameStatus.Betting;
        state.nextMessage = GameMessage.PlaceBet;
      });
  }
});

export const {
  updateGameState,
  setGameStatus,
  updatePlayerHand,
  updateDealerHand,
  setRevealIndex,
  startNewGame,
  transitionToBetting,
  setShowConfetti,
  clearNextTransition
} = gameStateSlice.actions;

export default gameStateSlice.reducer;