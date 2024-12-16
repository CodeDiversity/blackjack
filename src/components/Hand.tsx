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
  // Calculate score based only on revealed cards for dealer
  const displayScore = isDealer && hideHoleCard
    ? calculateHandScore([hand.cards[0]]) // Show only first card's value
    : isDealer
    ? calculateHandScore(hand.cards.slice(0, (revealIndex || 0) + 1))
    : hand.score;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-lg font-semibold text-gray-100">
        {isDealer ? 'Dealer' : 'Player'}: {displayScore}
      </div>
      <div className="flex gap-2">
        {hand.cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ x: 1000, opacity: 0 }}
            animate={{ 
              x: 0, 
              opacity: isDealer && index > revealIndex ? 0 : 1 
            }}
            transition={{ 
              duration: 0.5,
              delay: index * 0.2 
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
  );
};

export default Hand;