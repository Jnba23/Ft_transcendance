import { Router } from 'express'
import { getHistory, getLeaderboard, getStats } from './controller.js';
import { requireUser } from '../../middleware/requireUser.js';

const router = Router();

router.use(requireUser);

// GET

router.get('/leaderboard', getLeaderboard);
router.get('/users/:id/stats', getStats);
router.get('/users/:id/history', getHistory);

export default router;