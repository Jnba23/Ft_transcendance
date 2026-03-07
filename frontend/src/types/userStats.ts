export interface UserStats {
  username: string;
  level: number;
  created_at: string;

  pong_wins: number;
  pong_losses: number;
  pong_games_played: number;
  pong_winStreak: number;

  RPS_wins: number;
  RPS_losses: number;
  RPS_games_played: number;
  RPS_winStreak: number;

  pong_win_rate: number;
  RPS_win_rate: number;
}