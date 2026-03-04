import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_MARGIN,
  BALL_RADIUS,
  COLORS,
} from './constants';
import type { GameState } from '../types/game.types';

const clearCanvas = (ctx: CanvasRenderingContext2D): void => {
  ctx.fillStyle = COLORS.board;
  ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

  ctx.strokeStyle = COLORS.centerLine;
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(BOARD_WIDTH / 2, 0);
  ctx.lineTo(BOARD_WIDTH / 2, BOARD_HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);
};

const drawPaddle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
): void => {
  ctx.fillStyle = COLORS.paddle;
  ctx.beginPath();
  ctx.roundRect(x, y, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_WIDTH / 2);
  ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;
};

const drawBall = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
): void => {
  ctx.fillStyle = COLORS.ball;
  ctx.beginPath();
  ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
  ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
  ctx.shadowBlur = 15;
  ctx.fill();
  ctx.shadowBlur = 0;
};

const drawOverlay = (
  ctx: CanvasRenderingContext2D,
  title: string,
  subtitle: string,
  opacity = 0.7
): void => {
  ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
  ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  ctx.fillStyle = COLORS.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 48px Arial';
  ctx.fillText(title, BOARD_WIDTH / 2, BOARD_HEIGHT / 2 - 30);
  ctx.font = '20px Arial';
  ctx.fillText(subtitle, BOARD_WIDTH / 2, BOARD_HEIGHT / 2 + 30);
};

export const render = (
  ctx: CanvasRenderingContext2D,
  state: GameState
): void => {
  clearCanvas(ctx);
  drawPaddle(ctx, PADDLE_MARGIN, state.paddle1.y);
  drawPaddle(ctx, BOARD_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, state.paddle2.y);
  drawBall(ctx, state.ball.position.x, state.ball.position.y);

  if (state.winner) {
    drawOverlay(
      ctx,
      `${state.winner === 'player1' ? 'Player 1' : 'Player 2'} Wins!`,
      ''
    );
  } else if (state.isPaused && state.isPlaying)
    drawOverlay(ctx, 'Reconnecting...', 'Waiting for opponent...');
};
