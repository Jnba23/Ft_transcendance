import { Request, Response } from 'express';
import { getDb } from '../../core/database.js';
import { LeaderboardRow } from './types.js';
import {
  getUserGameHistory,
  getUserGamesCount,
  getUserStats,
} from './gamePersistence.js';

export function getLeaderboard(req: Request, res: Response) {
  const db = getDb();
  const userId = res.locals.user.id;

  const topStmt = db.prepare(`
		WITH ranked_users AS (
			SELECT
				id,
				username,
				avatar_url,
				(pong_wins + RPS_wins) AS wins,
				RANK() OVER (ORDER BY (pong_wins + RPS_wins) DESC) AS rank
			FROM users
		)
		SELECT id, username, avatar_url, wins, rank
		FROM ranked_users
		ORDER BY rank
		LIMIT 4;
	`);

  const userStmt = db.prepare(`
		WITH ranked_users AS (
			SELECT
				id,
				username,
				avatar_url,
				(pong_wins + RPS_wins) AS wins,
				RANK() OVER (ORDER BY (pong_wins + RPS_wins) DESC) AS rank
			FROM users
		)
		SELECT id, username, avatar_url, wins, rank
		FROM ranked_users
		WHERE id = ?
	`);

  const topPlayers = topStmt.all() as LeaderboardRow[];
  const user = userStmt.get(userId) as LeaderboardRow;

  const leaderboard = [...topPlayers];

  if (user && !topPlayers.some((p) => p.id === userId)) {
    leaderboard.push(user);
  }

  res.status(200).json({
    status: 'success',
    results: leaderboard.length,
    data: {
      leaderboard,
    },
  });
}

export function getStats(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const userId = isNaN(id) ? res.locals.user.id : id;

  const stats = getUserStats(userId);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
}

export function getHistory(req: Request, res: Response) {
  const VALID_GAME_TYPES = ['pong', 'RPS'];
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
  const gameType = req.query.gameType as string | undefined;

  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  if (isNaN(page) || page < 1) {
    return res.status(400).json({ error: 'Invalid page number' });
  }

  if (isNaN(limit) || limit < 1) {
    return res.status(400).json({ error: 'Invalid limit' });
  }

  if (gameType && !VALID_GAME_TYPES.includes(gameType)) {
    return res.status(400).json({ error: 'Invalid gameType' });
  }

  const games = getUserGameHistory(
    userId,
    page,
    limit,
    gameType as 'pong' | 'RPS'
  );

  const totalGames = getUserGamesCount(userId, gameType);
  const totalPages = Math.ceil(totalGames / limit);

  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  res.status(200).json({
    status: 'success',
    data: {
      games,
      page,
      totalPages,
      hasNext,
      hasPrev,
    },
  });
}
