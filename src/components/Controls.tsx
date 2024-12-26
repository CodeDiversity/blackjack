import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: grid;
  gap: 0.5rem;
  min-width: 280px;
  height: 80px;
  @media (min-width: 768px) {
    height: 100px;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.25rem;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;

  @media (min-width: 768px) {
    gap: 0.5rem;
  }
`;

const Button = styled.button<{
  variant: "red" | "green" | "purple" | "yellow";
}>`
  width: 70px;
  height: 40px;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  border-radius: 0.5rem;
  transition: background-color 0.2s;

  @media (min-width: 768px) {
    width: 90px;
    height: 45px;
    font-size: 1rem;
  }

  ${({ variant }) => {
    switch (variant) {
      case "red":
        return `
          background-color: #dc2626;
          &:hover { background-color: #ef4444; }
        `;
      case "green":
        return `
          background-color: #16a34a;
          &:hover { background-color: #22c55e; }
        `;
      case "purple":
        return `
          background-color: #9333ea;
          &:hover { background-color: #a855f7; }
        `;
      case "yellow":
        return `
          background-color: #ca8a04;
          &:hover { background-color: #eab308; }
        `;
    }
  }}
`;

interface ControlsProps {
  onHit: () => void;
  onStand: () => void;
  onDoubleDown: () => void;
  onReset: () => void;
  onPlacePreviousBet: (multiplier?: number) => void;
  onDeal: () => void;
  onNewGame: () => void;
  gameStatus: string;
  previousBet: number;
  chips: number;
  canDoubleDown: boolean;
  canDealCards: boolean;
  onClearBet: () => void;
  currentBet: number;
}

const Controls: React.FC<ControlsProps> = ({
  onHit,
  onStand,
  onDoubleDown,
  onReset,
  onPlacePreviousBet,
  onDeal,
  onNewGame,
  gameStatus,
  previousBet,
  chips,
  canDoubleDown,
  canDealCards,
  onClearBet,
  currentBet,
}) => {
  const isBetting = gameStatus === "betting";
  const canAct = gameStatus === "playing";

  return (
    <Container>
      <ButtonRow>
        {canAct && (
          <>
            <Button variant="green" onClick={onHit}>
              Hit
            </Button>
            <Button variant="red" onClick={onStand}>
              Stand
            </Button>

            {canDoubleDown && (
              <Button variant="purple" onClick={onDoubleDown}>
                Double
              </Button>
            )}
          </>
        )}

        {isBetting && (
          <>
            {canDealCards && (
              <Button variant="yellow" onClick={onDeal}>
                Deal
              </Button>
            )}
            {currentBet > 0 && (
              <>
                <Button variant="red" onClick={onClearBet}>
                  Clear Bet
                </Button>
                {chips >= currentBet * 2 && (
                  <Button
                    variant="purple"
                    onClick={() => onPlacePreviousBet(2)}
                  >
                    ${currentBet * 2}
                  </Button>
                )}
                {chips >= currentBet * 3 && (
                  <Button variant="green" onClick={() => onPlacePreviousBet(3)}>
                    ${currentBet * 3}
                  </Button>
                )}
              </>
            )}
            {previousBet > 0 && !currentBet && (
              <>
                {chips >= previousBet && (
                  <Button
                    variant="yellow"
                    onClick={() => onPlacePreviousBet(1)}
                  >
                    ${previousBet}
                  </Button>
                )}
                {chips >= previousBet * 2 && (
                  <Button
                    variant="purple"
                    onClick={() => onPlacePreviousBet(2)}
                  >
                    ${previousBet * 2}
                  </Button>
                )}
                {chips >= previousBet * 3 && (
                  <Button variant="green" onClick={() => onPlacePreviousBet(3)}>
                    ${previousBet * 3}
                  </Button>
                )}
              </>
            )}
            {chips <= 0 && (
              <Button variant="red" onClick={onReset}>
                Reset Game
              </Button>
            )}
          </>
        )}

        {gameStatus === "finished" && chips <= 0 && (
          <Button variant="red" onClick={onReset}>
            Reset Game
          </Button>
        )}
      </ButtonRow>
    </Container>
  );
};

export default Controls;
