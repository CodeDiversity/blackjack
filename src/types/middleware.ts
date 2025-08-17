import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../store/store';

export type AppMiddleware = Middleware<Record<string, never>, RootState>; 