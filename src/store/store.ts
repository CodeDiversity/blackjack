import { combineReducers, configureStore, Middleware, ThunkAction, Action } from '@reduxjs/toolkit';
import { BetResult } from '../types/game';
import bettingReducer from './bettingSlice';
import gameStateReducer from './gameStateSlice';
import { persistMiddleware } from './persistMiddleware';
import statisticsReducer from './statisticsSlice';


// Root reducer combining all slices
const rootReducer = combineReducers({
  gameState: gameStateReducer,
  betting: bettingReducer,
  statistics: statisticsReducer
});

// Define RootState type from root reducer
export type RootState = ReturnType<typeof rootReducer>;

// Load state from localStorage
function loadState(): Partial<RootState> | undefined {
  try {
    const serializedState = localStorage.getItem('blackjack-state');
    if (!serializedState) return undefined;

    const state = JSON.parse(serializedState) as Partial<RootState>;
    
    // Handle betting history timestamp conversion
    if (state.betting?.bettingHistory) {
      state.betting.bettingHistory = state.betting.bettingHistory.map((bet: Partial<BetResult>) => ({
        ...bet,
        timestamp: new Date(bet.timestamp as unknown as string),
        amount: bet.amount ?? 0,
        won: bet.won ?? false,
      })) as BetResult[];
    }
    
    return state;
  } catch (err) {
    console.error('Error loading state:', err);
    return undefined;
  }
}

// Create store instance
export const store = configureStore({
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

// Define types from store instance
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

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