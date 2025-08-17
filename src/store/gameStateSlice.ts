import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameStatus, GameMessage, Hand, Card } from '../types/game';
import { StateBuilders, StateUpdate } from '../utils/stateBuilders';
import { startNewHand, handleHit, handleDealerTurn, handleDoubleDown, handleBustAnimation } from './gameThunks';
import { calculateHandScore, createNewDeck } from '../utils/deckUtils';

/**
 * Core game state containing hands, deck, game status, and UI state.
 * This represents the essential blackjack game state without betting or statistics.
 */
export interface CoreGameState {
  /** The player's current hand */
  playerHand: Hand;
  /** The dealer's current hand */
  dealerHand: Hand;
  /** The remaining cards in the deck */
  deck: Card[];
  /** Current phase of the game */
  gameStatus: GameStatus;
  /** Current message to display to the user */
  message: string;
  /** Index of the last revealed dealer card */
  revealIndex: number;
  /** Next game status for transitions */
  nextGameStatus?: GameStatus;
  /** Next message for transitions */
  nextMessage?: string;
  /** Whether to show confetti animation */
  showConfetti: boolean;
}

/** Initial state for the core game state */
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

/**
 * Redux slice for managing core game state.
 * Handles game flow, card dealing, and player/dealer actions.
 */
const gameStateSlice = createSlice({
  name: 'gameState',
  initialState: initialCoreState,
  reducers: {
    /**
     * Applies a partial state update using the StateBuilders pattern.
     * @param state - Current state
     * @param action - Action containing the state update
     */
    updateGameState: (state, action: PayloadAction<StateUpdate>) => {
      // Apply state update using builders
      Object.assign(state, action.payload);
    },
    
    /**
     * Updates the game status and message.
     * @param state - Current state
     * @param action - Action containing status and message
     */
    setGameStatus: (state, action: PayloadAction<{ status: GameStatus; message: string }>) => {
      state.gameStatus = action.payload.status;
      state.message = action.payload.message;
    },
    
    /**
     * Updates the player's hand.
     * @param state - Current state
     * @param action - Action containing the new player hand
     */
    updatePlayerHand: (state, action: PayloadAction<Hand>) => {
      state.playerHand = action.payload;
    },
    
    /**
     * Updates the dealer's hand and reveals cards as needed.
     * @param state - Current state
     * @param action - Action containing the new dealer hand and message
     */
    updateDealerHand: (state, action: PayloadAction<{ hand: Hand; message: string }>) => {
      state.dealerHand = action.payload.hand;
      state.message = action.payload.message;
      state.revealIndex = state.dealerHand.cards.length;
    },
    
    /**
     * Sets the reveal index for dealer cards.
     * @param state - Current state
     * @param action - Action containing the reveal index
     */
    setRevealIndex: (state, action: PayloadAction<number>) => {
      state.revealIndex = action.payload;
    },
    
    /**
     * Resets the game to initial state for a new game.
     * @param state - Current state
     */
    startNewGame: (state) => {
      Object.assign(state, StateBuilders.buildNewGameState());
    },
    
    /**
     * Transitions to the betting phase if a next status is set.
     * @param state - Current state
     */
    transitionToBetting: (state) => {
      if (state.nextGameStatus) {
        const transition = StateBuilders.buildTransitionState(
          state.nextGameStatus,
          state.nextMessage ?? GameMessage.PlaceBet
        );
        Object.assign(state, transition);
      }
    },
    
    /**
     * Controls the confetti animation visibility.
     * @param state - Current state
     * @param action - Action containing whether to show confetti
     */
    setShowConfetti: (state, action: PayloadAction<boolean>) => {
      state.showConfetti = action.payload;
    },
    
    /**
     * Clears the next transition state.
     * @param state - Current state
     */
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