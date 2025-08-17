import { AppMiddleware } from '../types/middleware';
import { RootState } from '../types/store';

export const persistMiddleware: AppMiddleware = store => next => action => {
  const result = next(action);

  const state = store.getState() as RootState;

  if (typeof window !== 'undefined') {
    // Persist the whole state (gameState, betting, statistics)
    localStorage.setItem('blackjack-state', JSON.stringify(state));
  }

  return result;
}; 