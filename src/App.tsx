import { useAppDispatch, useAppSelector } from './store/hooks';
import { selectGameState, selectCanDoubleDown, selectDisplayedCardCount } from './store/selectors';
import { startNewGame, resetGame } from './store/gameSlice';
import { startNewHand, handleHit, handleDealerTurn, placePreviousBet, handleDoubleDown, handleStand, placeBet } from './store/gameThunks';
import Hand from "./components/Hand";
import Controls from "./components/Controls";
import Chips from "./components/Chips";
import BettingHistory from "./components/BettingHistory";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const dispatch = useAppDispatch();
  const gameState = useAppSelector(selectGameState);
  const canDoubleDown = useAppSelector(selectCanDoubleDown);
  const displayedCardCount = useAppSelector(selectDisplayedCardCount);

  const handleStartNewHand = () => dispatch(startNewHand());
  const handlePlayerHit = () => dispatch(handleHit());
  const handlePlayerStand = () => dispatch(handleStand());
  const handlePlacePreviousBet = () => dispatch(placePreviousBet());
  const handleStartNewGame = () => dispatch(startNewGame());
  const handleResetGame = () => dispatch(resetGame());
  const handlePlaceBet = (amount: number) => dispatch(placeBet(amount));
  const handleDoubleDown = async () => {
    const result = await dispatch(handleDoubleDown()).unwrap();
    if (result && !result.isBusted) {
      await dispatch(handleDealerTurn());
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 flex items-center justify-center">
        <div className="bg-green-700 p-8 rounded-xl shadow-2xl w-[1000px] h-[700px] flex gap-8">
          <div className="w-[250px] shrink-0 border-r border-green-600">
            <BettingHistory bets={gameState.bettingHistory} />
          </div>

          <div className="flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold text-white">Blackjack</h1>
              <div className="text-sm text-gray-200">
                Cards Remaining: {displayedCardCount}
              </div>
            </div>

            <div className="flex flex-col items-center justify-between flex-grow pb-8">
              <div className="flex flex-col items-center gap-8">
                <Hand
                  hand={gameState.dealerHand}
                  isDealer
                  hideHoleCard={gameState.gameStatus === "playing"}
                  revealIndex={gameState.revealIndex}
                />

                <div className="text-xl font-semibold text-white text-center p-4 rounded-lg bg-green-800 w-full">
                  {gameState.message}
                </div>

                <Hand hand={gameState.playerHand} />
              </div>

              <div className="flex flex-col items-center gap-4">
                <Chips
                  chips={gameState.chips}
                  currentBet={gameState.currentBet}
                  onPlaceBet={handlePlaceBet}
                  canBet={gameState.gameStatus === "betting"}
                />

                <div className="flex gap-4">
                  {gameState.gameStatus === "betting" &&
                    gameState.currentBet > 0 && (
                      <button
                        onClick={handleStartNewHand}
                        className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700
                        transition-colors font-semibold"
                      >
                        Deal Cards
                      </button>
                    )}

                  <Controls
                    onHit={handlePlayerHit}
                    onStand={handlePlayerStand}
                    onDoubleDown={handleDoubleDown}
                    onNewGame={handleStartNewGame}
                    onReset={handleResetGame}
                    onPlacePreviousBet={handlePlacePreviousBet}
                    gameStatus={gameState.gameStatus}
                    previousBet={gameState.previousBet}
                    chips={gameState.chips}
                    canDoubleDown={canDoubleDown}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
