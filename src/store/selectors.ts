import { RootState } from './store';

export const selectGameState = (state: RootState) => state.game;
export const selectCanDoubleDown = (state: RootState) => {
  const { gameStatus, playerHand, chips, currentBet } = state.game;
  return (
    gameStatus === 'playing' && 
    playerHand.cards.length === 2 && 
    chips >= currentBet
  );
};
export const selectDisplayedCardCount = (state: RootState) => state.game.deck.length;
export const selectCanBet = (state: RootState) => state.game.gameStatus === 'betting';
export const selectIsPlaying = (state: RootState) => state.game.gameStatus === 'playing';
export const selectIsDealerTurn = (state: RootState) => state.game.gameStatus === 'dealerTurn';
export const selectIsFinished = (state: RootState) => state.game.gameStatus === 'finished';
export const selectCanDealCards = (state: RootState) => 
  state.game.gameStatus === 'betting' && state.game.currentBet > 0;