import React from "react";
import styled from "styled-components";
import { BetResult } from "../types/game";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const BetItem = styled.div<{ won: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: ${({ won }) => (won ? "#15803d" : "#991b1b")};
  border-radius: 0.375rem;
  color: white;
  font-size: 0.875rem;
`;

const Amount = styled.span`
  font-weight: 600;
`;

const Time = styled.span`
  color: #e2e8f0;
  font-size: 0.75rem;
`;

interface BettingHistoryProps {
  bets: BetResult[];
}

const BettingHistory: React.FC<BettingHistoryProps> = ({ bets }) => {
  return (
    <Container>
      <Title>Betting History</Title>
      <HistoryList>
        {bets.map((bet, index) => (
          <BetItem key={index} won={bet.won}>
            <Amount>${bet.amount}</Amount>
            <Time>
              {bet.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Time>
          </BetItem>
        ))}
      </HistoryList>
    </Container>
  );
};

export default BettingHistory;
