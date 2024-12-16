import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from '../Card';

describe('Card', () => {
  it('should render hidden card when isHidden is true', () => {
    render(<Card isHidden />);
    expect(screen.getByTestId('hidden-card')).toBeInTheDocument();
  });

  it('should render card with correct value and suit', () => {
    const card = {
      suit: 'hearts' as const,
      value: 10,
      face: 'K'
    };
    
    render(<Card card={card} />);
    expect(screen.getAllByText('K')).toHaveLength(2);
    expect(screen.getByTestId('suit-icon')).toHaveClass('text-red-600');
  });

  it('should render nothing when no card is provided', () => {
    const { container } = render(<Card />);
    expect(container).toBeEmptyDOMElement();
  });
});