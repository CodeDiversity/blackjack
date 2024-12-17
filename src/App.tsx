import Hand from "./components/Hand";
import Controls from "./components/Controls";
import Chips from "./components/Chips";
import { useGameLogic } from "./hooks/useGameLogic";
import BettingHistory from "./components/BettingHistory";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const {
    gameState,
    placeBet,
    placePreviousBet,
    startNewHand,
    handleHit,
    handleStand,
    handleDoubleDown,
    startNewGame,
    resetGame,
    canDoubleDown,
    displayedCardCount
  } = useGameLogic();

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
                  onPlaceBet={placeBet}
                  canBet={gameState.gameStatus === "betting"}
                />

                <div className="flex gap-4">
                  {gameState.gameStatus === "betting" &&
                    gameState.currentBet > 0 && (
                      <button
                        onClick={startNewHand}
                        className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700
                        transition-colors font-semibold"
                      >
                        Deal Cards
                      </button>
                    )}

                  <Controls
                    onHit={handleHit}
                    onStand={handleStand}
                    onDoubleDown={handleDoubleDown}
                    onNewGame={startNewGame}
                    onReset={resetGame}
                    onPlacePreviousBet={placePreviousBet}
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
