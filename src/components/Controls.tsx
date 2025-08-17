import React from "react";
import styled from "styled-components";

/** Main container for all control buttons */
const Container = styled.div`
  display: grid;
  gap: 0.5rem;
  min-width: 280px;
  height: 80px;
  @media (min-width: 768px) {
    height: 100px;
  }
`;

/** Horizontal row of buttons with responsive layout */
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

/** Styled button with color variants */
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

/**
 * Props for the Controls component.
 */
interface ControlsProps {
  /** Callback when player hits */
  onHit: () => void;
  /** Callback when player stands */
  onStand: () => void;
  /** Callback when player doubles down */
  onDoubleDown: () => void;
  /** Callback to reset the game */
  onReset: () => void;
  /** Callback to place a previous bet with optional multiplier */
  onPlacePreviousBet: (multiplier?: number) => void;
  /** Callback to place a specific bet amount */
  onPlaceBet: (amount: number) => void;
  /** Callback to deal cards */
  onDeal: () => void;
  /** Callback to start a new game (currently unused) */
  onNewGame: () => void;
  /** Current game status */
  gameStatus: string;
  /** Previous bet amount for quick rebetting */
  previousBet: number;
  /** Current chip count */
  chips: number;
  /** Whether the player can double down */
  canDoubleDown: boolean;
  /** Whether cards can be dealt */
  canDealCards: boolean;
  /** Callback to clear the current bet */
  onClearBet: () => void;
  /** Current bet amount */
  currentBet: number;
}

/**
 * Game controls component that displays appropriate buttons based on game state.
 * Shows different sets of buttons for betting phase vs playing phase.
 * Provides quick betting options and game actions like hit, stand, double down.
 * 
 * @param props - The controls props
 * @returns A responsive set of game control buttons
 */
const Controls: React.FC<ControlsProps> = ({
  onHit,
  onStand,
  onDoubleDown,
  onReset,
  onPlacePreviousBet,
  onPlaceBet,
  onDeal,
  // onNewGame - unused in current implementation
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
        {/* Playing phase buttons */}
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

        {/* Betting phase buttons */}
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
                {chips >= currentBet && (
                  <Button
                    variant="purple"
                    onClick={() => onPlaceBet(currentBet)}
                  >
                    +${currentBet}
                  </Button>
                )}
                {chips >= currentBet * 2 && (
                  <Button variant="green" onClick={() => onPlaceBet(currentBet * 2)}>
                    +${currentBet * 2}
                  </Button>
                )}
              </>
            )}
            {/* Previous bet quick options */}
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
            {/* Reset button when out of chips */}
            {chips <= 0 && (
              <Button variant="red" onClick={onReset}>
                Reset Game
              </Button>
            )}
          </>
        )}

        {/* Reset button when game is finished and out of chips */}
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
