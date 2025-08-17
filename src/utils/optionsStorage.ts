/** Local storage key for game options */
const OPTIONS_KEY = 'blackjack-options';

/**
 * Game options that can be customized by the player.
 */
interface GameOptions {
  /** Whether to show confetti animations on wins */
  showConfetti: boolean;
  /** Whether to show the remaining card count */
  showCardCount: boolean;
}

/**
 * Loads game options from local storage.
 * Returns default options if storage is empty or corrupted.
 * @returns The loaded or default game options
 */
export const loadOptions = (): GameOptions => {
  try {
    const saved = localStorage.getItem(OPTIONS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading options:', error);
  }
  return {
    showConfetti: true,
    showCardCount: true
  };
};

/**
 * Saves game options to local storage.
 * Handles storage errors gracefully by logging them.
 * @param options - The game options to save
 */
export const saveOptions = (options: GameOptions) => {
  try {
    localStorage.setItem(OPTIONS_KEY, JSON.stringify(options));
  } catch (error) {
    console.error('Error saving options:', error);
  }
}; 