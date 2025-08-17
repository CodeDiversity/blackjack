import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface StatisticsState {
  totalWins: number;
  totalLosses: number;
  totalPushes: number;
  totalHands: number;
  totalWinnings: number;
  biggestWin: number;
  currentStreak: number;
  longestWinStreak: number;
  longestLossStreak: number;
}

const initialStatisticsState: StatisticsState = {
  totalWins: 0,
  totalLosses: 0,
  totalPushes: 0,
  totalHands: 0,
  totalWinnings: 0,
  biggestWin: 0,
  currentStreak: 0,
  longestWinStreak: 0,
  longestLossStreak: 0
};

export type GameResultType = 'win' | 'loss' | 'push';

const statisticsSlice = createSlice({
  name: 'statistics',
  initialState: initialStatisticsState,
  reducers: {
    recordGameResult: (state, action: PayloadAction<{ 
      result: GameResultType; 
      amount: number; 
      winnings: number 
    }>) => {
      const { result, amount, winnings } = action.payload;
      console.log('Recording game result:', { result, amount, winnings });
      
      state.totalHands++;
      state.totalWinnings += (winnings - amount);
      
      if (winnings > state.biggestWin) {
        state.biggestWin = winnings;
      }
      
      switch (result) {
        case 'win':
          state.totalWins++;
          state.currentStreak = state.currentStreak >= 0 ? state.currentStreak + 1 : 1;
          if (state.currentStreak > state.longestWinStreak) {
            state.longestWinStreak = state.currentStreak;
          }
          break;
          
        case 'loss':
          state.totalLosses++;
          state.currentStreak = state.currentStreak <= 0 ? state.currentStreak - 1 : -1;
          if (Math.abs(state.currentStreak) > state.longestLossStreak) {
            state.longestLossStreak = Math.abs(state.currentStreak);
          }
          break;
          
        case 'push':
          state.totalPushes++;
          state.currentStreak = 0;
          break;
      }
    },
    
    resetStatistics: (state) => {
      Object.assign(state, initialStatisticsState);
    },
    
    updateWinStreak: (state, action: PayloadAction<number>) => {
      state.currentStreak = action.payload;
      if (action.payload > state.longestWinStreak) {
        state.longestWinStreak = action.payload;
      }
    },
    
    updateLossStreak: (state, action: PayloadAction<number>) => {
      state.currentStreak = -Math.abs(action.payload);
      if (Math.abs(action.payload) > state.longestLossStreak) {
        state.longestLossStreak = Math.abs(action.payload);
      }
    }
  }
});

export const {
  recordGameResult,
  resetStatistics,
  updateWinStreak,
  updateLossStreak
} = statisticsSlice.actions;

export default statisticsSlice.reducer;