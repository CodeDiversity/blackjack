import React from 'react';

interface SquareProps {
  value: string | null;
  onClick: () => void;
  isWinningSquare?: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, isWinningSquare }) => (
  <button
    className={`w-16 h-16 border-2 border-indigo-300 text-2xl font-bold transition-all
      ${isWinningSquare 
        ? 'bg-indigo-200 text-indigo-800' 
        : 'bg-white hover:bg-indigo-50'} 
      ${value === 'X' ? 'text-indigo-600' : 'text-pink-600'}`}
    onClick={onClick}
  >
    {value}
  </button>
);

export default Square;