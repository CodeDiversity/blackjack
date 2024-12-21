import { useEffect } from "react";
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

const AppContainer = styled.div`
  min-height: 100vh;
  background-image: linear-gradient(to bottom right, #166534, #14532d);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
`;

const GameContainer = styled.div`
  background-color: #15803d;
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  width: 100%;
  max-width: 1000px;
  min-height: 500px;
  height: 700px;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 768px) {
    padding: 2rem;
    flex-direction: row;
    gap: 2rem;
  }
`;

const Sidebar = styled.div`
  display: none;
  width: 250px;
  flex-shrink: 0;
  border-right: 1px solid #16a34a;

  @media (min-width: 768px) {
    display: block;
  }
`;

const MainContent = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;

  @media (min-width: 768px) {
    font-size: 2.25rem;
  }
`;

const CardCount = styled.div`
  font-size: 0.75rem;
  color: #e2e8f0;

  @media (min-width: 768px) {
    font-size: 0.875rem;
  }
`;

const GameArea = styled.div`
  flex-grow: 1;
  background-color: #166534;
  border-radius: 0.75rem;
  padding: 0.75rem;
  position: relative;

  @media (min-width: 768px) {
    padding: 1.5rem;
  }
`;

const ControlsArea = styled.div`
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  @media (min-width: 768px) {
    margin-top: 2rem;
    gap: 1.5rem;
  }
`;

const StatsContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #166534;
  border-radius: 0.5rem;
`;

const GameContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-height: 400px;

  @media (min-width: 768px) {
    min-height: 500px;
  }
`;

const HandContainer = styled.div<{ isDealer?: boolean }>`
  width: 100%;
  margin-top: ${({ isDealer }) => (isDealer ? "0.5rem" : "0")};
  margin-bottom: ${({ isDealer }) => (isDealer ? "0" : "2rem")};

  @media (min-width: 768px) {
    margin-top: ${({ isDealer }) => (isDealer ? "1rem" : "0")};
    margin-bottom: ${({ isDealer }) => (isDealer ? "0" : "3rem")};
  }
`;

const Message = styled.div`
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

const ControlsWrapper = styled.div`
  display: flex;
  gap: 0.5rem;

  @media (min-width: 768px) {
    gap: 1rem;
  }
`;

function App() {
  const dispatch = useAppDispatch() as ThunkDispatch<
    RootState,
    unknown,
    UnknownAction
  >;
  const gameState = useAppSelector(selectGameState);
  const canDoubleDown = useAppSelector(selectCanDoubleDown);
  const displayedCardCount = useAppSelector(selectDisplayedCardCount);
  const canBet = useAppSelector(selectCanBet);
  const canDealCards = useAppSelector(selectCanDealCards);

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
  const handlePlacePreviousBet = () => dispatch(placePreviousBet());
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

  return (
    <ErrorBoundary>
      {gameState.showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      <AppContainer>
        <GameContainer>
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
              <CardCount>Cards Remaining: {displayedCardCount}</CardCount>
            </Header>

            <GameArea>
              <GameContent>
                <HandContainer isDealer>
                  <Hand
                    hand={gameState.dealerHand}
                    isDealer
                    hideHoleCard={gameState.gameStatus === "playing"}
                    revealIndex={gameState.revealIndex}
                  />
                </HandContainer>

                <Message>{gameState.message}</Message>

                <HandContainer>
                  <Hand hand={gameState.playerHand} />
                </HandContainer>
              </GameContent>
            </GameArea>

            <ControlsArea>
              <Chips
                chips={gameState.chips}
                currentBet={gameState.currentBet}
                onPlaceBet={handlePlaceBet}
                canBet={canBet}
              />

              <ControlsWrapper>
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
                />
              </ControlsWrapper>
            </ControlsArea>
          </MainContent>
        </GameContainer>
      </AppContainer>
    </ErrorBoundary>
  );
}

export default App;
