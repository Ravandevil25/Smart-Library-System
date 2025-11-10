import { Router } from 'express';
import { queryAI } from '../controllers/aiController';

const router = Router();

// POST /api/ai/query
router.post('/query', queryAI);

export default router;
