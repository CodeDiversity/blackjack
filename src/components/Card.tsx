import React from "react";
import styled from "styled-components";
import { Card as CardType } from "../types/game";

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

const FrontFace = styled(CardFace)`
  background-color: white;
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
`;

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

const Value = styled.span`
  font-size: 1.125rem;
  line-height: 1;

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Suit = styled.span`
  font-size: 0.875rem;
  line-height: 1;

  @media (min-width: 768px) {
    font-size: 1.125rem;
  }
`;

interface CardProps {
  card: CardType;
  isHidden?: boolean;
}

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
