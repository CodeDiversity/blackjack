import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #e2e8f0;
`;

const Stat = styled.span`
  display: flex;
  align-items: center;
`;

interface StatsDisplayProps {
  wins: number;
  losses: number;
  pushes: number;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({
  wins,
  losses,
  pushes,
}) => {
  return (
    <Container>
      <Stat>Wins: {wins}</Stat>
      <Stat>Losses: {losses}</Stat>
      <Stat>Pushes: {pushes}</Stat>
    </Container>
  );
};

export default StatsDisplay;
