import React from "react";
import styled from "styled-components";

const StyledSquare = styled.button<{ isWinningSquare?: boolean }>`
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  background-color: ${({ isWinningSquare }) =>
    isWinningSquare ? "#4ade80" : "#1e293b"};
  color: white;
  border: 2px solid #334155;
  border-radius: 0.5rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: ${({ isWinningSquare }) =>
      isWinningSquare ? "#22c55e" : "#334155"};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

interface SquareProps {
  value: string | null;
  onClick: () => void;
  isWinningSquare?: boolean;
  disabled?: boolean;
}

const Square: React.FC<SquareProps> = ({
  value,
  onClick,
  isWinningSquare,
  disabled,
}) => {
  return (
    <StyledSquare
      onClick={onClick}
      isWinningSquare={isWinningSquare}
      disabled={disabled}
    >
      {value}
    </StyledSquare>
  );
};

export default Square;
