import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from './store';
import { createDeck, calculateHandScore } from '../utils/deckUtils';
import { calculateWinnings } from '../utils/betUtils';
import { Card } from '../types/game';
import { placeBet, setGameStatus, updateDealerHand } from './gameSlice';

const MIN_CARDS_BEFORE_SHUFFLE = 10;

const needsNewDeck = (deck: Card[]) => {
  return deck.length < MIN_CARDS_BEFORE_SHUFFLE;
};

export const startNewHand = createAsyncThunk(
  'game/startNewHand',
  async (_, { getState }) => {
    console.log('Starting new hand...');
    const state = getState() as RootState;
    console.log('Current state:', {
      currentBet: state.game.currentBet,
      gameStatus: state.game.gameStatus,
      deckSize: state.game.deck.length
    });

    if (state.game.currentBet === 0) {
      console.log('No bet placed, returning null');
      return null;
    }

    // Always create a new deck if empty or near empty
    const currentDeck = state.game.deck.length < MIN_CARDS_BEFORE_SHUFFLE ? 
      createDeck() : 
      [...state.game.deck];

    console.log('Current deck size:', currentDeck.length);

    // Deal cards
    const playerCards = [currentDeck.pop()!, currentDeck.pop()!];
    const dealerCards = [currentDeck.pop()!, currentDeck.pop()!];
    console.log('Dealt cards:', { playerCards, dealerCards });

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

export const handleStand = createAsyncThunk<void, void, { state: RootState }>(
  'game/stand',
  async (_, { dispatch }) => {
    dispatch(setGameStatus({ status: 'dealerTurn', message: "Dealer's turn..." }));
    await dispatch(handleDealerTurn()).unwrap();
  }
); 