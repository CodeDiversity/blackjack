import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Hand as HandType } from "../types/game";
import Card from "./Card";
import { calculateHandScore } from "../utils/deckUtils";
import { playCardFlip } from "../utils/soundUtils";
import { useDispatch, useSelector } from "react-redux";
import { handleBustAnimation } from "../store/gameThunks";
import { RootState } from "../types/store";
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
  onCardAnimationComplete,
}) => {
  const dispatch = useDispatch();
  const currentBet = useSelector((state: RootState) => state.game.currentBet);
  const [animatingCardIndex, setAnimatingCardIndex] = useState(-1);

  if (!hand || !hand.cards) {
    return null;
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
    <HandContainer>
      <Score>
        {isDealer ? "Dealer" : "Player"}: {displayScore}
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
                delay: index * 0.3,
              }}
              onAnimationStart={() => {
                if (!isDealer || index <= (revealIndex ?? -1)) {
                  playCardFlip();
                  setAnimatingCardIndex(index);
                }
              }}
              onAnimationComplete={() => {
                if (index === hand.cards.length - 1) {
                  if (hand.isBusted) {
                    dispatch(handleBustAnimation(currentBet));
                  } else if (hand.score === 21) {
                    dispatch(handleStand());
                  }
                }
              }}
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
