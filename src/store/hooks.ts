import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

/**
 * Typed version of useDispatch hook for this app's store.
 * Use this instead of the plain useDispatch from react-redux.
 * @returns The app's dispatch function with proper typing
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed version of useSelector hook for this app's store.
 * Use this instead of the plain useSelector from react-redux.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Hook to access the current game state (hands, status, deck, etc.).
 * @returns The current core game state
 */
export const useGameState = () => {
  return useAppSelector(state => state.gameState);
};

/**
 * Hook to access the current betting state (chips, bets, history).
 * @returns The current betting state
 */
export const useBetting = () => {
  return useAppSelector(state => state.betting);
};

/**
 * Hook to access the current statistics state (wins, losses, pushes).
 * @returns The current statistics state
 */
export const useStatistics = () => {
  return useAppSelector(state => state.statistics);
};

/**
 * Combined state hook that merges all state slices for backward compatibility.
 * Provides the complete game state in a single object.
 * @returns Combined game state from all slices
 */
export const useLegacyGameState = () => {
  const gameState = useGameState();
  const betting = useBetting();
  const statistics = useStatistics();
  
  return {
    ...gameState,
    ...betting,
    stats: {
      totalWins: statistics.totalWins,
      totalLosses: statistics.totalLosses,
      totalPushes: statistics.totalPushes
    }
  };
};