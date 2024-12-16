import React from "react";
import { Card as CardType } from "../types/game";
import { Heart, Diamond, Club, Spade } from "lucide-react";

interface CardProps {
  card?: CardType;
  isHidden?: boolean;
}

const Card: React.FC<CardProps> = ({ card, isHidden }) => {
  if (isHidden) {
    return (
      <div
        className="w-24 h-36 bg-indigo-700 rounded-lg shadow-md border-2 border-indigo-800
        transform transition-transform hover:scale-105"
      >
        <div className="w-full h-full flex items-center justify-center">
          <div
            className="w-16 h-24 rounded-lg bg-indigo-600"
            data-testid="hidden-card"
          ></div>
        </div>
      </div>
    );
  }

  if (!card) return null;

  const SuitIcon = {
    hearts: Heart,
    diamonds: Diamond,
    clubs: Club,
    spades: Spade,
  }[card.suit];

  const suitColor =
    card.suit === "hearts" || card.suit === "diamonds"
      ? "text-red-600"
      : "text-gray-900";

  return (
    <div
      className="w-24 h-36 bg-white rounded-lg shadow-md border-2 border-gray-200
      transform transition-transform hover:scale-105"
    >
      <div className="p-2 flex flex-col h-full">
        <div className={`text-lg font-bold ${suitColor}`}>{card.face}</div>
        <div className="flex-grow flex items-center justify-center">
          <SuitIcon
            data-testid="suit-icon"
            className={`w-8 h-8 ${suitColor}`}
          />
        </div>
        <div className={`text-lg font-bold rotate-180 ${suitColor}`}>
          {card.face}
        </div>
      </div>
    </div>
  );
};

export default Card;
