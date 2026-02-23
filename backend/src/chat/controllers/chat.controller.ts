import { Request, Response } from "express";
import { getDb } from "../../core/database.js";
import { emitNewConversation, emitNewMessage } from "../services/realtime.service.js";
import { ConversationListRow, ConversationRow, MessageRow } from "../types.js";
import { User } from "../../auth/types.js";

// POST

export function createConversation (req: Request, res: Response) {
	const db = getDb();
	const creatorId = res.locals.user.id;
	const otherUserId = req.body.other_id;

	if (!otherUserId) {
		return res.status(400).json({ error: 'Other user ID required' })
	}

	const insertStmt = db.prepare(`
		INSERT INTO conversations (user_id_1, user_id_2)
		VALUES (?, ?)
	`);

	const info = insertStmt.run(creatorId, otherUserId);
	const conversationId = info.lastInsertRowid;

	// fetch both users
	const creator = db.prepare(`
		SELECT id, username, avatar_url, level, status
		FROM users WHERE id = ?	
	`).get(creatorId) as Partial<User>;

	const otherUser = db.prepare(`
		SELECT id, username, avatar_url, level, status
		FROM users WHERE id = ?		
	`).get(otherUserId) as Partial<User>;

	emitNewConversation({conversationId, creator, otherUser});

	res.status(201).json({
		status: "success",
		data: {
			conversation_id: info.lastInsertRowid
		}
	});
}

export function createMessage(req: Request, res: Response) { // refactor ?
	const db = getDb();
	const senderId = res.locals.user.id;
	const { conversation_id, content } = req.body;

	if (!conversation_id || !content) {
		return res.status(400).json({ error: 'Missing fields' });
	}

	const convo = db.prepare(`
		SELECT user_id_1, user_id_2
		FROM conversations
		WHERE id = ?
	`).get(conversation_id) as ConversationRow;

	if (!convo)
	{
		return res.status(404).json({ error: 'Conversation not found' });
	}

	if (senderId != convo.user_id_1 && senderId != convo.user_id_2) {
		return res.status(403).json({ error: 'Sender not part of this conversation' });
	}

	const stmt = db.prepare(`
		INSERT INTO messages (conversation_id, sender_id, content)
		VALUES (?, ?, ?)
	`);

	const info = stmt.run(conversation_id, senderId, content);

	const message = db.prepare(`
		SELECT id, conversation_id, sender_id, content, sent_at
		FROM messages
		WHERE id = ?
	`).get(info.lastInsertRowid) as MessageRow;

	const receiverId = senderId === convo.user_id_1
		? convo.user_id_2 : convo.user_id_1;

	emitNewMessage({senderId, receiverId, message});

	res.status(201).json({
		status: "sucess",
		data: {
			message_id: message.id,
			sent_at: message.sent_at
		}
	});
}

export function markConversationRead(req: Request, res: Response) {
	const db = getDb();
	const userId = res.locals.user.id;
	const conversationId = parseInt(req.params.id);

	if (isNaN(conversationId)) {
		return res.status(400).json({ error: 'invalid conversation ID' });
	}

	const convo = db.prepare(`
		SELECT user_id_1, user_id_2
		FROM conversations
		WHERE id = ?
	`).get(conversationId) as ConversationRow;

	if (!convo) {
		return res.status(404).json({ error: 'Conversations not found' });
	}

	if (userId != convo.user_id_1 && userId != convo.user_id_2) {
		return res.status(403).json({ error: 'Not part of this conversation' });
	}

	db.prepare(`
		UPDATE messages
		SET is_read = 1
		WHERE conversation_id = ?
		AND sender_id != ?
		AND is_read = 0
	`).run(conversationId, userId);

	res.status(200).json({
		success: "success"
	});
}

// GET

export function getConversations(req: Request, res: Response) {
	const db = getDb();
	const userId = (res.locals.user as User).id;

	const stmt = db.prepare(`
		SELECT
			c.id AS conversation_id,

			-- Compute the other participant once
			CASE
				WHEN c.user_id_1 = @userId THEN c.user_id_2
				ELSE c.user_id_1
			END AS user_id,

			u.username,
			u.avatar_url,
			u.level,
			u.status,

			COUNT(
				CASE
					WHEN m.sender_id != @userId AND m.is_read = 0 THEN 1
				END
			) AS unread_count,

			MAX(
				CASE
					WHEN m.sender_id != @userId AND m.is_read = 0 THEN m.sent_at
				END
			) AS latest_unread_at,

			MAX(m.sent_at) AS latest_message_at

		FROM conversations c

		-- Join only once using computed other user
		JOIN users u ON u.id = (
			CASE
				WHEN c.user_id_1 = @userId THEN c.user_id_2
				ELSE c.user_id_1
			END
		)

		LEFT JOIN messages m ON m.conversation_id = c.id

		WHERE c.user_id_1 = @userId OR c.user_id_2 = @userId

		GROUP BY c.id

		ORDER BY
			(unread_count > 0) DESC,
			latest_unread_at DESC,
			latest_message_at DESC;
	`);

	const rows = stmt.all({ userId }) as ConversationListRow[];

	const conversations = rows.map(row => ({
		id: row.conversation_id,
		user: {
			id: row.user_id,
			username: row.username,
			avatar_url: row.avatar_url,
			level: row.level,
			status: row.status
		},
		unread_count: row.unread_count
	}));

	res.status(200).json({
		status: "success",
		result: conversations.length,
		data: {
			conversations
		}
	});
}

export function getMessages(req: Request, res: Response) { // scale with pagination and maybe protect against user not being in convo 
	const db = getDb();
	const userId = res.locals.user.id;
	const conversationId = parseInt(req.params.id);

	if (isNaN(conversationId)) {
		return res.status(400).json({ error: 'Invalid conversation ID' });
	}

	const conversation = db.prepare(`
		SELECT user_id_1, user_id_2
		FROM conversations
		WHERE id = ?
	`).get(conversationId) as ConversationRow;

	if (!conversation) {
		return res.status(404).json({ error: 'Conversation not found' });
	}

	if (userId !== conversation.user_id_1 && userId !== conversation.user_id_2) {
		return res.status(403).json({ error: 'Not authorized' });
	}

	const stmt = db.prepare(`
		SELECT * FROM messages
		WHERE conversation_id = ?
		ORDER BY sent_at ASC
	`);

	const messages = stmt.all(conversationId);

	res.status(201).json({
		status: "success",
		result: messages.length,
		data: {
			messages
		}
	});
}