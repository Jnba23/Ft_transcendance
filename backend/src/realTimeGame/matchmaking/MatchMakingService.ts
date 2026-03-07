import { MatchResult, QueueEntry } from './types.js';
import { randomUUID } from 'crypto';

class MatchmakingService {
  private queue: Map<string, QueueEntry> = new Map();
  public addToQueue(entry: QueueEntry): null | MatchResult {
    this.queue.set(entry.userId.toString(), entry);
    const opponent = this.findMatch(entry);
    if (opponent) {
      this.removeFromQueue(entry.userId.toString());
      this.removeFromQueue(opponent.userId.toString());
      const match: MatchResult = {
        gameId: randomUUID(),
        player1: entry,
        player2: opponent,
        gameType: entry.gameType,
      };
      return match;
    }
    return null;
  }
  public removeFromQueue(userId: string | number): void {
    this.queue.delete(userId.toString());
  }
  private findMatch(player: QueueEntry): QueueEntry | null {
    for (const [userId, entry] of this.queue) {
      if (userId === player.userId.toString()) continue;
      if (player.gameType === entry.gameType) return entry;
    }
    return null;
  }
}
export const mmServ = new MatchmakingService();
