import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BetResult } from '../types/game';
import { INITIAL_CHIPS } from '../utils/betUtils';

export interface BettingState {
  chips: number;
  currentBet: number;
  previousBet: number;
  bettingHistory: BetResult[];
}

const initialBettingState: BettingState = {
  chips: INITIAL_CHIPS,
  currentBet: 0,
  previousBet: 0,
  bettingHistory: []
};

const bettingSlice = createSlice({
  name: 'betting',
  initialState: initialBettingState,
  reducers: {
    placeBet: (state, action: PayloadAction<number>) => {
      const amount = action.payload;
      if (state.chips >= amount) {
        state.chips -= amount;
        state.currentBet += amount;
      }
    },
    
    clearBet: (state) => {
      state.chips += state.currentBet;
      state.currentBet = 0;
    },
    
    setPreviousBet: (state, action: PayloadAction<number>) => {
      state.previousBet = action.payload;
    },
    
    addWinnings: (state, action: PayloadAction<number>) => {
      state.chips += action.payload;
    },
    
    finalizeBet: (state, action: PayloadAction<{ amount: number; won: boolean; timestamp: Date }>) => {
      const betResult = action.payload;
      state.previousBet = state.currentBet;
      state.currentBet = 0;
      
      // Add to betting history (keep last 5)
      state.bettingHistory = [betResult, ...state.bettingHistory].slice(0, 5);
    },
    
    doubleDown: (state) => {
      const additionalBet = state.currentBet;
      if (state.chips >= additionalBet) {
        state.chips -= additionalBet;
        state.currentBet *= 2;
      }
    },
    
    resetBetting: (state) => {
      state.chips = INITIAL_CHIPS;
      state.currentBet = 0;
      state.previousBet = 0;
      state.bettingHistory = [];
    },
    
    placePreviousBet: (state, action: PayloadAction<number>) => {
      const multiplier = action.payload;
      const amount = state.previousBet * multiplier;
      
      if (state.chips >= amount && state.previousBet > 0) {
        state.chips -= amount;
        state.currentBet = amount;
      }
    }
  }
});

export const {
  placeBet,
  clearBet,
  setPreviousBet,
  addWinnings,
  finalizeBet,
  doubleDown,
  resetBetting,
  placePreviousBet
} = bettingSlice.actions;

export default bettingSlice.reducer;