import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface BetResult {
  amount: number;
  won: boolean;
  timestamp: Date | number;
}

interface BettingHistoryProps {
  bets?: BetResult[];
}

const BettingHistory: React.FC<BettingHistoryProps> = ({ bets }) => {
  const formatTimestamp = (timestamp: number | Date) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2 text-white">Betting History</h3>
      <div className="space-y-2">
        {(bets || []).map((bet, index) => (
          <div
            key={index}
            className="flex justify-between items-center text-sm bg-gray-800 p-3 rounded-lg shadow-md hover:bg-gray-700 transition-colors"
          >
            <span className="text-gray-300">{formatTimestamp(bet.timestamp)}</span>
            <span className={bet.won ? 'text-green-500' : 'text-red-500'}>
              {bet.won ? '' : '-'}${bet.amount}
            </span>
            <span>
              {bet.won ? (
                <TrendingUp className="text-green-500" />
              ) : (
                <TrendingDown className="text-red-500" />
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BettingHistory; 