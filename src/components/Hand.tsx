import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Hand as HandType } from "../types/game";
import Card from "./Card";
import { calculateHandScore } from "../utils/deckUtils";
import { playCardFlip } from "../utils/soundUtils";
import { useAppDispatch } from "../store/hooks";
import { handleBustAnimation } from "../store/gameThunks";
import { handleStand } from "../store/gameThunks";

const HandContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const Score = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #f1f5f9;
`;

const CardsContainer = styled.div`
  position: relative;
  height: 24px;
  width: 100%;
  max-width: 500px;

  @media (min-width: 768px) {
    height: 36px;
  }
`;

const CardsWrapper = styled.div`
  position: relative;
  width: 200px;
  margin: 0 auto;

  @media (min-width: 768px) {
    width: 360px;
  }
`;

const CardWrapper = styled(motion.div)`
  position: absolute;
  scale: 0.85;

  @media (min-width: 768px) {
    scale: 1;
  }
`;

interface HandProps {
  hand: HandType;
  isDealer?: boolean;
  hideHoleCard?: boolean;
  revealIndex?: number;
  onCardAnimationComplete?: () => void;
}

const Hand: React.FC<HandProps> = ({
  hand,
  isDealer,
  hideHoleCard,
  revealIndex,
  // onCardAnimationComplete - unused in current implementation
}) => {
  const dispatch = useAppDispatch();
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!isDealer || hideHoleCard) {
      setDisplayScore(hand.score);
    }
  }, [hand.score, isDealer, hideHoleCard]);

  if (!hand || !hand.cards) {
    return null;
  }

  const handleAnimationComplete = (index: number) => {
    if (isDealer && index === hand.cards.length - 1) {
      // Calculate final score after last card animation
      const score = calculateHandScore(hand.cards);
      const isBusted = score > 21;
      
      setDisplayScore(score);
      
      // Handle game outcomes
      if (isBusted) {
        dispatch(handleBustAnimation());
      } else if (score === 21) {
        dispatch(handleStand());
      }
    }
  };

  return (
    <HandContainer>
      <Score>
        {isDealer ? "Dealer" : "Player"}
        {displayScore > 0 && `: ${displayScore}`}
      </Score>
      <CardsContainer>
        <CardsWrapper>
          {hand.cards.map((card, index) => (
            <CardWrapper
              key={index}
              style={{
                left: `${index * (window.innerWidth < 768 ? 55 : 90)}px`,
              }}
              initial={{ opacity: 0, scale: 0.3, x: 200 }}
              animate={{
                opacity: isDealer && index > (revealIndex ?? -1) ? 0 : 1,
                scale: window.innerWidth < 768 ? 0.85 : 1,
                x: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              onAnimationStart={() => {
                if (!isDealer || index <= (revealIndex ?? -1)) {
                  playCardFlip();
                }
              }}
              onAnimationComplete={() => handleAnimationComplete(index)}
            >
              <Card card={card} isHidden={hideHoleCard && index === 1} />
            </CardWrapper>
          ))}
        </CardsWrapper>
      </CardsContainer>
    </HandContainer>
  );
};

export default Hand;
