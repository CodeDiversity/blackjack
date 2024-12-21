import React from "react";
import { Coins } from "lucide-react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const ChipsTotal = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: bold;
  color: #fde047;
`;

const BetDisplay = styled.div`
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CurrentBet = styled.div`
  color: white;
  font-weight: 600;
`;

const ChipsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ChipButton = styled.button<{ isEnabled: boolean }>`
  position: relative;
  opacity: ${(props) => (props.isEnabled ? 1 : 0.5)};
  cursor: ${(props) => (props.isEnabled ? "pointer" : "not-allowed")};
  transition: all 0.2s;

  &:hover {
    transform: ${(props) => (props.isEnabled ? "translateY(-0.5rem)" : "none")};
  }
`;

const Chip = styled.div<{ color: string }>`
  width: 4rem;
  height: 4rem;
  border-radius: 9999px;
  border: 4px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  transition: transform 0.2s;
  ${(props) => getChipStyles(parseInt(props.color))}
`;

const getChipStyles = (value: number) => {
  switch (value) {
    case 5:
      return "background-color: #dc2626; border-color: #f87171;";
    case 25:
      return "background-color: #16a34a; border-color: #4ade80;";
    case 100:
      return "background-color: #2563eb; border-color: #60a5fa;";
    case 500:
      return "background-color: #9333ea; border-color: #c084fc;";
    default:
      return "background-color: #4b5563; border-color: #9ca3af;";
  }
};

interface ChipsProps {
  chips: number;
  currentBet: number;
  onPlaceBet: (amount: number) => void;
  canBet: boolean;
}

const CHIP_VALUES = [5, 25, 100, 500];

const Chips: React.FC<ChipsProps> = ({
  chips,
  currentBet,
  onPlaceBet,
  canBet,
}) => {
  return (
    <Container>
      <ChipsTotal>
        <Coins className="w-6 h-6" />
        <span>Chips: ${chips}</span>
      </ChipsTotal>

      <BetDisplay>
        {currentBet > 0 && <CurrentBet>Current Bet: ${currentBet}</CurrentBet>}
      </BetDisplay>

      <ChipsContainer>
        {CHIP_VALUES.map((value) => (
          <ChipButton
            key={value}
            onClick={() => onPlaceBet(value)}
            disabled={!canBet || chips < value}
            aria-label={`Place bet of $${value}`}
            isEnabled={canBet && chips >= value}
          >
            <Chip color={String(value)}>${value}</Chip>
          </ChipButton>
        ))}
      </ChipsContainer>
    </Container>
  );
};

export default Chips;
