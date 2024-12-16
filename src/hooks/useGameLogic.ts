import useLocalStorage from './useLocalStorage';
import { GameState } from '../types/game';
import { createDeck, calculateHandScore } from '../utils/deckUtils';
import { calculateWinnings, INITIAL_CHIPS } from '../utils/betUtils';
import { REVEAL_DELAY, shouldDealerHit } from '../utils/dealerUtils';
import { useEffect } from 'react';

export function useGameLogic() {
  const [gameState, setGameState] = useLocalStorage<GameState>('blackjack-state', {
    playerHand: {
      cards: [],
      score: 0,
      isBusted: false
    },
    dealerHand: {
      cards: [],
      score: 0,
      isBusted: false
    },
    deck: [],
    gameStatus: 'betting',
    message: 'Place your bet!',
    chips: INITIAL_CHIPS,
    currentBet: 0,
    previousBet: 0,
    revealIndex: 0,
    bettingHistory: [] as Array<{
      amount: number;
      won: boolean;
      timestamp: Date;
    }>
  });

  useEffect(() => {
    if (gameState.bettingHistory?.length > 0 && !(gameState.bettingHistory[0]?.timestamp instanceof Date)) {
      setGameState(prev => ({
        ...prev,
        bettingHistory: prev.bettingHistory.map(bet => ({
          ...bet,
          timestamp: new Date(bet.timestamp)
        }))
      }));
    }
  }, [gameState.bettingHistory, setGameState]);

  const placeBet = (amount: number) => {
    if (gameState.gameStatus !== 'betting' || gameState.chips < amount) return;

    setGameState(prev => ({
      ...prev,
      chips: prev.chips - amount,
      currentBet: prev.currentBet + amount
    }));
  };

  const placePreviousBet = () => {
    if (
      gameState.previousBet === 0 || 
      gameState.chips < gameState.previousBet ||
      gameState.currentBet > 0  // Prevent betting if there's already a current bet
    ) return;

    // Place bet and deal cards in one action
    const deck = createDeck();
    const playerCards = [deck.pop()!, deck.pop()!];
    const dealerCards = [deck.pop()!, deck.pop()!];

    setGameState(prev => ({
      ...prev,
      chips: prev.chips - prev.previousBet,
      currentBet: prev.previousBet,
      previousBet: prev.previousBet,
      playerHand: {
        cards: playerCards,
        score: calculateHandScore(playerCards),
        isBusted: false
      },
      dealerHand: {
        cards: dealerCards,
        score: calculateHandScore(dealerCards),
        isBusted: false
      },
      deck,
      gameStatus: 'playing',
      message: 'Your turn!',
      revealIndex: 0
    }));
  };

  const startNewHand = () => {
    if (gameState.currentBet === 0) return;

    const deck = createDeck();
    const playerCards = [deck.pop()!, deck.pop()!];
    const dealerCards = [deck.pop()!, deck.pop()!];

    setGameState(prev => ({
      ...prev,
      playerHand: {
        cards: playerCards,
        score: calculateHandScore(playerCards),
        isBusted: false
      },
      dealerHand: {
        cards: dealerCards,
        score: calculateHandScore(dealerCards),
        isBusted: false
      },
      deck,
      gameStatus: 'playing',
      message: 'Your turn!',
      revealIndex: 0,
      previousBet: gameState.currentBet,
    }));
  };

  const handleHit = () => {
    if (gameState.gameStatus !== 'playing') return;

    const newDeck = [...gameState.deck];
    const newCard = newDeck.pop()!;
    const newHand = {
      cards: [...gameState.playerHand.cards, newCard],
      score: calculateHandScore([...gameState.playerHand.cards, newCard]),
      isBusted: false
    };
    newHand.isBusted = newHand.score > 21;

    if (newHand.isBusted) {
      updateBettingHistory(false);
      setGameState(prev => ({
        ...prev,
        deck: newDeck,
        playerHand: newHand,
        gameStatus: 'finished',
        message: 'Bust! Dealer wins!',
        currentBet: 0,
        bettingHistory: [
          {
            amount: prev.currentBet,
            won: false,
            timestamp: new Date()
          },
          ...(prev.bettingHistory || [])
        ].slice(0, 5)
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        deck: newDeck,
        playerHand: newHand,
        gameStatus: 'playing',
        message: 'Your turn!'
      }));
    }
  };

  const handleDealerTurn = async () => {
    const newState: GameState = { ...gameState, gameStatus: 'dealerTurn' as const };
    let currentState = newState;
    currentState.revealIndex = 1;

    await new Promise(resolve => setTimeout(resolve, REVEAL_DELAY));
    setGameState(prev => ({ ...prev, ...currentState }));

    while (shouldDealerHit(currentState.dealerHand.score)) {
      await new Promise(resolve => setTimeout(resolve, REVEAL_DELAY));

      const newCard = currentState.deck.pop()!;
      const newCards = [...currentState.dealerHand.cards, newCard];

      currentState = {
        ...currentState,
        dealerHand: {
          cards: newCards,
          score: calculateHandScore(currentState.dealerHand.cards),
          isBusted: false
        },
        revealIndex: currentState.revealIndex + 1
      };

      setGameState(prev => ({ ...prev, ...currentState }));

      await new Promise(resolve => setTimeout(resolve, 500));

      const newScore = calculateHandScore(newCards);
      currentState.dealerHand.score = newScore;
      currentState.dealerHand.isBusted = newScore > 21;
      setGameState(prev => ({ ...prev, ...currentState }));
    }

    const result = calculateWinnings(
      currentState.dealerHand.score,
      currentState.playerHand.score,
      currentState.currentBet,
      currentState.dealerHand.isBusted
    );

    const isWin = result.amount > currentState.currentBet;

    setGameState(prev => ({
      ...prev,
      ...currentState,
      gameStatus: 'finished',
      message: result.message,
      chips: prev.chips + result.amount,
      currentBet: 0,
      bettingHistory: [
        {
          amount: prev.currentBet,
          won: isWin,
          timestamp: new Date()
        },
        ...(prev.bettingHistory || [])
      ].slice(0, 5)
    }));
  };

  const handleStand = async () => {
    if (gameState.gameStatus !== 'playing') return;
    
    // Immediately update game status to prevent further actions
    setGameState(prev => ({
      ...prev,
      gameStatus: 'dealerTurn',
      message: "Dealer's turn..."
    }));

    // Then start dealer's turn
    await handleDealerTurn();
  };

  const startNewGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'betting',
      message: 'Place your bet!',
      playerHand: { cards: [], score: 0, isBusted: false },
      dealerHand: { cards: [], score: 0, isBusted: false },
      deck: [],
      currentBet: 0,
      revealIndex: -1,
    }));
  };

  const updateBettingHistory = (won: boolean) => {
    setGameState(prev => ({
      ...prev,
      bettingHistory: [
        {
          amount: prev.currentBet,
          won,
          timestamp: new Date()
        },
        ...(prev.bettingHistory || [])
      ]
    }));
  };

  const resetGame = () => {
    window.localStorage.removeItem('blackjack-state');
    window.localStorage.removeItem('blackjack-history');
    window.location.reload();
  };

  console.log(gameState.bettingHistory)

  return {
    gameState,
    placeBet,
    placePreviousBet,
    startNewHand,
    handleHit,
    handleStand,
    startNewGame,
    resetGame
  };
}