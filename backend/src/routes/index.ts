import { Router } from 'express';
import authRoutes from './auth';
import sessionRoutes from './session';
import bookRoutes from './book';
import borrowRoutes from './borrow';
import dashboardRoutes from './dashboard';
import aiRoutes from './ai';

const router = Router();

router.use('/auth', authRoutes);
router.use('/session', sessionRoutes);
router.use('/books', bookRoutes);
router.use('/borrow', borrowRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/ai', aiRoutes);

export default router;
