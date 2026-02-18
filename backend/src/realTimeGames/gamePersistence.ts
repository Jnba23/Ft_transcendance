import { getDb } from "../core/database.js";

const db = getDb();

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
  }) : void {
	try {
		const transaction = db.transaction(() => {
			const insertGame = db.prepare(`
				INSERT INTO games(player1Id, player2Id, winnerId, player1_score,
				player2_score, game_type)
				VALUES
				(?, ?, ?, ?, ?, ?)`);
			insertGame.run(data.player1Id, data.player2Id, data.winnerId, data.player1Score,
				data.player2Score, data.gameType === 'rps' ? 'RPS' : 'pong');
			const loserId = data.winnerId === data.player1Id ? data.player2Id : data.player1Id;
			if (data.gameType === 'rps'){
				const updateWinner = db.prepare(`
					UPDATE users
					SET 
						RPS_wins = RPS_wins + 1
					WHERE id = ?`);
				updateWinner.run(data.winnerId);
				const updateLoser = db.prepare(`
					UPDATE users
					SET
						RPS_losses = RPS_losses + 1
					WHERE id = ?`);
				updateLoser.run(loserId);
			} else {
				const updateWinner = db.prepare(`
					UPDATE users
					SET 
						pong_wins = pong_wins + 1
					WHERE id = ?`);
				updateWinner.run(data.winnerId);
				const updateLoser = db.prepare(`
					UPDATE users
					SET
						pong_losses = pong_losses + 1
					WHERE id = ?`);
				updateLoser.run(loserId);
			}
		});
		transaction();
	} catch(error) {
		console.log('Failed to save game:', error);
	}
  }

  export function getUserGameHistory(userId: number, limit: number = 10): any[] {
	const query = db.prepare(`
		SELECT 
			g.id,
			g.game_type;
			g.player1_id;
			g.player2_id;
			g.player1_score;
			g.player2_score;
			g.winner_id;
			g.created_at
			CASE
				WHEN g.player1_id = ? THEN u2.username
				ELSE u1.username
			END as opponent_name
			CASE
				WHEN g.winner_id = ? THEN 'win'
				ELSE 'loss'
			END as result
		FROM games g
		JOIN users u1 ON g.player1_id = u1.id
		JOIN users u2 ON g.player1_id = u2.id
		WHERE (g.player1_id = ? OR g.player2_id = ?) AND g.status = 'completed'
		ORDER BY g.created_at DESC
		LIMIT ?
		`)
		return query.all(userId, userId, userId, userId, limit);
  }

  export function getUserStats(userId: number): any {
    const stmt = db.prepare(`
      SELECT 
        username,
        level,
        pong_wins,
        pong_losses,
        (pong_wins + pong_losses) as pong_games_played,
        RPS_wins,
        RPS_losses,
        (RPS_wins + RPS_losses) as rps_games_played,
        CASE 
          WHEN (pong_wins + pong_losses) > 0 
          THEN ROUND((pong_wins * 100.0) / (pong_wins + pong_losses), 2)
          ELSE 0
        END as pong_win_rate,
        CASE 
          WHEN (RPS_wins + RPS_losses) > 0 
          THEN ROUND((RPS_wins * 100.0) / (RPS_wins + RPS_losses), 2)
          ELSE 0
        END as rps_win_rate
      FROM users
      WHERE id = ?
    `);
    
    return stmt.get(userId);
  }
