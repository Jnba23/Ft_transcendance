import { useRef, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { createPongSocket } from '@services/game/socket';
import { useKeyboard } from '../../hooks/useKeyboard';
import { render } from '../../game/renderer';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../../game/constants';
import type { GameState } from '../../types/game.types';
import { useNavigate, useParams } from 'react-router-dom';
import { useErrorStore } from '@stores/error.store';

const PongGame = () => {
  // Refs
  const socketRef = useRef<Socket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // State
  const [state, setState] = useState<GameState | null>(null);
  const [isMatched, setIsMatched] = useState(false);
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [seconds, setSeconds] = useState(10);

  // External hooks
  const keys = useKeyboard();

  // Derived values
  const gameStarted = state?.isPlaying ?? false;

  const { gameId } = useParams();
  const navigate = useNavigate();
  const showError = useErrorStore((state) => state.showError);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    const socket = createPongSocket();
    socketRef.current = socket;
    return () => {
      mountedRef.current = false;
      setTimeout(() => {
        if (!mountedRef.current) socket.disconnect();
      }, 100);
    };
  }, []);

  useEffect(() => {
    if (!gameId) return;
    const socket = socketRef.current;
    if (!socket) return;

    const onConnect = () => socket.emit('join-game', { gameId });

    if (socket.connected) onConnect();
    else socket.on('connect', onConnect);

    socket.on('game_init', (data) => {
      setState(data.state);
      setPlayer1Name(data.player1N);
      setPlayer2Name(data.player2N);
      setIsMatched(true);
      if (ctxRef.current) render(ctxRef.current, data.state);
    });

    socket.on('error', (err) => {
      showError(err.message);
      if (
        err.message === 'Game session not found' ||
        err.message === 'Unauthorized' ||
        err.message === 'Not part of this game' ||
        err.message === 'Already connected from another tab'
      ) {
        socket.disconnect();
        navigate('/dashboard');
      }
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('game_init');
      socket.off('error');
    };
  }, [gameId, navigate, showError]);

  useEffect(() => {
    if (!isMatched || gameStarted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        socketRef.current?.emit('start_game');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMatched, gameStarted]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleUpdate = (newState: GameState) => {
      setState(newState);
      if (ctxRef.current) render(ctxRef.current, newState);
    };

    socket.on('game_update', handleUpdate);

    return () => {
      socketRef.current?.off('game_update', handleUpdate);
    };
  }, []);

  useEffect(() => {
    let finalStats: GameState | null = null;

    const handleMatchResults = (data: GameState) => (finalStats = data);

    const handleGameEnd = () => {
      setTimeout(() => {
        socketRef.current?.disconnect();
        navigate('/end_match', {
          state: { matchData: finalStats, gameType: 'pong' },
        });
      }, 2000);
    };

    const handleGameAborted = () => {
      socketRef.current?.disconnect();
      showError('Opponent disconnected. Game aborted.');
      navigate('/start_game/Pong');
    };

    socketRef.current?.on('match_results', handleMatchResults);
    socketRef.current?.on('player_left', handleGameEnd);
    socketRef.current?.on('game_over', handleGameEnd);
    socketRef.current?.on('game_aborted', handleGameAborted);

    return () => {
      socketRef.current?.off('match_results', handleMatchResults);
      socketRef.current?.off('player_left', handleGameEnd);
      socketRef.current?.off('game_over', handleGameEnd);
      socketRef.current?.off('game_aborted', handleGameAborted);
    };
  }, [navigate, showError]);

  // wait Timer
  useEffect(() => {
    if (!state?.isPaused || !state?.isPlaying) {
      setSeconds(10);
      return;
    }
    const intervalId = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, [state?.isPaused, state?.isPlaying]);

  const formatTimer: () => string = () => {
    const sec = seconds;
    const nothing: string = '';
    return `${sec <= 9 ? 0 : nothing}${sec}`;
  };
  // end wait Timer

  useEffect(() => {
    if (!gameId) return;
    socketRef.current?.emit('input', keys);
  }, [keys, gameId]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctxRef.current = ctx;
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full bg-background-dark p-4 gap-4">
      {state?.isPaused && state?.isPlaying ? (
        <span className="text-white/60 text-[2rem] font-light tracking-wide">
          {formatTimer()}
        </span>
      ) : (
        <div className="h-8"></div>
      )}
      <div className="flex justify-between items-center w-full max-w-200 px-4">
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-bold text-white">
            {state?.score.player1 ?? 0}
          </span>
          <span className="text-2xl text-white/50">{player1Name}</span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-2xl text-white/50">{player2Name}</span>
          <span className="text-5xl font-bold text-white">
            {state?.score.player2 ?? 0}
          </span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={BOARD_WIDTH}
        height={BOARD_HEIGHT}
        className="border-2 border-blue-600/50 rounded-lg max-w-full h-auto"
      />

      {!gameStarted && (
        <div className="text-white/60 text-sm text-center">
          {!isMatched
            ? 'Waiting for opponent...'
            : `Press SPACE to start (P1: ${state?.player1Ready ? 'Ready' : 'Waiting'} | P2: ${state?.player2Ready ? 'Ready' : 'Waiting'})`}
        </div>
      )}
    </div>
  );
};

export default PongGame;
