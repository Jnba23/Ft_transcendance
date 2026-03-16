import { useEffect, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { Choice, GameState, RoundResult, GameOverData } from '../types/rps';
import { useNavigate } from 'react-router-dom';
import { useErrorStore } from '@stores/error.store';

export const useRPSGame = (socket: Socket | null, gameId: string) => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myChoice, setMyChoice] = useState<Choice | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [gameOver, setGameOver] = useState<GameOverData | null>(null);
  const [waitingForOpp, setWaitingForOpp] = useState(false);
  const [opDisconnected, setOpDisconnected] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const makeChoice = useCallback(
    (choice: Choice) => {
      socket?.emit('make-choice', { choice });
      setMyChoice(choice);
      setCountdown(null);
    },
    [socket]
  );

  const showError = useErrorStore((state) => state.showError);

  // Effect to handle join-game
  useEffect(() => {
    if (!gameId) return;
    if (!socket) return;

    const onConnect = () => {
      socket.emit('join-game', { gameId });
    };

    if (socket.connected) onConnect();
    else socket.on('connect', onConnect);

    socket.on(
      'joined-game',
      (data: { gameId: string; gameState: GameState }) => {
        console.log('🟢 Received joined-game:', data);

        setGameState(data.gameState);
        if (data.gameState.phase === 'choosing') {
          setCountdown(5);
          setMyChoice(null);
          setRoundResult(null);
          setWaitingForOpp(false);
        }
      }
    );

    socket.on('error', (data: { message: string }) => {
      console.error('Game error', data.message);
      showError(data.message);
      if (
        data.message === 'Game session not found' ||
        data.message === 'Unauthorized' ||
        data.message === 'Not part of this game' ||
        data.message === 'Already connected from another tab'
      ) {
        setTimeout(() => navigate('/dashboard'), 0);
      }
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('joined-game');
      socket.off('error');
    };
  }, [gameId, socket, navigate, showError]);

  // Effect to handle game events
  useEffect(() => {
    if (!socket) return;

    socket.on('game-start', () => {
      setGameState((prev) => {
        if (!prev) return null;
        return { ...prev, phase: 'choosing' };
      });
      setMyChoice(null);
      setRoundResult(null);
      setCountdown(5);
    });

    socket.on(
      'auto-choice-made',
      (data: { message: string; choice: Choice }) => {
        setWaitingForOpp(true);
        makeChoice(data.choice);
      }
    );

    socket.on('choice-recorded', () => {
      setWaitingForOpp(true);
    });

    socket.on('round-results', (data: RoundResult) => {
      setRoundResult(data);
      setGameState((prev) => {
        return prev
          ? {
              ...prev,
              currentRound: data.round,
              player1: { ...prev.player1, score: data.p1Score },
              player2: { ...prev.player2, score: data.p2Score },
              phase: 'revealing',
            }
          : null;
      });
      setWaitingForOpp(false);
      setMyChoice(null);
    });

    socket.on('new-round', (data: { round: number; message: string }) => {
      setGameState((prev) => {
        if (!prev) return null;
        return { ...prev, currentRound: data.round, phase: 'choosing' };
      });
      setRoundResult(null);
      setMyChoice(null);
      setCountdown(5);
    });

    socket.on('game-over', (data: GameOverData) => {
      setGameOver(data);
      setGameState((prev) => {
        if (!prev) return null;
        const matchData = {
          player1Id: prev.player1.userId,
          player2Id: prev.player2.userId,
          player1Score: data.finalScore.player1,
          player2Score: data.finalScore.player2,
          player1Name: prev.player1.name,
          player2Name: prev.player2.name,
          winnerId: data.winnerId,
        };
        setTimeout(() => {
          socket.disconnect();
          navigate('/end_match', {
            state: { matchData, gameType: 'rps' },
          });
        }, 50);
        return { ...prev, phase: 'game-over' };
      });
    });

    socket.on('opponent-disconnected', () => {
      setOpDisconnected(true);
    });

    socket.on('opponent-reconnected', () => {
      setOpDisconnected(false);
    });

    return () => {
      socket.off('game-start');
      socket.off('choice-recorded');
      socket.off('round-results');
      socket.off('new-round');
      socket.off('game-over');
      socket.off('auto-choice-made');
      socket.off('opponent-disconnected');
      socket.off('opponent-reconnected');
    };
  }, [socket, makeChoice]);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  return {
    gameState,
    myChoice,
    roundResult,
    gameOver,
    waitingForOpp,
    opDisconnected,
    countdown,
    makeChoice,
  };
};
