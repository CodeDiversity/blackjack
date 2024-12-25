// Create a single audio instance for card flips
const cardFlipSound = new Audio('/sounds/flipCard.mp3');

export const playCardFlip = () => {
  // Reset and play the sound
  cardFlipSound.currentTime = 0;
  cardFlipSound.play().catch(() => {
    // Ignore errors from browsers blocking autoplay
  });
}; 