import { ThunkDispatch } from 'redux-thunk';
import { UnknownAction } from '@reduxjs/toolkit';
import { GameState } from './game';

export interface RootState {
  game: GameState;
}

export type AppDispatch = ThunkDispatch<RootState, unknown, UnknownAction>; 