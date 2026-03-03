import { useRef, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useKeyboard } from '../../hooks/useKeyboard';
import { render } from '../../game/renderer';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../../game/constants';
import type { GameState } from '../../types/game.types';
import { useNavigate, useParams } from 'react-router-dom';

const pongSocket: Socket = io('http://localhost:3000/pong', {
  withCredentials: true,
});

const PongGame = () => {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // State
  const [state, setState] = useState<GameState | null>(null);
  const [isMatched, setIsMatched] = useState(false);
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [seconds, setSeconds] = useState(0);

  // External hooks
  const keys = useKeyboard();

  // Derived values
  const gameStarted = state?.isPlaying ?? false;

  const { gameId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    let finalStats: GameState | null = null;

    const handleMatchResults = (data: GameState) => {
      finalStats = data;
      // console.log(finalStats);
    };

    const handleGameEnd = () => {
      setTimeout(() => {
        navigate('/end_match', { state: { matchData: finalStats } });
      }, 2000);
    };

    const handleGameAborted = () => {
      navigate('/dashboard');
    };

    pongSocket.on('match_results', handleMatchResults);
    pongSocket.on('player_left', handleGameEnd);
    pongSocket.on('game_over', handleGameEnd);
    pongSocket.on('game_aborted', handleGameAborted);

    return () => {
      pongSocket.off('match_results', handleMatchResults);
      pongSocket.off('player_left', handleGameEnd);
      pongSocket.off('game_over', handleGameEnd);
      pongSocket.off('game_aborted', handleGameAborted);
    };
  }, [navigate]);

  useEffect(() => {
    if (!gameId) return;
    pongSocket.emit('join-game', { gameId });
    pongSocket.on('game_init', (data) => {
      setState(data.state);
      setPlayer1Name(data.player1N);
      setPlayer2Name(data.player2N);
      setIsMatched(true);
    });

    pongSocket.on('error', (err) => {
      if (
        err.message === 'Game session not found' ||
        err.message === 'Unauthorized' ||
        err.message === 'Not part of this game'
      ) {
        navigate('/dashboard');
      } else if (err.message === 'Already connected from another tab')
        navigate('/profile');
    });

    return () => {
      pongSocket.off('game_init');
      pongSocket.off('error');
    };
  }, [gameId, navigate]);

  useEffect(() => {
    pongSocket.on('game_update', (newState: GameState) => {
      setState(newState);
      if (ctxRef.current) render(ctxRef.current, newState);
    });

    return () => {
      pongSocket.off('game_update');
    };
  }, [seconds]);

  // wait Timer
  useEffect(() => {
    if (!state?.isPaused || !state?.isPlaying) {
      setSeconds(0);
      return;
    }
    const intervalId = setInterval(() => {
      setSeconds((s) => s + 1);
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
    pongSocket.emit('input', keys);
  }, [keys, gameId]);

  useEffect(() => {
    if (!isMatched || gameStarted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        pongSocket.emit('start_game');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMatched, gameStarted]);

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
