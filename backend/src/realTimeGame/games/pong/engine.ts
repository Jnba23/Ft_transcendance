import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_SPEED,
  PADDLE_MARGIN,
  BALL_RADIUS,
  BALL_INITIAL_SPEED,
  WINNING_SCORE,
} from './constants.js';

import type { GameState, KeyboardState } from './game.types.js';

const MAX_SPEED = 1200;

export const createInitialGameState = (): GameState => {
  const dirX = Math.random() > 0.5 ? 1 : -1;
  return {
    ball: {
      position: { x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2 },
      velocity: {
        dx: BALL_INITIAL_SPEED * dirX,
        dy: (Math.random() - 0.5) * BALL_INITIAL_SPEED,
      },
    },
    paddle1: { y: (BOARD_HEIGHT - PADDLE_HEIGHT) / 2 },
    paddle2: { y: (BOARD_HEIGHT - PADDLE_HEIGHT) / 2 },
    score: { player1: 0, player2: 0 },
    player1Ready: false,
    player2Ready: false,
    isPlaying: false,
    isPaused: false,
    winner: null,
  };
};

const resetBall = (state: GameState, dir: number): GameState => ({
  ...state,
  ball: {
    position: { x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2 },
    velocity: {
      dx: BALL_INITIAL_SPEED * dir,
      dy: (Math.random() - 0.5) * BALL_INITIAL_SPEED,
    },
  },
});

const movePaddles = (
  state: GameState,
  p1Keys: KeyboardState,
  p2Keys: KeyboardState,
  dt: number
) => {
  const move = PADDLE_SPEED * dt;
  const clamp = (v: number) =>
    Math.max(0, Math.min(BOARD_HEIGHT - PADDLE_HEIGHT, v));
  return {
    p1y: clamp(
      state.paddle1.y + (p1Keys.down ? move : 0) - (p1Keys.up ? move : 0)
    ),
    p2y: clamp(
      state.paddle2.y + (p2Keys.down ? move : 0) - (p2Keys.up ? move : 0)
    ),
  };
};

const checkScore = (
  state: GameState,
  x: number,
  p1y: number,
  p2y: number
): { scored: boolean; next: GameState } => {
  const score = (scorer: 'player1' | 'player2', dir: number): GameState => {
    const s = state.score[scorer] + 1;
    return resetBall(
      {
        ...state,
        paddle1: { y: p1y },
        paddle2: { y: p2y },
        score: { ...state.score, [scorer]: s },
        winner: s >= WINNING_SCORE ? scorer : null,
        isPlaying: s < WINNING_SCORE,
      },
      dir
    );
  };

  if (x - BALL_RADIUS <= 0) return { scored: true, next: score('player2', 1) };
  if (x + BALL_RADIUS >= BOARD_WIDTH)
    return { scored: true, next: score('player1', -1) };
  return { scored: false, next: state };
};

export const updateGame = (
  state: GameState,
  p1Keys: KeyboardState,
  p2Keys: KeyboardState,
  dt: number
): GameState => {
  if (!state.isPlaying || state.isPaused) return state;

  const { p1y, p2y } = movePaddles(state, p1Keys, p2Keys, dt);

  // Update position
  let x = state.ball.position.x + state.ball.velocity.dx * dt;
  let y = state.ball.position.y + state.ball.velocity.dy * dt;
  let dx = state.ball.velocity.dx;
  let dy = state.ball.velocity.dy;

  // Wall bounce (top / bottom)
  if (y <= BALL_RADIUS) {
    y = BALL_RADIUS;
    dy = -dy;
  } else if (y >= BOARD_HEIGHT - BALL_RADIUS) {
    y = BOARD_HEIGHT - BALL_RADIUS;
    dy = -dy;
  }

  // Paddle bounce (left / right)
  const p1x = PADDLE_MARGIN;
  const p2x = BOARD_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH;

  if (
    x - BALL_RADIUS <= p1x + PADDLE_WIDTH &&
    x + BALL_RADIUS >= p1x &&
    y - BALL_RADIUS <= p1y + PADDLE_HEIGHT &&
    y + BALL_RADIUS >= p1y &&
    dx < 0
  ) {
    const speed = Math.min(MAX_SPEED, Math.sqrt(dx * dx + dy * dy) * 1.05);
    const intersectY = y - (p1y + PADDLE_HEIGHT / 2);
    const normalizedIntersectY = Math.max(
      -1,
      Math.min(1, intersectY / (PADDLE_HEIGHT / 2))
    );
    const bounceAngle = normalizedIntersectY * (Math.PI / 4);

    dx = speed * Math.cos(bounceAngle);
    dy = speed * Math.sin(bounceAngle);
    x = p1x + PADDLE_WIDTH + BALL_RADIUS;
  } else if (
    x + BALL_RADIUS >= p2x &&
    x - BALL_RADIUS <= p2x + PADDLE_WIDTH &&
    y - BALL_RADIUS <= p2y + PADDLE_HEIGHT &&
    y + BALL_RADIUS >= p2y &&
    dx > 0
  ) {
    const speed = Math.min(MAX_SPEED, Math.sqrt(dx * dx + dy * dy) * 1.05);
    const intersectY = y - (p2y + PADDLE_HEIGHT / 2);
    const normalizedIntersectY = Math.max(
      -1,
      Math.min(1, intersectY / (PADDLE_HEIGHT / 2))
    );
    const bounceAngle = normalizedIntersectY * (Math.PI / 4);

    dx = -speed * Math.cos(bounceAngle);
    dy = speed * Math.sin(bounceAngle);
    x = p2x - BALL_RADIUS;
  }

  // Check score (ball past a paddle?)
  const { scored, next } = checkScore(state, x, p1y, p2y);
  if (scored) return next;

  return {
    ...state,
    paddle1: { y: p1y },
    paddle2: { y: p2y },
    ball: { position: { x, y }, velocity: { dx, dy } },
  };
};
