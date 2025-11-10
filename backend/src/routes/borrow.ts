import { Router } from 'express';
import { borrow, returnBooks, verifyReceipt } from '../controllers/borrowController';
import { authenticate, authorize } from '../utils/auth';

const router = Router();

router.post('/', authenticate, authorize('student'), borrow);
router.post('/return', authenticate, authorize('student'), returnBooks);
router.get('/verify', verifyReceipt);

export default router;
