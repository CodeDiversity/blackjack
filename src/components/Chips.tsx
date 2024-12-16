import React from 'react';
import { Coins } from 'lucide-react';

interface ChipsProps {
  chips: number;
  currentBet: number;
  onPlaceBet: (amount: number) => void;
  canBet: boolean;
  
}

const CHIP_VALUES = [5, 25, 100, 500];

const Chips: React.FC<ChipsProps> = ({ chips, currentBet, onPlaceBet, canBet }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 text-xl font-bold text-yellow-300">
        <Coins className="w-6 h-6" />
        <span>Chips: ${chips}</span>
      </div>
      
      {currentBet > 0 && (
        <div className="text-lg font-semibold text-yellow-200">
          Current Bet: ${currentBet}
        </div>
      )}
      
      <div className="flex gap-2">
        {CHIP_VALUES.map((value) => (
          <button
            key={value}
            onClick={() => onPlaceBet(value)}
            disabled={!canBet || chips < value}
            aria-label={`Place bet of $${value}`}
            className={`relative group ${
              canBet && chips >= value
                ? 'hover:-translate-y-2'
                : 'opacity-50 cursor-not-allowed'
            } transition-all duration-200`}
          >
            <div
              className={`w-16 h-16 rounded-full border-4 flex items-center justify-center
                text-white font-bold shadow-lg transform transition-transform
                ${getChipColor(value)}`}
            >
              ${value}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

function getChipColor(value: number): string {
  switch (value) {
    case 5:
      return 'bg-red-600 border-red-400';
    case 25:
      return 'bg-green-600 border-green-400';
    case 100:
      return 'bg-blue-600 border-blue-400';
    case 500:
      return 'bg-purple-600 border-purple-400';
    default:
      return 'bg-gray-600 border-gray-400';
  }
}

export default Chips;