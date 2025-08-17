/** Initial chip amount when starting a new game */
export const INITIAL_CHIPS = 5000;

/**
 * Calculates winnings based on game outcome according to blackjack rules.
 * Handles all possible game endings including blackjacks, busts, and regular wins.
 * 
 * @param dealerScore - Final score of the dealer's hand
 * @param playerScore - Final score of the player's hand  
 * @param currentBet - Amount bet on this round
 * @param dealerBusted - Whether the dealer busted (exceeded 21)
 * @param isBlackjack - Whether the player has blackjack (21 with 2 cards)
 * @param isDealerBlackjack - Whether the dealer has blackjack
 * @returns Object containing the result message and winnings amount
 */
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