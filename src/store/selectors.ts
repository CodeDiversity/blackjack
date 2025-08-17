import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';
import { GameFlowService } from '../services/gameFlowService';
import { GameStatus } from '../types/game';

// Base selectors for each slice
export const selectGameState = (state: RootState) => state.gameState;
export const selectBetting = (state: RootState) => state.betting;
export const selectStatistics = (state: RootState) => state.statistics;

// Game state selectors
export const selectPlayerHand = createSelector(
  [selectGameState],
  (gameState) => gameState.playerHand
);

export const selectDealerHand = createSelector(
  [selectGameState],
  (gameState) => gameState.dealerHand
);

export const selectGameStatus = createSelector(
  [selectGameState],
  (gameState) => gameState.gameStatus
);

export const selectGameMessage = createSelector(
  [selectGameState],
  (gameState) => gameState.message
);

export const selectShowConfetti = createSelector(
  [selectGameState],
  (gameState) => gameState.showConfetti
);

export const selectRevealIndex = createSelector(
  [selectGameState],
  (gameState) => gameState.revealIndex
);

// Betting selectors
export const selectChips = createSelector(
  [selectBetting],
  (betting) => betting.chips
);

export const selectCurrentBet = createSelector(
  [selectBetting],
  (betting) => betting.currentBet
);

export const selectPreviousBet = createSelector(
  [selectBetting],
  (betting) => betting.previousBet
);

export const selectBettingHistory = createSelector(
  [selectBetting],
  (betting) => betting.bettingHistory
);

// Statistics selectors
export const selectTotalWins = createSelector(
  [selectStatistics],
  (stats) => stats.totalWins
);

export const selectTotalLosses = createSelector(
  [selectStatistics],
  (stats) => stats.totalLosses
);

export const selectTotalPushes = createSelector(
  [selectStatistics],
  (stats) => stats.totalPushes
);

export const selectWinPercentage = createSelector(
  [selectStatistics],
  (stats) => {
    const totalGames = stats.totalWins + stats.totalLosses + stats.totalPushes;
    return totalGames > 0 ? ((stats.totalWins / totalGames) * 100).toFixed(1) : '0.0';
  }
);

export const selectCurrentStreak = createSelector(
  [selectStatistics],
  (stats) => stats.currentStreak
);

// Computed selectors
export const selectCanBet = createSelector(
  [selectGameStatus, selectChips],
  (gameStatus, chips) => gameStatus === GameStatus.Betting && chips > 0
);

export const selectCanDealCards = createSelector(
  [selectGameStatus, selectCurrentBet],
  (gameStatus, currentBet) => gameStatus === GameStatus.Betting && currentBet > 0
);

export const selectCanDoubleDown = createSelector(
  [selectPlayerHand, selectChips, selectCurrentBet, selectGameStatus],
  (playerHand, chips, currentBet, gameStatus) => 
    GameFlowService.canDoubleDown(playerHand, chips, currentBet) && 
    gameStatus === GameStatus.Playing
);

export const selectCanHit = createSelector(
  [selectGameStatus, selectPlayerHand],
  (gameStatus, playerHand) => 
    gameStatus === GameStatus.Playing && !playerHand.isBusted && playerHand.score < 21
);

export const selectCanStand = createSelector(
  [selectGameStatus, selectPlayerHand],
  (gameStatus, playerHand) => 
    gameStatus === GameStatus.Playing && !playerHand.isBusted
);

export const selectDisplayedCardCount = createSelector(
  [selectGameState],
  (gameState) => gameState.deck.length
);

// Backward compatibility selector (matches old interface)
export const selectLegacyGameState = createSelector(
  [selectGameState, selectBetting, selectStatistics],
  (gameState, betting, statistics) => ({
    ...gameState,
    ...betting,
    stats: {
      totalWins: statistics.totalWins,
      totalLosses: statistics.totalLosses,
      totalPushes: statistics.totalPushes
    }
  })
);

// Complex computed selectors
export const selectGameSummary = createSelector(
  [selectPlayerHand, selectDealerHand, selectCurrentBet, selectGameStatus],
  (playerHand, dealerHand, currentBet, gameStatus) => ({
    playerScore: playerHand.score,
    dealerScore: dealerHand.score,
    playerBusted: playerHand.isBusted,
    dealerBusted: dealerHand.isBusted,
    currentBet,
    isGameActive: gameStatus === GameStatus.Playing || gameStatus === GameStatus.DealerTurn
  })
);

export const selectAvailableBets = createSelector(
  [selectChips],
  (chips) => {
    const standardBets = [5, 10, 25, 50, 100];
    return standardBets.filter(bet => bet <= chips);
  }
);