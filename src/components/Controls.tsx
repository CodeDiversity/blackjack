import React from 'react';

interface ControlsProps {
  onHit: () => void;
  onStand: () => void;
  onDoubleDown: () => void;
  onNewGame: () => void;
  onReset: () => void;
  onPlacePreviousBet: () => void;
  gameStatus: string;
  previousBet: number;
  chips: number;
  canDoubleDown: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  onHit,
  onStand,
  onDoubleDown,
  onNewGame,
  onReset,
  onPlacePreviousBet,
  gameStatus,
  previousBet,
  chips,
  canDoubleDown
}) => {
  console.log('Controls render:', { gameStatus, chips });

  const isBetting = gameStatus === 'betting';
  const canAct = gameStatus === 'playing';

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={onHit}
        disabled={!canAct}
        className={`px-6 py-3 rounded-lg font-semibold transition-colors
          ${canAct 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
      >
        Hit
      </button>

      <button
        onClick={onStand}
        disabled={!canAct}
        className={`px-6 py-3 rounded-lg font-semibold transition-colors
          ${canAct 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
      >
        Stand
      </button>

      {canDoubleDown && (
        <button
          onClick={onDoubleDown}
          disabled={!canAct}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors
            ${canAct ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
        >
          Double Down
        </button>
      )}

      {gameStatus === 'finished' && (
        <button
          onClick={onNewGame}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700
            transition-colors font-semibold"
        >
          New Game
        </button>
      )}

      {isBetting && previousBet > 0 && chips >= previousBet && (
        <button
          onClick={onPlacePreviousBet}
          className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700
            transition-colors font-semibold"
        >
          Repeat Bet (${previousBet})
        </button>
      )}

      {gameStatus === 'finished' && chips <= 0 && (
        <button
          onClick={onReset}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700
            transition-colors font-semibold"
        >
          Reset Game
        </button>
      )}
    </div>
  );
};

export default Controls;