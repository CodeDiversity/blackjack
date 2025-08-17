import { UnknownAction } from '@reduxjs/toolkit';
import { ThunkDispatch } from 'redux-thunk';
import { BettingState } from '../store/bettingSlice';
import { StatisticsState } from '../store/statisticsSlice';
import { GameState } from './game';

export interface RootState {
  gameState: GameState;
  betting: BettingState;
  statistics: StatisticsState;
}

export type AppDispatch = ThunkDispatch<RootState, unknown, UnknownAction>;