/**
 * Custom hook for playing sound effects in the blackjack game.
 * Creates audio instances on demand and handles playback errors gracefully.
 * 
 * @returns Object containing sound effect functions
 */
const useSound = () => {
  /**
   * Plays the chip sound effect when placing or collecting bets.
   * Creates a new audio instance each time to allow overlapping sounds.
   */
  const playChipSound = () => {
    const audio = new Audio('/sounds/chip.mp3'); // You'll need to add these sound files
    audio.play().catch(() => {}); // Catch errors if sound fails
  };

  /**
   * Plays the card sound effect when dealing cards.
   * Creates a new audio instance each time to allow overlapping sounds.
   */
  const playCardSound = () => {
    const audio = new Audio('/sounds/card.mp3');
    audio.play().catch(() => {});
  };

  return { playChipSound, playCardSound };
};

export default useSound; 