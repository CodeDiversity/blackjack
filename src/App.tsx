import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  selectGameState,
  selectCanDoubleDown,
  selectDisplayedCardCount,
  selectCanBet,
  selectCanDealCards,
} from "./store/selectors";
import {
  startNewGame,
  resetGame,
  placeBet,
  transitionToBetting,
} from "./store/gameSlice";
import {
  startNewHand,
  handleHit,
  handleDealerTurn,
  placePreviousBet,
  handleDoubleDown,
  handleStand,
} from "./store/gameThunks";
import Hand from "./components/Hand";
import Controls from "./components/Controls";
import Chips from "./components/Chips";
import BettingHistory from "./components/BettingHistory";
import ErrorBoundary from "./components/ErrorBoundary";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "./store/store";
import StatsDisplay from "./components/StatsDisplay";
import { useEffect, useState } from "react";
import Confetti from 'react-confetti';

function App() {
  const dispatch = useAppDispatch() as ThunkDispatch<
    RootState,
    unknown,
    AnyAction
  >;
  const gameState = useAppSelector(selectGameState);
  const canDoubleDown = useAppSelector(selectCanDoubleDown);
  const displayedCardCount = useAppSelector(selectDisplayedCardCount);
  const canBet = useAppSelector(selectCanBet);
  const canDealCards = useAppSelector(selectCanDealCards);
  const [showConfetti, setShowConfetti] = useState(false);

  // Action handlers
  const handleStartNewHand = () => dispatch(startNewHand());
  const handlePlayerHit = () => dispatch(handleHit());
  const handlePlayerStand = async () => {
    try {
      await dispatch(handleStand()).unwrap();
    } catch (error) {
      console.error("Error during stand:", error);
    }
  };
  const handlePlacePreviousBet = () => dispatch(placePreviousBet());
  const handleStartNewGame = () => dispatch(startNewGame());
  const handleResetGame = () => dispatch(resetGame());
  const handlePlaceBet = (amount: number) => {
    dispatch(placeBet(amount));
  };
  const doubleDown = async () => {
    try {
      const result = await dispatch(handleDoubleDown()).unwrap();
      if (result && !result.isBusted) {
        await dispatch(handleDealerTurn()).unwrap();
      }
    } catch (error) {
      console.error("Error during double down:", error);
    }
  };

  useEffect(() => {
    if (gameState.nextGameStatus) {
      console.log("Setting up transition timer with:", {
        nextStatus: gameState.nextGameStatus,
        nextMessage: gameState.nextMessage,
      });
      const timer = setTimeout(() => {
        console.log("Transitioning to betting state");
        dispatch(transitionToBetting());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [gameState.nextGameStatus, dispatch, gameState.nextMessage]);

  // Watch for wins and trigger confetti
  useEffect(() => {
    if (gameState.gameStatus === 'finished' && gameState.message.includes('You win')) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [gameState.gameStatus, gameState.message]);

  return (
    <ErrorBoundary>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 flex items-center justify-center">
        <div className="bg-green-700 p-8 rounded-xl shadow-2xl w-[1000px] h-[700px] flex gap-8">
          <div className="w-[250px] shrink-0 border-r border-green-600">
            <BettingHistory bets={gameState.bettingHistory} />
            <div className="mt-4 p-4 bg-green-800 rounded-lg">
              <StatsDisplay
                wins={gameState.stats.totalWins}
                losses={gameState.stats.totalLosses}
                pushes={gameState.stats.totalPushes}
              />
            </div>
          </div>

          <div className="flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold text-white">Blackjack</h1>
              <div className="text-sm text-gray-200">
                Cards Remaining: {displayedCardCount}
              </div>
            </div>

            <div className="flex-grow bg-green-800 rounded-xl p-6 relative">
              <div className="flex flex-col items-center gap-8">
                <Hand
                  hand={gameState.dealerHand}
                  isDealer
                  hideHoleCard={gameState.gameStatus === "playing"}
                  revealIndex={gameState.revealIndex}
                />

                <div className="text-xl font-semibold text-white text-center p-4 rounded-lg bg-green-700 w-full">
                  {gameState.message}
                </div>

                <Hand hand={gameState.playerHand} />
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-6">
              <Chips
                chips={gameState.chips}
                currentBet={gameState.currentBet}
                onPlaceBet={handlePlaceBet}
                canBet={canBet}
              />

              <div className="flex gap-4">
                <Controls
                  onHit={handlePlayerHit}
                  onStand={handlePlayerStand}
                  onDoubleDown={doubleDown}
                  onNewGame={handleStartNewGame}
                  onReset={handleResetGame}
                  onPlacePreviousBet={handlePlacePreviousBet}
                  onDeal={handleStartNewHand}
                  gameStatus={gameState.gameStatus}
                  previousBet={gameState.previousBet}
                  chips={gameState.chips}
                  canDoubleDown={canDoubleDown}
                  canDealCards={canDealCards}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
