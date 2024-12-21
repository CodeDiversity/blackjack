import { Middleware, UnknownAction } from '@reduxjs/toolkit';
import { RootState } from '../store/store';

export type AppMiddleware = Middleware<{}, RootState, UnknownAction>; 