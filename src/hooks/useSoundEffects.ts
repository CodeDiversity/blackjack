const useSound = () => {
  const playChipSound = () => {
    const audio = new Audio('/sounds/chip.mp3'); // You'll need to add these sound files
    audio.play().catch(() => {}); // Catch errors if sound fails
  };

  const playCardSound = () => {
    const audio = new Audio('/sounds/card.mp3');
    audio.play().catch(() => {});
  };

  return { playChipSound, playCardSound };
};

export default useSound; 