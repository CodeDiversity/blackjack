import React from 'react';
import Card from './Card';
import { Hand as HandType } from '../types/game';
import { motion } from 'framer-motion';
import { calculateHandScore } from '../utils/deckUtils';

interface HandProps {
  hand: HandType;
  isDealer?: boolean;
  hideHoleCard?: boolean;
  revealIndex?: number;
}

const Hand: React.FC<HandProps> = ({ hand, isDealer, hideHoleCard, revealIndex }) => {
  if (!hand || !hand.cards) {
    return null; // or a loading indicator
  }

  const getDisplayScore = () => {
    if (isDealer && hideHoleCard) {
      return calculateHandScore([hand.cards[0]]);
    }
    if (isDealer) {
      return calculateHandScore(hand.cards.slice(0, (revealIndex ?? 0) + 1));
    }
    return hand.score;
  };

  const displayScore = getDisplayScore();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-lg font-semibold text-gray-100">
        {isDealer ? 'Dealer' : 'Player'}: {displayScore}
      </div>
      <div className="relative h-36 w-[500px] flex justify-center">
        <div className="relative w-[360px]">
          {hand.cards.map((card, index) => (
            <motion.div
              key={index}
              className="absolute"
              style={{ left: `${index * 120}px` }}
              initial={{ opacity: 0, scale: 0.3, x: 200 }}
              animate={{ 
                opacity: isDealer && index > (revealIndex ?? -1) ? 0 : 1,
                scale: 1,
                x: 0
              }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: index * 0.1
              }}
            >
              <Card 
                card={card} 
                isHidden={hideHoleCard && index === 1}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hand;