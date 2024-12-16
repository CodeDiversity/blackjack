export const INITIAL_CHIPS = 1000;

export function calculateWinnings(
  dealerScore: number,
  playerScore: number,
  currentBet: number,
  isDealerBusted: boolean
): { message: string; amount: number } {
  if (isDealerBusted) {
    return { 
      message: 'Dealer busts! You win!',
      amount: currentBet * 2 
    };
  }
  
  if (dealerScore > playerScore) {
    return { 
      message: 'Dealer wins!',
      amount: 0 
    };
  }
  
  if (dealerScore < playerScore) {
    return { 
      message: 'You win!',
      amount: currentBet * 2 
    };
  }
  
  return { 
    message: 'Push!',
    amount: currentBet 
  };
}