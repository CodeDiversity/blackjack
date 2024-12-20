import { createAsyncThunk } from '@reduxjs/toolkit';
import { createDeck, calculateHandScore } from '../utils/deckUtils';
import { calculateWinnings } from '../utils/betUtils';
import { Card } from '../types/game';
import { placeBet, setGameStatus, updateDealerHand, clearBet } from './gameSlice';
import { AppDispatch, RootState } from '../types/store';
import { GameStatus, GameMessage } from '../types/game';

const MIN_CARDS_BEFORE_SHUFFLE = 10;

const needsNewDeck = (deck: Card[]) => {
  return deck.length < MIN_CARDS_BEFORE_SHUFFLE;
};

interface StartHandResult {
  currentDeck: Card[];
  playerCards: Card[];
  dealerCards: Card[];
  previousBet: number;
}

export const startNewHand = createAsyncThunk<StartHandResult | null, void, { state: RootState }>(
  'game/startNewHand',
  async (_, { getState, dispatch }) => {
    const state = getState();
    if (!state.game.currentBet) return null;

    const currentDeck = needsNewDeck(state.game.deck) ?
      createDeck() :
      [...state.game.deck];

    const playerCards = [currentDeck.pop()!, currentDeck.pop()!];
    const dealerCards = [currentDeck.pop()!, currentDeck.pop()!];

    // Auto-stand on initial 21
    if (calculateHandScore(playerCards) === 21) {
      setTimeout(async () => {
        await (dispatch as AppDispatch)(handleStand()).unwrap();
      }, 1000);
    }

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
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    const currentDeck = [...state.game.deck];
    const dealerCards = [...state.game.dealerHand.cards];
    let dealerScore = calculateHandScore(dealerCards);

    // Initialize results with current hand
    const results = [{
      cards: [...dealerCards],
      score: dealerScore,
      isBusted: false
    }];

    while (dealerScore <= 16) {
      const newCard = currentDeck.pop()!;
      dealerCards.push(newCard);
      dealerScore = calculateHandScore(dealerCards);

      const currentResult = {
        cards: [...dealerCards],
        score: dealerScore,
        isBusted: dealerScore > 21
      };

      results.push(currentResult);

      dispatch(updateDealerHand({
        hand: currentResult,
        message: `Dealer draws: ${dealerScore}`
      }));

      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    const isBusted = dealerScore > 21;
    const winnings = calculateWinnings(
      dealerScore,
      state.game.playerHand.score,
      state.game.currentBet,
      isBusted
    );

    return {
      dealerResults: results,
      currentDeck,
      winnings,
      isBusted,
      finalScore: dealerScore
    };
  }
);

export const placePreviousBet = createAsyncThunk<StartHandResult | null, number | void, { state: RootState }>(
  'game/placePreviousBet',
  async (multiplier = 1, { getState, dispatch }) => {
    const state = getState();
    const baseAmount = state.game.currentBet || state.game.previousBet;
    const betAmount = baseAmount * (typeof multiplier === 'number' ? multiplier : 1);

    if (
      state.game.gameStatus !== GameStatus.Betting ||
      baseAmount === 0 ||
      state.game.chips < betAmount
    ) return null;

    if (state.game.currentBet > 0) {
      await dispatch(clearBet());
    }

    await dispatch(placeBet(betAmount));
    const result = await (dispatch as AppDispatch)(startNewHand()).unwrap();
    return result;
  }
);

export const handleHit = createAsyncThunk(
  'game/hit',
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (state.game.gameStatus !== 'playing') return null;

    const newDeck = [...state.game.deck];
    const newCard = newDeck.pop()!;
    const newCards = [...state.game.playerHand.cards, newCard];
    const score = calculateHandScore(newCards);
    const isBusted = score > 21;

    // Store current bet amount before it's reset
    const betAmount = state.game.currentBet;

    // Auto-stand on 21
    if (score === 21) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await (dispatch as AppDispatch)(handleStand()).unwrap();
    }

    return {
      newDeck,
      newCards,
      score,
      isBusted,
      betAmount  // Pass the bet amount to the reducer
    };
  }
);

export const handleDoubleDown = createAsyncThunk(
  'game/doubleDown',
  async (_, { getState }) => {
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

export const handleStand = createAsyncThunk<void, void, { state: RootState }>(
  'game/stand',
  async (_, { dispatch }) => {
    dispatch(setGameStatus({ status: GameStatus.DealerTurn, message: GameMessage.DealerTurn }));
    await (dispatch as AppDispatch)(handleDealerTurn()).unwrap();
  }
);