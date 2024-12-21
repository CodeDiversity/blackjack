import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';
import { persistMiddleware } from './persistMiddleware';

// Load persisted state
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('blackjack-state');
    if (!serializedState) return undefined;
    
    const state = JSON.parse(serializedState);
    // Convert date strings back to Date objects
    if (state.bettingHistory) {
      state.bettingHistory = state.bettingHistory.map((bet: any) => ({
        ...bet,
        timestamp: new Date(bet.timestamp)
      }));
    }
    return { game: state };
  } catch (err) {
    console.error('Error loading state:', err);
    return undefined;
  }
};

export const store = configureStore({
  reducer: {
    game: gameReducer,
  },
  preloadedState: loadState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['game/dealerTurn/fulfilled'],
        // Ignore these field paths in state
        ignoredPaths: ['game.bettingHistory']
      },
    }).concat(persistMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 