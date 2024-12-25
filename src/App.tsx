import { useEffect, useState } from "react";
import styled from "styled-components";
import Confetti from "react-confetti";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  selectGameState,
  selectCanDoubleDown,
  selectDisplayedCardCount,
  selectCanBet,
  selectCanDealCards,
} from "./store/selectors";
import {
  startNewGame,
  resetGame,
  placeBet,
  transitionToBetting,
  clearBet,
} from "./store/gameSlice";
import {
  startNewHand,
  handleHit,
  handleDealerTurn,
  placePreviousBet,
  handleDoubleDown,
  handleStand,
} from "./store/gameThunks";
import Hand from "./components/Hand";
import Controls from "./components/Controls";
import Chips from "./components/Chips";
import BettingHistory from "./components/BettingHistory";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { RootState } from "./store/store";
import StatsDisplay from "./components/StatsDisplay";
import OptionsMenu from "./components/OptionsMenu";
import { loadOptions, saveOptions } from "./utils/optionsStorage";
import { AppDispatch } from "./types/store";

// Main container for the entire app
const AppContainer = styled.div`
  min-height: 100vh;
  background-image: linear-gradient(to bottom right, #166534, #14532d);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
`;
AppContainer.displayName = "AppContainer";

// Container for the game area with green background
const BlackjackTable = styled.div`
  background-color: #15803d;
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  width: 100%;
  max-width: 1200px;
  height: 100vh;
  max-height: 1200px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
  position: relative;

  @media (min-width: 768px) {
    padding: 2.5rem;
    flex-direction: row;
    gap: 2rem;
    height: 95vh;
  }
`;
BlackjackTable.displayName = "BlackjackTable";

// Left sidebar containing betting history and stats
const Sidebar = styled.div`
  display: none;
  width: 250px;
  flex-shrink: 0;
  border-right: 1px solid #16a34a;

  @media (min-width: 768px) {
    display: block;
  }
`;
Sidebar.displayName = "Sidebar";

// Right side content area containing game and controls
const MainContent = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;
MainContent.displayName = "MainContent";

// Top bar containing title and options
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    margin-bottom: 2rem;
  }
`;
Header.displayName = "Header";

// Game title text
const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;

  @media (min-width: 768px) {
    font-size: 2.25rem;
  }
`;
Title.displayName = "Title";

// Cards remaining counter text
const CardCount = styled.div`
  font-size: 0.75rem;
  color: #e2e8f0;

  @media (min-width: 768px) {
    font-size: 0.875rem;
  }
`;
CardCount.displayName = "CardCount";

// Green area containing the game table
const PlayingField = styled.div`
  flex-grow: 1;
  background-color: #166534;
  border-radius: 0.75rem;
  padding: 1rem;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: visible;
  min-height: 400px;
  max-height: 60vh;

  @media (min-width: 768px) {
    padding: 2rem;
    min-height: 500px;
  }
`;
PlayingField.displayName = "PlayingField";

// Area containing chips and game controls
const ActionPanel = styled.div`
  margin-top: auto;
  padding-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: sticky;
  bottom: 0;
  background-color: #15803d;
  z-index: 10;

  @media (min-width: 768px) {
    margin-top: 1rem;
    gap: 1rem;
    position: relative;
  }
`;
ActionPanel.displayName = "ActionPanel";

// Container for stats display in sidebar
const StatsContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #166534;
  border-radius: 0.5rem;
`;
StatsContainer.displayName = "StatsContainer";

// Container for dealer/player hands and message
const TableLayout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
  height: 100%;
  padding: 0;
  position: relative;

  @media (min-width: 768px) {
    padding: 1.5rem 0;
  }
`;
TableLayout.displayName = "TableLayout";

// Container for individual hands (dealer or player)
const CardHand = styled.div<{ isDealer?: boolean }>`
  width: 100%;
  position: relative;
  height: 250px;
  display: flex;
  justify-content: center;
  align-items: ${({ isDealer }) => (isDealer ? "flex-start" : "flex-end")};
  overflow: visible;
  padding: 1rem;
  margin: ${({ isDealer }) => (isDealer ? "0 0 1rem 0" : "1rem 0 2rem 0")};

  @media (min-width: 768px) {
    height: 300px;
    padding: 1.5rem;
  }
`;
CardHand.displayName = "CardHand";

// Game status message display
const GameMessage = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  text-align: center;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: #15803d;
  width: 100%;
  z-index: 10;

  @media (min-width: 768px) {
    font-size: 1.25rem;
    padding: 1rem;
  }
`;
GameMessage.displayName = "GameMessage";

// Container for control buttons
const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;

  @media (min-width: 768px) {
    gap: 1rem;
  }
`;
ButtonGroup.displayName = "ButtonGroup";

function App() {
  const dispatch = useAppDispatch() as ThunkDispatch<
    RootState,
    unknown,
    UnknownAction
  > &
    AppDispatch;
  const gameState = useAppSelector(selectGameState);
  const canDoubleDown = useAppSelector(selectCanDoubleDown);
  const displayedCardCount = useAppSelector(selectDisplayedCardCount);
  const canBet = useAppSelector(selectCanBet);
  const canDealCards = useAppSelector(selectCanDealCards);

  // Add to state
  const [showConfetti, setShowConfetti] = useState(
    () => loadOptions().showConfetti
  );
  const [showCardCount, setShowCardCount] = useState(
    () => loadOptions().showCardCount
  );

  // Action handlers
  const handleStartNewHand = () => dispatch(startNewHand());
  const handlePlayerHit = () => dispatch(handleHit());
  const handlePlayerStand = async () => {
    try {
      await dispatch(handleStand()).unwrap();
    } catch (error) {
      console.error("Error during stand:", error);
    }
  };
  const handlePlacePreviousBet = async (multiplier = 1) => {
    await dispatch(placePreviousBet(multiplier));
  };
  const handleStartNewGame = () => dispatch(startNewGame());
  const handleResetGame = () => dispatch(resetGame());
  const handlePlaceBet = (amount: number) => {
    dispatch(placeBet(amount));
  };
  const doubleDown = async () => {
    try {
      const result = await dispatch(handleDoubleDown()).unwrap();
      if (result && !result.isBusted) {
        await dispatch(handleDealerTurn()).unwrap();
      }
    } catch (error) {
      console.error("Error during double down:", error);
    }
  };
  const handleClearBet = () => {
    dispatch(clearBet());
  };

  useEffect(() => {
    if (gameState.nextGameStatus) {
      console.log("Setting up transition timer with:", {
        nextStatus: gameState.nextGameStatus,
        nextMessage: gameState.nextMessage,
      });
      const timer = setTimeout(() => {
        console.log("Transitioning to betting state");
        dispatch(transitionToBetting());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [gameState.nextGameStatus, dispatch, gameState.nextMessage]);

  // Watch for wins and trigger confetti

  // Add handlers to save options when changed
  const handleToggleConfetti = () => {
    setShowConfetti((prev) => {
      const newValue = !prev;
      saveOptions({ showConfetti: newValue, showCardCount });
      return newValue;
    });
  };

  const handleToggleCardCount = () => {
    setShowCardCount((prev) => {
      const newValue = !prev;
      saveOptions({ showConfetti, showCardCount: newValue });
      return newValue;
    });
  };

  return (
    <ErrorBoundary>
      {showConfetti && gameState.showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      <AppContainer>
        <BlackjackTable>
          <Sidebar>
            <BettingHistory bets={gameState.bettingHistory} />
            <StatsContainer>
              <StatsDisplay
                wins={gameState.stats.totalWins}
                losses={gameState.stats.totalLosses}
                pushes={gameState.stats.totalPushes}
              />
            </StatsContainer>
          </Sidebar>

          <MainContent>
            <Header>
              <Title>Blackjack</Title>
              <div className="flex items-center gap-4">
                {showCardCount && (
                  <CardCount>Cards Remaining: {displayedCardCount}</CardCount>
                )}
                <OptionsMenu
                  showConfetti={showConfetti}
                  showCardCount={showCardCount}
                  onToggleConfetti={handleToggleConfetti}
                  onToggleCardCount={handleToggleCardCount}
                />
              </div>
            </Header>

            <PlayingField>
              <TableLayout>
                <CardHand isDealer>
                  <Hand
                    hand={gameState.dealerHand}
                    isDealer
                    hideHoleCard={gameState.gameStatus === "playing"}
                    revealIndex={gameState.revealIndex}
                  />
                </CardHand>

                <GameMessage>{gameState.message}</GameMessage>

                <CardHand>
                  <Hand hand={gameState.playerHand} />
                </CardHand>
              </TableLayout>
            </PlayingField>

            <ActionPanel>
              <Chips
                chips={gameState.chips}
                currentBet={gameState.currentBet}
                onPlaceBet={handlePlaceBet}
                canBet={canBet}
              />

              <ButtonGroup>
                <Controls
                  onHit={handlePlayerHit}
                  onStand={handlePlayerStand}
                  onDoubleDown={doubleDown}
                  onNewGame={handleStartNewGame}
                  onReset={handleResetGame}
                  onPlacePreviousBet={handlePlacePreviousBet}
                  onDeal={handleStartNewHand}
                  gameStatus={gameState.gameStatus}
                  previousBet={gameState.previousBet}
                  chips={gameState.chips}
                  canDoubleDown={canDoubleDown}
                  canDealCards={canDealCards}
                  onClearBet={handleClearBet}
                  currentBet={gameState.currentBet}
                />
              </ButtonGroup>
            </ActionPanel>
          </MainContent>
        </BlackjackTable>
      </AppContainer>
    </ErrorBoundary>
  );
}

export default App;
