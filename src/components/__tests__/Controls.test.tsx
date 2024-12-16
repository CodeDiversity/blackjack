import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Controls from '../Controls';

describe('Controls', () => {
  const defaultProps = {
    onHit: vi.fn(),
    onStand: vi.fn(),
    onNewGame: vi.fn(),
    onPlacePreviousBet: vi.fn(),
    gameStatus: 'playing',
    previousBet: 100,
    chips: 1000
  };

  it('should render hit and stand buttons during play', () => {
    render(<Controls {...defaultProps} />);
    expect(screen.getByText('Hit')).toBeInTheDocument();
    expect(screen.getByText('Stand')).toBeInTheDocument();
  });

  it('should disable buttons when not playing', () => {
    render(<Controls {...defaultProps} gameStatus="betting" />);
    expect(screen.getByText('Hit')).toBeDisabled();
    expect(screen.getByText('Stand')).toBeDisabled();
  });

  it('should show repeat bet button with correct amount', () => {
    render(<Controls {...defaultProps} gameStatus="betting" />);
    expect(screen.getByText(/Repeat Bet \(\$100\)/)).toBeInTheDocument();
  });

  it('should call handlers when buttons are clicked', () => {
    render(<Controls {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Hit'));
    expect(defaultProps.onHit).toHaveBeenCalled();
    
    fireEvent.click(screen.getByText('Stand'));
    expect(defaultProps.onStand).toHaveBeenCalled();
  });
});