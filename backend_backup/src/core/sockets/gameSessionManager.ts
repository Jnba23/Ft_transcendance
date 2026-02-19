import { MatchResult } from '../../realTimeGames/matchmaking/types.js';

class GameSessions {
  private sessions: Map<string, MatchResult> = new Map();

  createNewSession(match: MatchResult): void {
    this.sessions.set(match.gameId, match);
  }
  getSession(gameId: string): undefined | MatchResult {
    return this.sessions.get(gameId);
  }
  deleteSession(gameId: string): void {
    this.sessions.delete(gameId);
  }
}

export const SessionManager = new GameSessions();
