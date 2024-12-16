import React from 'react';
import Card from './Card';
interface CardType {
  id: string;
  title: string;
  description: string;
}

interface BoardProps {
  cards: CardType[];
}

const Board: React.FC<BoardProps> = ({ cards }) => {
  return (
    <div className="flex gap-2 min-w-0 w-[300px]">
      {cards.map((card: any, index: number) => (
        <div key={index} className="flex-shrink-0">
          <Card {...card} />
        </div>
      ))}
    </div>
  );
};

export default Board; 