import { Router } from 'express';
import { entry, exit } from '../controllers/sessionController';
import { authenticate } from '../utils/auth';

const router = Router();

router.post('/entry', authenticate, entry);
router.post('/exit', authenticate, exit);

export default router;
