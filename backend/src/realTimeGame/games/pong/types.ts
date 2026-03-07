import { GameState, KeyboardState } from './game.types.js';

export interface PongPlayer {
  userId: number;
  name: string;
  socketId: string;
  isConnected: boolean;
  isReady: boolean;
}

export interface PongGameState {
  gameId: string;
  player1: PongPlayer;
  player2: PongPlayer;
  state: GameState;
  player1Keys: KeyboardState;
  player2Keys: KeyboardState;
  intervalId?: NodeJS.Timeout;
  reconnectionTimer?: NodeJS.Timeout;
  winner: number | null;
}
