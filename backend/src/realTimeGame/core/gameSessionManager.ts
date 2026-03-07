import { MatchResult } from '../matchmaking/types.js';

class GameSessions {
  private sessions = new Map<string, MatchResult>();

  add(game: MatchResult) {
    this.sessions.set(game.gameId, game);
  }

  get(gameId: string) {
    return this.sessions.get(gameId);
  }

  getGameId(userId: number): string | undefined {
    for (const [gameId, session] of this.sessions.entries()) {
      if (
        session.player1.userId === userId ||
        session.player2.userId === userId
      )
        return gameId;
    }
    return undefined;
  }

  getSessionByUserId(userId: number): MatchResult | undefined {
    for (const session of this.sessions.values()) {
      if (
        session.player1.userId === userId ||
        session.player2.userId === userId
      )
        return session;
    }
    return undefined;
  }

  remove(gameId: string) {
    this.sessions.delete(gameId);
  }
}

export const SessionManager = new GameSessions();
