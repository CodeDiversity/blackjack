export const INITIAL_CHIPS = 5000;

export function calculateWinnings(
  dealerScore: number,
  playerScore: number,
  currentBet: number,
  dealerBusted: boolean,
  isBlackjack = false,
  isDealerBlackjack = false
): { message: string; amount: number } {
  if (isDealerBlackjack) {
    return {
      message: 'Dealer Blackjack!',
      amount: 0
    };
  }

  if (isBlackjack) {
    return {
      message: 'Blackjack! You win!',
      amount: Math.floor(currentBet * 2.5)
    };
  }

  if (dealerBusted || playerScore > dealerScore) {
    return {
      message: 'You win!',
      amount: currentBet * 2
    };
  } else if (playerScore === dealerScore) {
    return {
      message: 'Push!',
      amount: currentBet
    };
  } else {
    return {
      message: 'Dealer wins!',
      amount: 0
    };
  }
}