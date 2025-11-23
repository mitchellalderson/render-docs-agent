import { Router } from 'express';
import documentRoutes from './documents';
import chatRoutes from './chat';
import adminRoutes from './admin';

const router = Router();

// Mount route modules
router.use('/documents', documentRoutes);
router.use('/chat', chatRoutes);
router.use('/admin', adminRoutes);

export default router;

