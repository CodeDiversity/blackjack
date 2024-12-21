import { Middleware } from '@reduxjs/toolkit';
import { RootState } from './store';

export const persistMiddleware: Middleware<{}, RootState> = store => next => action => {
  const result = next(action);
  const state = store.getState();

  if (typeof window !== 'undefined') {
    // Save to localStorage after state changes
    localStorage.setItem('blackjack-state', JSON.stringify(state.game));
  }

  return result;
}; 