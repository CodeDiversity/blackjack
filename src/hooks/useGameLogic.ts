import useLocalStorage from './useLocalStorage';
import { Card, GameState } from '../types/game';
import { createDeck, calculateHandScore } from '../utils/deckUtils';
import { calculateWinnings, INITIAL_CHIPS } from '../utils/betUtils';
import { REVEAL_DELAY, shouldDealerHit } from '../utils/dealerUtils';
import { useEffect, useState } from 'react';

const MIN_CARDS_BEFORE_SHUFFLE = 4;

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

  const [displayedCardCount, setDisplayedCardCount] = useState(0);

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

    const currentDeck = needsNewDeck(gameState.deck) ? createDeck() : gameState.deck;
    console.log('Initial deck size:', currentDeck.length);

    const playerCards = [currentDeck.pop()!, currentDeck.pop()!];
    const dealerCards = [currentDeck.pop()!, currentDeck.pop()!];
    console.log('After dealing all cards:', currentDeck.length);

    // Clear hands first and subtract bet once
    setGameState(prev => ({
      ...prev,
      chips: prev.chips - prev.previousBet,
      currentBet: prev.previousBet,
      previousBet: prev.previousBet,
      playerHand: { cards: [], score: 0, isBusted: false },
      dealerHand: { cards: [], score: 0, isBusted: false },
      deck: currentDeck,
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
      deck: currentDeck,
      gameStatus: 'dealing',
      message: 'Dealing cards...',
    }));
    console.log('After first player card:', currentDeck.length);
    setDisplayedCardCount(currentDeck.length);
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
    console.log('After first dealer card:', currentDeck.length);
    setDisplayedCardCount(currentDeck.length);
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
    console.log('After second player card:', currentDeck.length);
    setDisplayedCardCount(currentDeck.length);
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
    console.log('After second dealer card:', currentDeck.length);
    setDisplayedCardCount(currentDeck.length);
  };

  const startNewGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'betting',
      message: 'Place your bet!',
      playerHand: { cards: [], score: 0, isBusted: false },
      dealerHand: { cards: [], score: 0, isBusted: false },
      currentBet: 0,
      revealIndex: -1,
    }));
  };

  const startNewHand = async () => {
    if (gameState.currentBet === 0) return;

    const currentDeck = needsNewDeck(gameState.deck) ? createDeck() : gameState.deck;
    console.log('Initial deck size:', currentDeck.length);

    const playerCards = [currentDeck.pop()!, currentDeck.pop()!];
    const dealerCards = [currentDeck.pop()!, currentDeck.pop()!];
    console.log('After dealing all cards:', currentDeck.length);

    // Clear hands first
    setGameState(prev => ({
      ...prev,
      playerHand: { cards: [], score: 0, isBusted: false },
      dealerHand: { cards: [], score: 0, isBusted: false },
      deck: currentDeck,
      gameStatus: 'dealing',
      message: 'Dealing cards...',
      previousBet: gameState.currentBet,
      revealIndex: -1
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
      deck: currentDeck,
      gameStatus: 'dealing',
      message: 'Dealing cards...',
    }));
    setDisplayedCardCount(currentDeck.length);
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
    console.log('After first dealer card:', currentDeck.length);
    setDisplayedCardCount(currentDeck.length);
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
    console.log('After second player card:', currentDeck.length);
    setDisplayedCardCount(currentDeck.length);
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
    console.log('After second dealer card:', currentDeck.length);
    setDisplayedCardCount(currentDeck.length);
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

    setDisplayedCardCount(newDeck.length);
  };

  const handleDealerTurn = async (currentGameState = gameState) => {
    const playerHandCopy = JSON.parse(JSON.stringify(currentGameState.playerHand));

    const newState: GameState = { 
      ...currentGameState, 
      gameStatus: 'dealerTurn' as const,
      playerHand: playerHandCopy
    };
    let currentState = { ...newState };
    currentState.revealIndex = 1;

    await new Promise(resolve => setTimeout(resolve, REVEAL_DELAY));
    setGameState(prev => ({ 
      ...prev, 
      gameStatus: 'dealerTurn',
      revealIndex: 1,
      message: "Dealer's turn...",
      playerHand: playerHandCopy
    }));

    while (shouldDealerHit(currentState.dealerHand.score)) {
      await new Promise(resolve => setTimeout(resolve, REVEAL_DELAY));

      const newCard = currentState.deck.pop()!;
      const newCards = [...currentState.dealerHand.cards, newCard];
      const newScore = calculateHandScore(newCards);
      const isBusted = newScore > 21;

      currentState = {
        ...currentState,
        dealerHand: {
          cards: newCards,
          score: newScore,
          isBusted: isBusted
        },
        revealIndex: currentState.revealIndex + 1,
        playerHand: playerHandCopy
      };

      setGameState(prev => ({
        ...prev,
        dealerHand: currentState.dealerHand,
        revealIndex: currentState.revealIndex,
        playerHand: playerHandCopy,
        message: currentState.dealerHand.isBusted ? "Dealer busts!" : "Dealer's turn..."
      }));

      if (isBusted) break; // Stop if dealer busts
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const result = calculateWinnings(
      currentState.dealerHand.score,
      currentState.playerHand.score,
      currentState.currentBet,
      currentState.dealerHand.isBusted
    );

    const isWin = result.amount > currentState.currentBet;
    const newChips = currentGameState.chips + result.amount;

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
          amount: currentGameState.currentBet,
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

    if (newHand.isBusted) {
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
      // Create a deep copy of the current state for dealer's turn
      const stateForDealerTurn = {
        ...gameState,
        deck: newDeck,
        playerHand: { ...newHand },
        currentBet: newBet,
        chips: gameState.chips - gameState.currentBet
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      await handleDealerTurn(stateForDealerTurn); // Pass the current state to dealer turn
    }
  };

  // Add canDoubleDown check
  const canDoubleDown = 
    gameState.gameStatus === 'playing' && 
    gameState.playerHand.cards.length === 2 && 
    gameState.chips >= gameState.currentBet;

  console.log(gameState.bettingHistory)

  const needsNewDeck = (deck: Card[]) => {
    return deck.length < MIN_CARDS_BEFORE_SHUFFLE;
  };

  return {
    gameState,
    displayedCardCount,
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