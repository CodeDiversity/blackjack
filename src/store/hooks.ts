import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hooks for common state access patterns
export const useGameState = () => {
  return useAppSelector(state => state.gameState);
};

export const useBetting = () => {
  return useAppSelector(state => state.betting);
};

export const useStatistics = () => {
  return useAppSelector(state => state.statistics);
};

// Combined state hook for backward compatibility
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