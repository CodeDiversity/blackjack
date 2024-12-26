import { createAsyncThunk } from '@reduxjs/toolkit';
import { createDeck, calculateHandScore, hasBlackjack } from '../utils/deckUtils';
import { calculateWinnings } from '../utils/betUtils';
import { Card, GameStatus, GameMessage } from '../types/game';
import { placeBet, setGameStatus, updateDealerHand, clearBet } from './gameSlice';
import { AppDispatch, RootState } from '../types/store';

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

    // Check for dealer blackjack first
    if (hasBlackjack(dealerCards)) {
      setTimeout(async () => {
        // Force dealer turn to reveal cards and end game
        dispatch(setGameStatus({ status: GameStatus.DealerTurn, message: GameMessage.DealerBlackjack }));
        await (dispatch as AppDispatch)(handleDealerTurn()).unwrap();
      }, 1000);
    }
    // Only check for player blackjack if dealer doesn't have it
    else if (hasBlackjack(playerCards)) {
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

    // Check for blackjacks
    const isBlackjack = state.game.playerHand.score === 21 &&
      state.game.playerHand.cards.length === 2;
    const isDealerBlackjack = hasBlackjack(dealerCards);

    // Initialize results array
    const results = [{
      cards: [...dealerCards],
      score: calculateHandScore(dealerCards),
      isBusted: false
    }];

    // Draw cards if needed (not blackjack)
    let finalDealerScore = calculateHandScore(dealerCards);
    while (finalDealerScore < 17 && !isDealerBlackjack) {
      const newCard = currentDeck.pop()!;
      dealerCards.push(newCard);
      finalDealerScore = calculateHandScore(dealerCards);

      const currentResult = {
        cards: [...dealerCards],
        score: finalDealerScore,
        isBusted: finalDealerScore > 21
      };

      results.push(currentResult);

      dispatch(updateDealerHand({
        hand: currentResult,
        message: "Dealer draws..."
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const isBusted = finalDealerScore > 21;
    const winnings = calculateWinnings(
      finalDealerScore,
      state.game.playerHand.score,
      state.game.currentBet,
      isBusted,
      isBlackjack,
      isDealerBlackjack
    );

    return {
      dealerResults: results,
      currentDeck,
      winnings,
      finalScore: finalDealerScore
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
      dispatch(clearBet());
    }

    dispatch(placeBet(betAmount));
    const result = await (dispatch as AppDispatch)(startNewHand()).unwrap();
    return result;
  }
);

export const handleHit = createAsyncThunk(
  'game/hit',
  async (_, { getState }) => {
    const state = getState() as RootState;

    // Check if player is already busted or not in playing state
    if (state.game.gameStatus !== 'playing' || state.game.playerHand.isBusted) {
      return null;
    }

    const newDeck = [...state.game.deck];
    const newCard = newDeck.pop()!;
    const newCards = [...state.game.playerHand.cards, newCard];
    const score = calculateHandScore(newCards);
    const isBusted = score > 21;
    const betAmount = state.game.currentBet;

    const result = {
      newDeck,
      newCards,
      score,
      isBusted,
      betAmount,
      shouldStartDealerTurn: score === 21 && !isBusted
    };

    return result;
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

export const handleBustAnimation = createAsyncThunk(
  'game/handleBustAnimation',
  async (betAmount: number) => {
    return { betAmount };
  }
);