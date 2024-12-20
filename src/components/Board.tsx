import React from "react";
import styled from "styled-components";
import { GameState } from "../types/game";

const BoardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  background-color: #15803d;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: bold;
  color: white;
`;

const CardCount = styled.div`
  font-size: 0.875rem;
  color: #e2e8f0;
`;

const GameArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
`;

const Message = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  text-align: center;
  padding: 1rem;
  background-color: #166534;
  border-radius: 0.5rem;
  width: 100%;
`;

interface BoardProps {
  gameState: GameState;
  displayedCardCount: number;
  children: React.ReactNode;
}

const Board: React.FC<BoardProps> = ({
  gameState,
  displayedCardCount,
  children,
}) => {
  return (
    <BoardContainer>
      <Header>
        <Title>Blackjack</Title>
        <CardCount>Cards Remaining: {displayedCardCount}</CardCount>
      </Header>
      <GameArea>
        {children}
        <Message>{gameState.message}</Message>
      </GameArea>
    </BoardContainer>
  );
};

export default Board;
