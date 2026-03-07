export interface GameHistoryItem {
  id: number;
  game_type: 'Pong' | 'RPS';
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