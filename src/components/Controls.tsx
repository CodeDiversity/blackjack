import React from "react";

interface ControlsProps {
  onHit: () => void;
  onStand: () => void;
  onDoubleDown: () => void;
  onNewGame: () => void;
  onReset: () => void;
  onPlacePreviousBet: () => void;
  onDeal: () => void;
  gameStatus: string;
  previousBet: number;
  chips: number;
  canDoubleDown: boolean;
  canDealCards: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  onHit,
  onStand,
  onDoubleDown,
  onNewGame,
  onReset,
  onPlacePreviousBet,
  onDeal,
  gameStatus,
  previousBet,
  chips,
  canDoubleDown,
  canDealCards,
}) => {
  console.log("Controls render:", { gameStatus, chips });

  const isBetting = gameStatus === "betting";
  const canAct = gameStatus === "playing";

  return (
    <div className="grid gap-2 min-w-[280px] h-[100px]">
      <div className="flex gap-2">
        {canAct && (
          <>
            <button
              onClick={onStand}
              className="w-[90px] h-[45px] bg-red-600 hover:bg-red-700 text-white rounded-lg
                transition-colors font-semibold"
            >
              Stand
            </button>
            <button
              onClick={onHit}
              className="w-[90px] h-[45px] bg-green-600 hover:bg-green-700 text-white rounded-lg
                transition-colors font-semibold"
            >
              Hit
            </button>

            {canDoubleDown && (
              <button
                onClick={onDoubleDown}
                className="w-[90px] h-[45px] bg-purple-600 hover:bg-purple-700 text-white rounded-lg
                  transition-colors font-semibold"
              >
                Double
              </button>
            )}
          </>
        )}

        {isBetting && (
          <>
            {canDealCards && (
              <button
                onClick={onDeal}
                className="w-[90px] h-[45px] bg-yellow-600 text-white rounded-lg hover:bg-yellow-700
                  transition-colors font-semibold"
              >
                Deal
              </button>
            )}
            {previousBet > 0 && chips >= previousBet && (
              <button
                onClick={onPlacePreviousBet}
                className="w-[90px] h-[45px] bg-yellow-600 text-white rounded-lg hover:bg-yellow-700
                  transition-colors font-semibold"
              >
                Repeat Bet
              </button>
            )}
          </>
        )}
      </div>

      <div className="flex gap-2">
        {gameStatus === "finished" && chips <= 0 && (
          <button
            onClick={onReset}
            className="w-[90px] h-[45px] bg-red-600 text-white rounded-lg hover:bg-red-700
              transition-colors font-semibold"
          >
            Reset Game
          </button>
        )}
      </div>
    </div>
  );
};

export default Controls;
