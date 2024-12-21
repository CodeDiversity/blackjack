export const INITIAL_CHIPS = 5000;

export function calculateWinnings(
  dealerScore: number,
  playerScore: number,
  currentBet: number,
  dealerBusted: boolean
): { message: string; amount: number } {
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