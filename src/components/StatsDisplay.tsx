import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #e2e8f0;
`;

const Stat = styled.span<{ type: "win" | "loss" | "push" }>`
  display: flex;
  align-items: center;
  color: ${({ type }) => {
    switch (type) {
      case "win":
        return "#4ade80"; // bright green
      case "loss":
        return "#f87171"; // bright red
      case "push":
        return "#fbbf24"; // bright yellow
      default:
        return "#e2e8f0";
    }
  }};
  font-weight: 600;
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
      <Stat type="win">Wins: {wins}</Stat>
      <Stat type="loss">Losses: {losses}</Stat>
      <Stat type="push">Pushes: {pushes}</Stat>
    </Container>
  );
};

export default StatsDisplay;
