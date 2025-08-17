import React from "react";
import styled from "styled-components";
import { Card as CardType } from "../types/game";

/** Container for the card with 3D flip animation */
const CardContainer = styled.div<{ isHidden: boolean }>`
  position: relative;
  width: 70px;
  height: 100px;
  perspective: 1000px;
  transform-style: preserve-3d;
  transition: transform 0.6s;

  @media (min-width: 768px) {
    width: 100px;
    height: 140px;
  }
`;

/** Base card face with flip animation */
const CardFace = styled.div<{ isHidden: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transition: transform 0.6s;
  transform: ${({ isHidden }) =>
    isHidden ? "rotateY(180deg)" : "rotateY(0deg)"};
`;

/** Front face of the card showing the suit and value */
const FrontFace = styled(CardFace)`
  background-color: white;
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
`;

/** Back face of the card with blue pattern */
const BackFace = styled(CardFace)`
  background-color: #1e40af;
  background-image: linear-gradient(
    135deg,
    #1e40af 25%,
    #1e3a8a 25%,
    #1e3a8a 50%,
    #1e40af 50%,
    #1e40af 75%,
    #1e3a8a 75%,
    #1e3a8a 100%
  );
  background-size: 20px 20px;
  transform: ${({ isHidden }) =>
    isHidden ? "rotateY(360deg)" : "rotateY(180deg)"};
`;

/** Corner element showing card value and suit */
const Corner = styled.div<{ isRed?: boolean; isBottom?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-weight: bold;
  color: ${({ isRed }) => (isRed ? "#dc2626" : "#1e3a8a")};
  position: absolute;
  ${({ isBottom }) =>
    isBottom
      ? "bottom: 0.5rem; right: 0.5rem; transform: rotate(180deg);"
      : "top: 0.5rem; left: 0.5rem;"}
`;

/** Card value text (2-10, J, Q, K, A) */
const Value = styled.span`
  font-size: 1.125rem;
  line-height: 1;

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

/** Suit symbol text (♥, ♦, ♣, ♠) */
const Suit = styled.span`
  font-size: 0.875rem;
  line-height: 1;

  @media (min-width: 768px) {
    font-size: 1.125rem;
  }
`;

/**
 * Props for the Card component.
 */
interface CardProps {
  /** The card data to display */
  card: CardType;
  /** Whether the card should be shown face-down */
  isHidden?: boolean;
}

/**
 * Converts a suit name to its Unicode symbol.
 * @param suit - The suit name (hearts, diamonds, clubs, spades)
 * @returns The corresponding Unicode symbol
 */
const getSuitSymbol = (suit: string) => {
  switch (suit) {
    case "hearts":
      return "♥";
    case "diamonds":
      return "♦";
    case "clubs":
      return "♣";
    case "spades":
      return "♠";
    default:
      return "";
  }
};

/**
 * A playing card component with flip animation.
 * Shows the card face when revealed, or the card back when hidden.
 * Red suits (hearts, diamonds) are colored red, black suits are blue.
 * 
 * @param props - The card props
 * @returns A card component with 3D flip animation
 */
const Card: React.FC<CardProps> = ({ card, isHidden = false }) => {
  const isRed = card.suit === "hearts" || card.suit === "diamonds";
  const suitSymbol = getSuitSymbol(card.suit);

  return (
    <CardContainer isHidden={isHidden}>
      <FrontFace isHidden={isHidden}>
        <Corner isRed={isRed}>
          <Value>{card.face}</Value>
          <Suit>{suitSymbol}</Suit>
        </Corner>
        <Corner isRed={isRed} isBottom>
          <Value>{card.face}</Value>
          <Suit>{suitSymbol}</Suit>
        </Corner>
      </FrontFace>
      <BackFace isHidden={isHidden} />
    </CardContainer>
  );
};

export default Card;
