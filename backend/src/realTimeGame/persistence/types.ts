export type Choice = 'rock' | 'paper' | 'scissors';
export type GamePhase = 'waiting' | 'revealing' | 'game-over';

export interface PlayerState {
  userId: number;
  name: string;
  score: number;
  currentChoice?: Choice;
  isConnected: boolean;
  socketId: string;
}
export interface RpsGameState {
  gameId: string;
  player1: PlayerState;
  player2: PlayerState;
  currentRound: number;
  roundsToWin: number; //say we play best 2 five : first player to reach score 3 wins
  phase: GamePhase;
  winner: number | null; // userId
  timers: {
    autoChoice?: NodeJS.Timeout;
    reconnection?: NodeJS.Timeout;
    roundReveal?: NodeJS.Timeout;
    cleanup?: NodeJS.Timeout;
  };
}

export interface GameHistoryItem {
  id: number;
  game_type: 'pong' | 'RPS';
  player1_id: number;
  player2_id: number;
  player1_score: number;
  player2_score: number;
  winner_id: number;
  created_at: string; // or Date depending on DB
  opponent_name: string;
  opponent_id: number;
  result: 'win' | 'loss';
}

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
  RPS_winstreak: number;

  pong_win_rate: number;
  RPS_win_rate: number;
}

export interface LeaderboardRow {
  id: number;
  username: string;
  avatar_url: string;
  wins: number;
  rank: number;
}
