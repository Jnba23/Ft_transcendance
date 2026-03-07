import { getDb } from '../../core/database.js';
import { Friendship, FriendRequestWithUser } from './types.js';

export const friendService = {
  createRequest(senderId: number, recipientId: number): number {
    const db = getDb();
    const result = db
      .prepare(
        `
            INSERT INTO friendship (user_id_1, user_id_2, status)
            VALUES (?, ?, 'pending')
        `
      )
      .run(senderId, recipientId);
    return result.lastInsertRowid as number;
  },

  getSentRequests(userId: number): FriendRequestWithUser[] {
    const db = getDb();
    return db
      .prepare(
        `
            SELECT f.*, u.id as user_id, u.username, u.avatar_url, u.status as user_status
            FROM friendship f
            JOIN users u ON u.id = f.user_id_2
            WHERE f.user_id_1 = ? AND f.status = 'pending'
        `
      )
      .all(userId) as FriendRequestWithUser[];
  },

  getReceivedRequests(userId: number): FriendRequestWithUser[] {
    const db = getDb();
    return db
      .prepare(
        `
            SELECT f.*, u.id as user_id, u.username, u.avatar_url, u.status as user_status
            FROM friendship f
            JOIN users u ON u.id = f.user_id_1
            WHERE f.user_id_2 = ? AND f.status = 'pending'
        `
      )
      .all(userId) as FriendRequestWithUser[];
  },

  getRequestById(requestId: number): Friendship | undefined {
    const db = getDb();
    return db
      .prepare('SELECT * FROM friendship WHERE id = ?')
      .get(requestId) as Friendship | undefined;
  },

  checkExisting(userId1: number, userId2: number): Friendship | undefined {
    const db = getDb();
    return db
      .prepare(
        `
            SELECT * FROM friendship
            WHERE (user_id_1 = ? AND user_id_2 = ?)
               OR (user_id_1 = ? AND user_id_2 = ?)
        `
      )
      .get(userId1, userId2, userId2, userId1) as Friendship | undefined;
  },

  acceptRequest(requestId: number): void {
    const db = getDb();
    db.prepare("UPDATE friendship SET status = 'accepted' WHERE id = ?").run(
      requestId
    );
  },

  deleteRequest(requestId: number): void {
    const db = getDb();
    db.prepare('DELETE FROM friendship WHERE id = ?').run(requestId);
  },

  getFriends(userId: number): FriendRequestWithUser[] {
    const db = getDb();
    return db
      .prepare(
        `
      SELECT
        f.*,
        u.id AS user_id,
        u.username,
        u.avatar_url,
        u.status AS user_status
      FROM friendship f

      JOIN users u ON u.id =
        CASE
          WHEN f.user_id_1 = ? THEN f.user_id_2
          ELSE f.user_id_1
        END

      WHERE (f.user_id_1 = ? OR f.user_id_2 = ?)
        AND f.status = 'accepted'
    `
      )
      .all(userId, userId, userId) as FriendRequestWithUser[];
  },

  getFriendRequestWithUser(
    friendshipId: number,
    userId: number
  ): FriendRequestWithUser {
    const db = getDb();

    return db
      .prepare(
        `
        SELECT f.*, u.id as user_id, u.username, u.avatar_url, u.status as user_status
        FROM friendship f
        JOIN users u ON u.id = ?
        WHERE f.id = ? AND ? IN (f.user_id_1, f.user_id_2)
      `
      )
      .get(userId, friendshipId, userId) as FriendRequestWithUser;
  },
};
