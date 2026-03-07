import { getDb } from '../../core/database.js';
import * as RpsTypes from './types.js';

export function saveCompleteGames(data: {
  gameId: string;
  gameType: 'pong' | 'rps';
  player1Id: number;
  player2Id: number;
  player1Name: string;
  player2Name: string;
  winnerId: number;
  player1Score: number;
  player2Score: number;
}): void {
  try {
    const db = getDb();
    const transaction = db.transaction(() => {
      const insertGame = db.prepare(`
				INSERT INTO games(player1_id, player2_id, winner_id, player1_score,
				player2_score, game_type)
				VALUES
				(?, ?, ?, ?, ?, ?)`);
      insertGame.run(
        data.player1Id,
        data.player2Id,
        data.winnerId,
        data.player1Score,
        data.player2Score,
        data.gameType === 'rps' ? 'RPS' : 'pong'
      );
      const winnerId = data.winnerId;
      const loserId =
        winnerId === data.player1Id ? data.player2Id : data.player1Id;
      if (data.gameType === 'rps') {
        const updateWinner = db.prepare(`
					UPDATE users
					SET 
						RPS_wins = RPS_wins + 1,
            RPS_winStreak = RPS_winStreak + 1
					WHERE id = ?`);
        updateWinner.run(winnerId);
        const updateLoser = db.prepare(`
					UPDATE users
					SET
						RPS_losses = RPS_losses + 1,
            RPS_winStreak = 0
					WHERE id = ?`);
        updateLoser.run(loserId);
      } else {
        const updateWinner = db.prepare(`
					UPDATE users
					SET 
						pong_wins = pong_wins + 1,
            pong_winStreak = pong_winStreak + 1
					WHERE id = ?`);
        updateWinner.run(winnerId);
        const updateLoser = db.prepare(`
					UPDATE users
					SET
						pong_losses = pong_losses + 1,
            pong_winStreak = 0
					WHERE id = ?`);
        updateLoser.run(loserId);
      }
    });
    transaction();
  } catch (error) {
    console.log('Failed to save game:', error);
  }
}

export function getUserGameHistory(
  userId: number,
  page: number = 1,
  limit: number = 20,
  gameType?: 'pong' | 'RPS'
): RpsTypes.GameHistoryItem[] {
  const db = getDb();

  const offset = (page - 1) * limit;

  let query = `
		SELECT 
			g.id,
			g.game_type,
			g.player1_id,
			g.player2_id,
			g.player1_score,
			g.player2_score,
			g.winner_id,
			g.created_at,
			CASE
				WHEN g.player1_id = ? THEN u2.username
				ELSE u1.username
			END as opponent_name,
      CASE
        WHEN g.player1_id = ? THEN u2.id
        ELSE u1.id
      END as opponent_id,
			CASE
				WHEN g.winner_id = ? THEN 'win'
				ELSE 'loss'
			END as result
		FROM games g
		JOIN users u1 ON g.player1_id = u1.id
		JOIN users u2 ON g.player2_id = u2.id
		WHERE (g.player1_id = ? OR g.player2_id = ?) AND g.status = 'completed'
  `
  const params: any[] = [userId, userId, userId, userId, userId];

  if (gameType) {
    query += ` AND g.game_type = ?`;
    params.push(gameType);
  }

  query += `
    ORDER BY g.created_at DESC
		LIMIT ? OFFSET ?
  `;

  params.push(limit, offset);

  const stmt = db.prepare(query);

  const games = stmt.all(...params) as RpsTypes.GameHistoryItem[];

  return games;
}

export function getUserGamesCount(userId: number, gameType?: string): number {
  const db = getDb();

  let query = `
    SELECT COUNT (*) as count
    FROM games g
    WHERE (g.player1_id = ? OR g.player2_id = ?)
      AND g.status = 'completed'
  `

  const params: any[] = [userId, userId];

  if (gameType) {
    query += ` AND g.game_type = ?`;
    params.push(gameType);
  }

  const stmt = db.prepare(query);

  const row = stmt.get(...params) as { count: number };

  return row.count;
}

export function getUserStats(userId: number): RpsTypes.UserStats | undefined {
  const db = getDb();
  const stmt = db.prepare<number, RpsTypes.UserStats>(`
      SELECT 
        username,
        level,
        created_at,
        pong_wins,
        pong_losses,
        (pong_wins + pong_losses) as pong_games_played,
        pong_winStreak,
        RPS_wins,
        RPS_losses,
        (RPS_wins + RPS_losses) as RPS_games_played,
        RPS_winStreak,
        CASE 
          WHEN (pong_wins + pong_losses) > 0 
          THEN ROUND((pong_wins * 100.0) / (pong_wins + pong_losses))
          ELSE 0
        END as pong_win_rate,
        CASE 
          WHEN (RPS_wins + RPS_losses) > 0 
          THEN ROUND((RPS_wins * 100.0) / (RPS_wins + RPS_losses))
          ELSE 0
        END as RPS_win_rate
      FROM users
      WHERE id = ?
    `);
  return stmt.get(userId);
}
