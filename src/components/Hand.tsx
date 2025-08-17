import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { handleBustAnimation, handleStand } from "../store/gameThunks";
import { useAppDispatch } from "../store/hooks";
import { Hand as HandType } from "../types/game";
import { calculateHandScore } from "../utils/deckUtils";
import { playCardFlip } from "../utils/soundUtils";
import Card from "./Card";

/** Container for the hand display including score and cards */
const HandContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

/** Score display showing player/dealer name and current score */
const Score = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #f1f5f9;
`;

/** Container for positioning cards with responsive height */
const CardsContainer = styled.div`
  position: relative;
  height: 24px;
  width: 100%;
  max-width: 500px;

  @media (min-width: 768px) {
    height: 36px;
  }
`;

/** Wrapper for centering cards with responsive width */
const CardsWrapper = styled.div`
  position: relative;
  width: 200px;
  margin: 0 auto;

  @media (min-width: 768px) {
    width: 360px;
  }
`;

/** Animated wrapper for individual cards */
const CardWrapper = styled(motion.div)`
  position: absolute;
  scale: 0.85;

  @media (min-width: 768px) {
    scale: 1;
  }
`;

/**
 * Props for the Hand component.
 */
interface HandProps {
  /** The hand data to display */
  hand: HandType;
  /** Whether this is the dealer's hand (affects display logic) */
  isDealer?: boolean;
  /** Whether to hide the dealer's hole card (second card) */
  hideHoleCard?: boolean;
  /** Index of the last revealed dealer card */
  revealIndex?: number;
  /** Callback when card animation completes (currently unused) */
  onCardAnimationComplete?: () => void;
}

/**
 * Component that displays a hand of cards with animations.
 * Shows the player or dealer name, current score, and animated cards.
 * Handles card reveal animations and auto-actions for busts and 21s.
 * 
 * @param props - The hand props
 * @returns A hand display with animated cards
 */
const Hand: React.FC<HandProps> = ({
  hand,
  isDealer,
  hideHoleCard,
  revealIndex,
  // onCardAnimationComplete - unused in current implementation
}) => {
  const dispatch = useAppDispatch();
  const [displayScore, setDisplayScore] = useState(0);

  // Update display score when hand changes
  useEffect(() => {
    if (!isDealer || hideHoleCard) {
      setDisplayScore(hand.score);
    }
  }, [hand.score, isDealer, hideHoleCard]);

  if (!hand?.cards) {
    return null;
  }

  /**
   * Handles completion of card animation.
   * Triggers auto-actions for busts and 21s after the last card is animated.
   * @param index - Index of the card that finished animating
   */
  const handleAnimationComplete = (index: number) => {
    if (index === hand.cards.length - 1) {
      // Calculate final score after last card animation
      const score = calculateHandScore(hand.cards);
      const isBusted = score > 21;

      setDisplayScore(score);

      if (isBusted) {
        void dispatch(handleBustAnimation());
      } else if (score === 21 && !isDealer) {
        void dispatch(handleStand());
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
          {hand.cards.map((card, index) => {
            // Use a stable key: suit-face-index (since deck is shuffled, this is unique enough)
            const cardKey = `${card.suit}-${card.face}-${index}`;
            return (
              <CardWrapper
                key={cardKey}
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
            );
          })}
        </CardsWrapper>
      </CardsContainer>
    </HandContainer>
  );
};

export default Hand;
