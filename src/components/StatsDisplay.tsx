import React from 'react';

interface StatsDisplayProps {
  wins: number;
  losses: number;
  pushes: number;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ wins, losses, pushes }) => {
  return (
    <div className="text-sm text-gray-200 flex gap-4">
      <span>Wins: {wins}</span>
      <span>Losses: {losses}</span>
      <span>Pushes: {pushes}</span>
    </div>
  );
};

export default StatsDisplay; 