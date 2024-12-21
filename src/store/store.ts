import { configureStore, Middleware } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';
import { persistMiddleware } from './persistMiddleware';
import { BetResult } from '../types/game';

// Create store type first
const createStoreWithState = (): ReturnType<typeof configureStore> => {
  return configureStore({
    reducer: {
      game: gameReducer,
    },
    preloadedState: loadState(),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['game/dealerTurn/fulfilled'],
          ignoredPaths: ['game.bettingHistory']
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

// Load state function
function loadState() {
  try {
    const serializedState = localStorage.getItem('blackjack-state');
    if (!serializedState) return undefined;

    const state = JSON.parse(serializedState);
    if (state.bettingHistory) {
      state.bettingHistory = state.bettingHistory.map((bet: Partial<BetResult>) => ({
        ...bet,
        timestamp: new Date(bet.timestamp as unknown as string)
      }));
    }
    return { game: state };
  } catch (err) {
    console.error('Error loading state:', err);
    return undefined;
  }
} 