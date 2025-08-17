import { configureStore, Middleware, combineReducers } from '@reduxjs/toolkit';
import gameStateReducer, { CoreGameState } from './gameStateSlice';
import bettingReducer, { BettingState } from './bettingSlice';
import statisticsReducer, { StatisticsState } from './statisticsSlice';
import { persistMiddleware } from './persistMiddleware';
import { BetResult } from '../types/game';

// Combined root state interface
export interface RootState {
  gameState: CoreGameState;
  betting: BettingState;
  statistics: StatisticsState;
}

// Root reducer combining all slices
const rootReducer = combineReducers({
  gameState: gameStateReducer,
  betting: bettingReducer,
  statistics: statisticsReducer
});

// Load state from localStorage
function loadState(): Partial<RootState> | undefined {
  try {
    const serializedState = localStorage.getItem('blackjack-state');
    if (!serializedState) return undefined;

    const state = JSON.parse(serializedState);
    
    // Handle betting history timestamp conversion
    if (state.betting?.bettingHistory) {
      state.betting.bettingHistory = state.betting.bettingHistory.map((bet: Partial<BetResult>) => ({
        ...bet,
        timestamp: new Date(bet.timestamp as unknown as string)
      }));
    }
    
    return state;
  } catch (err) {
    console.error('Error loading state:', err);
    return undefined;
  }
}

// Create store with new modular structure
const createStoreWithState = (): ReturnType<typeof configureStore> => {
  return configureStore({
    reducer: rootReducer,
    preloadedState: loadState(),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            'game/dealerTurn/fulfilled',
            'betting/finalizeBet',
            'statistics/recordGameResult'
          ],
          ignoredPaths: [
            'betting.bettingHistory',
            'betting.bettingHistory.timestamp'
          ]
        },
      }).concat(persistMiddleware as unknown as Middleware),
  });
};

// Create store instance
export const store = createStoreWithState();

// Define types from store instance
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppState = ReturnType<typeof createStoreWithState>;

// Utility function to get combined game state for backward compatibility
export const getCombinedGameState = (state: RootState) => ({
  ...state.gameState,
  ...state.betting,
  stats: {
    totalWins: state.statistics.totalWins,
    totalLosses: state.statistics.totalLosses,
    totalPushes: state.statistics.totalPushes
  }
});

export default store;