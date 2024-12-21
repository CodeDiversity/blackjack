import { AppMiddleware } from '../types/middleware';
import { RootState } from '../types/store';

export const persistMiddleware: AppMiddleware = store => next => action => {
  const result = next(action);
  const state = store.getState() as RootState;

  if (typeof window !== 'undefined') {
    localStorage.setItem('blackjack-state', JSON.stringify(state.game));
  }

  return result;
}; 