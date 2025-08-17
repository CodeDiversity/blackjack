/**
 * Audio instance for card flip sound effect.
 * Created once and reused to avoid multiple audio instances.
 */
const cardFlipSound = new Audio('/sounds/flipCard.mp3');

/**
 * Plays the card flip sound effect.
 * Resets the audio to the beginning and plays it.
 * Gracefully handles browsers that block autoplay.
 */
export const playCardFlip = () => {
  // Reset and play the sound
  cardFlipSound.currentTime = 0;
  cardFlipSound.play().catch(() => {
    // Ignore errors from browsers blocking autoplay
  });
}; 