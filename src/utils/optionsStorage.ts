const OPTIONS_KEY = 'blackjack-options';

interface GameOptions {
  showConfetti: boolean;
  showCardCount: boolean;
}

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

export const saveOptions = (options: GameOptions) => {
  try {
    localStorage.setItem(OPTIONS_KEY, JSON.stringify(options));
  } catch (error) {
    console.error('Error saving options:', error);
  }
}; 