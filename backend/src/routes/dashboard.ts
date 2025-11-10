import { Router } from 'express';
import { getOccupancy, getActiveSessions, getUserHistory, getUserSummary } from '../controllers/dashboardController';
import { authenticate } from '../utils/auth';

const router = Router();

router.get('/occupancy', getOccupancy);
router.get('/active-sessions', getActiveSessions);
router.get('/users/history', authenticate, getUserHistory);
router.get('/users/summary', authenticate, getUserSummary);

export default router;
