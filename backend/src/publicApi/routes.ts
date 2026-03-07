import { Router, Request, Response } from 'express';
import { getDb } from '../core/database.js';
import { apiKeyAuth, apiLimiter } from './middleware.js';
import { userSchema } from './schemas.js';
import { AppError } from '../utils/AppError.js';
import { z } from 'zod';

const router = Router();

router.use(apiLimiter);
router.use(apiKeyAuth);

router.get('/users', (req: Request, res: Response) => {
	const stmt = getDb().prepare('SELECT id, username, email, avatar_url, level, status, created_at FROM users ORDER BY created_at DESC LIMIT 50');
	const users = stmt.all();
	res.status(200).json({
		status: 'success',
		results: users.length,
		data: { users },
	});
});

router.get('/users/:id', (req: Request, res: Response, next) => {
	const userId = parseInt(req.params.id as string);
	if (isNaN(userId)) {
		return next(new AppError('Invalid user ID format', 400));
	}

	const stmt = getDb().prepare(
		'SELECT id, username, email, avatar_url, level, status, created_at FROM users WHERE id = ?'
	);
	const user = stmt.get(userId);

	if (!user) {
		return next(new AppError('User not found', 404));
	}

	res.status(200).json({
		status: 'success',
		data: { user },
	});
});

router.post('/users', (req: Request, res: Response, next) => {
	try {
		const data = userSchema.parse(req.body);

		const stmt = getDb().prepare(`
      INSERT INTO users (username, email, avatar_url, level, status)
      VALUES (?, ?, ?, ?, ?)
    `);

		const result = stmt.run(
			data.username,
			data.email,
			data.avatar_url || '/default-avatar.png',
			data.level || 1,
			data.status || 'offline'
		);

		res.status(201).json({
			status: 'success',
			data: { id: result.lastInsertRowid, ...data },
		});
	} catch (err: any) {
		// Handle SQLite UNIQUE constraint error manually
		if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
			return next(new AppError('Username or email already exists', 409));
		}
		if (err instanceof z.ZodError) {
			return res.status(400).json({ status: 'fail', errors: err.errors });
		}
		next(err);
	}
});

router.put('/users/:id', (req: Request, res: Response, next) => {
	const userId = parseInt(req.params.id as string);
	if (isNaN(userId)) return next(new AppError('Invalid user ID format', 400));

	try {
		const data = userSchema.parse(req.body);

		const existStmt = getDb().prepare('SELECT id FROM users WHERE id = ?');
		const existingUser = existStmt.get(userId);
		if (!existingUser) return next(new AppError('User not found', 404));

		const stmt = getDb().prepare(`
      UPDATE users 
      SET username = ?, email = ?, avatar_url = ?, level = ?, status = ?
      WHERE id = ?
    `);

		stmt.run(
			data.username,
			data.email,
			data.avatar_url || '/default-avatar.png',
			data.level || 1,
			data.status || 'offline',
			userId
		);

		res.status(200).json({
			status: 'success',
			message: `User ${userId} updated successfully`,
			data: { id: userId, ...data },
		});
	} catch (err: any) {
		if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
			return next(new AppError('Username or email already exists', 409));
		}
		if (err instanceof z.ZodError) {
			return res.status(400).json({ status: 'fail', errors: err.errors });
		}
		next(err);
	}
});

router.delete('/users/:id', (req: Request, res: Response, next) => {
	const userId = parseInt(req.params.id as string);
	if (isNaN(userId)) return next(new AppError('Invalid user ID format', 400));

	const existStmt = getDb().prepare('SELECT id FROM users WHERE id = ?');
	const existingUser = existStmt.get(userId);
	if (!existingUser) return next(new AppError('User not found', 404));

	const stmt = getDb().prepare('DELETE FROM users WHERE id = ?');
	stmt.run(userId);

	res.status(204).json({
		status: 'success',
		data: null,
	});
});

export default router;
