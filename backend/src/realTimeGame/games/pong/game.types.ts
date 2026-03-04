export interface Position {
  x: number;
  y: number;
}
export interface Velocity {
  dx: number;
  dy: number;
}
export interface BallState {
  position: Position;
  velocity: Velocity;
}
export interface PaddleState {
  y: number;
}
export interface Score {
  player1: number;
  player2: number;
}

export interface GameState {
  ball: BallState;
  paddle1: PaddleState;
  paddle2: PaddleState;
  score: Score;
  player1Ready: boolean;
  player2Ready: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  winner: 'player1' | 'player2' | null;
}

export interface KeyboardState {
  up: boolean;
  down: boolean;
}
