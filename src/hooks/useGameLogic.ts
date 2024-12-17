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

  useEffect(() => {
    if (gameState.chips <= 0) {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'finished',
        message: 'Game Over!'
      }));
    }
  }, []);

  const placeBet = (amount: number) => {
    if (gameState.gameStatus !== 'betting' || gameState.chips < amount) return;

    setGameState(prev => ({
      ...prev,
      chips: prev.chips - amount,
      currentBet: prev.currentBet + amount
    }));
  };

  const placePreviousBet = async () => {
    if (
      gameState.previousBet === 0 || 
      gameState.chips < gameState.previousBet ||
      gameState.currentBet > 0
    ) return;

    const deck = createDeck();
    const playerCards = [deck.pop()!, deck.pop()!];
    const dealerCards = [deck.pop()!, deck.pop()!];

    // Clear hands first and subtract bet once
    setGameState(prev => ({
      ...prev,
      chips: prev.chips - prev.previousBet,
      currentBet: prev.previousBet,
      previousBet: prev.previousBet,
      playerHand: { cards: [], score: 0, isBusted: false },
      dealerHand: { cards: [], score: 0, isBusted: false },
      deck,
      gameStatus: 'dealing',
      message: 'Dealing cards...',
      revealIndex: -1
    }));

    await new Promise(resolve => setTimeout(resolve, 500));

    // Deal first card to player (removed chips subtraction)
    setGameState(prev => ({
      ...prev,
      playerHand: {
        cards: [playerCards[0]],
        score: calculateHandScore([playerCards[0]]),
        isBusted: false
      },
      deck,
      gameStatus: 'dealing',
      message: 'Dealing cards...',
    }));

    await new Promise(resolve => setTimeout(resolve, 500));

    // Deal first card to dealer
    setGameState(prev => ({
      ...prev,
      dealerHand: {
        cards: [dealerCards[0]],
        score: calculateHandScore([dealerCards[0]]),
        isBusted: false
      },
      revealIndex: 0
    }));

    await new Promise(resolve => setTimeout(resolve, 500));

    // Deal second card to player
    setGameState(prev => ({
      ...prev,
      playerHand: {
        cards: playerCards,
        score: calculateHandScore(playerCards),
        isBusted: false
      }
    }));

    await new Promise(resolve => setTimeout(resolve, 500));

    // Deal second card to dealer and start play
    setGameState(prev => ({
      ...prev,
      dealerHand: {
        cards: dealerCards,
        score: calculateHandScore(dealerCards),
        isBusted: false
      },
      gameStatus: 'playing',
      message: 'Your turn!',
      revealIndex: 1
    }));
  };

  const startNewHand = async () => {
    if (gameState.currentBet === 0) return;

    const deck = createDeck();
    const playerCards = [deck.pop()!, deck.pop()!];
    const dealerCards = [deck.pop()!, deck.pop()!];

    // Clear hands first
    setGameState(prev => ({
      ...prev,
      playerHand: { cards: [], score: 0, isBusted: false },
      dealerHand: { cards: [], score: 0, isBusted: false },
      deck,
      gameStatus: 'dealing',
      message: 'Dealing cards...',
      previousBet: gameState.currentBet,
      revealIndex: -1  // Hide all dealer cards initially
    }));

    await new Promise(resolve => setTimeout(resolve, 500));

    // Deal first card to player
    setGameState(prev => ({
      ...prev,
      playerHand: {
        cards: [playerCards[0]],
        score: calculateHandScore([playerCards[0]]),
        isBusted: false
      },
      deck,
      gameStatus: 'dealing',
      message: 'Dealing cards...',
      previousBet: gameState.currentBet,
    }));

    await new Promise(resolve => setTimeout(resolve, 500));

    // Deal first card to dealer
    setGameState(prev => ({
      ...prev,
      dealerHand: {
        cards: [dealerCards[0]],
        score: calculateHandScore([dealerCards[0]]),
        isBusted: false
      },
      revealIndex: 0
    }));

    await new Promise(resolve => setTimeout(resolve, 500));

    // Deal second card to player
    setGameState(prev => ({
      ...prev,
      playerHand: {
        cards: playerCards,
        score: calculateHandScore(playerCards),
        isBusted: false
      }
    }));

    await new Promise(resolve => setTimeout(resolve, 500));

    // Deal second card to dealer and start play
    setGameState(prev => ({
      ...prev,
      dealerHand: {
        cards: dealerCards,
        score: calculateHandScore(dealerCards),
        isBusted: false
      },
      gameStatus: 'playing',
      message: 'Your turn!',
      revealIndex: 1
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
      setGameState(prev => {
        const newChips = prev.chips;
        return {
          ...prev,
          deck: newDeck,
          playerHand: newHand,
          gameStatus: 'finished',
          message: newChips <= 0 ? 'Game Over!' : 'Bust! Dealer wins!',
          currentBet: 0,
          bettingHistory: [
            {
              amount: prev.currentBet,
              won: false,
              timestamp: new Date()
            },
            ...(prev.bettingHistory || [])
          ].slice(0, 5)
        };
      });
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
    setGameState(prev => ({ 
      ...prev, 
      ...currentState,
      message: "Dealer's turn..."
    }));

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
        revealIndex: currentState.revealIndex + 1,
        message: "Dealer's turn..."
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
    const newChips = gameState.chips + result.amount;

    // First show the result
    setGameState(prev => ({
      ...prev,
      ...currentState,
      gameStatus: newChips <= 0 ? 'finished' : 'finished',
      message: result.message,
      chips: newChips,
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

    // Wait a moment to show the result
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Then transition to betting only if we have chips
    if (newChips > 0) {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'betting',
        message: 'Place your bet!'
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        message: 'Game Over!'
      }));
    }
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

  const handleDoubleDown = async () => {
    if (gameState.gameStatus !== 'playing' || 
        gameState.chips < gameState.currentBet || 
        gameState.playerHand.cards.length > 2) return;

    const newBet = gameState.currentBet * 2;
    const newDeck = [...gameState.deck];
    const newCard = newDeck.pop()!;
    const newHand = {
      cards: [...gameState.playerHand.cards, newCard],
      score: calculateHandScore([...gameState.playerHand.cards, newCard]),
      isBusted: false
    };
    newHand.isBusted = newHand.score > 21;

    // First update state with the new card and bet
    setGameState(prev => ({
      ...prev,
      deck: newDeck,
      playerHand: newHand,
      chips: prev.chips - prev.currentBet,
      currentBet: newBet,
      gameStatus: newHand.isBusted ? 'finished' : 'dealerTurn',
      message: newHand.isBusted ? 'Bust! Dealer wins!' : "Dealer's turn..."
    }));

    // If busted, update history and end game
    if (newHand.isBusted) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGameState(prev => ({
        ...prev,
        bettingHistory: [
          {
            amount: newBet,
            won: false,
            timestamp: new Date()
          },
          ...(prev.bettingHistory || [])
        ].slice(0, 5)
      }));
    } else {
      // If not busted, proceed with dealer's turn
      await new Promise(resolve => setTimeout(resolve, 1000));
      await handleDealerTurn();
    }
  };

  // Add canDoubleDown check
  const canDoubleDown = 
    gameState.gameStatus === 'playing' && 
    gameState.playerHand.cards.length === 2 && 
    gameState.chips >= gameState.currentBet;

  console.log(gameState.bettingHistory)

  return {
    gameState,
    placeBet,
    placePreviousBet,
    startNewHand,
    handleHit,
    handleStand,
    handleDoubleDown,
    startNewGame,
    resetGame,
    canDoubleDown
  };
}