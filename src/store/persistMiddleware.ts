import { AppMiddleware } from '../types/middleware';

export const persistMiddleware: AppMiddleware = store => next => action => {
  const result = next(action);
  const state = store.getState();

  if (typeof window !== 'undefined') {
    localStorage.setItem('blackjack-state', JSON.stringify(state.game));
  }

  return result;
}; 