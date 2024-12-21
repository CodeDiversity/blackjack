import React, { useState } from "react";
import styled from "styled-components";
import { Settings } from "lucide-react";

const MenuContainer = styled.div`
  position: relative;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #1e3a8a;
  border-radius: 0.5rem;
  padding: 1rem;
  min-width: 200px;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  z-index: 50;
`;

const Option = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  color: white;
  font-size: 0.875rem;
`;

const Toggle = styled.button<{ enabled: boolean }>`
  background-color: ${({ enabled }) => (enabled ? "#16a34a" : "#991b1b")};
  width: 40px;
  height: 20px;
  border-radius: 10px;
  position: relative;
  transition: background-color 0.2s;

  &::after {
    content: "";
    position: absolute;
    top: 2px;
    left: ${({ enabled }) => (enabled ? "22px" : "2px")};
    width: 16px;
    height: 16px;
    background-color: white;
    border-radius: 50%;
    transition: left 0.2s;
  }
`;

interface OptionsMenuProps {
  showConfetti: boolean;
  showCardCount: boolean;
  onToggleConfetti: () => void;
  onToggleCardCount: () => void;
}

const OptionsMenu: React.FC<OptionsMenuProps> = ({
  showConfetti,
  showCardCount,
  onToggleConfetti,
  onToggleCardCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MenuContainer>
      <IconButton onClick={() => setIsOpen(!isOpen)}>
        <Settings size={24} />
      </IconButton>

      {isOpen && (
        <Dropdown>
          <Option>
            <span>Show Confetti</span>
            <Toggle enabled={showConfetti} onClick={onToggleConfetti} />
          </Option>
          <Option>
            <span>Show Card Count</span>
            <Toggle enabled={showCardCount} onClick={onToggleCardCount} />
          </Option>
        </Dropdown>
      )}
    </MenuContainer>
  );
};

export default OptionsMenu;
