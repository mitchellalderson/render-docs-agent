import { Router } from 'express';
import { chat, getChatHistory } from '../controllers/chatController';
import { chatLimiter } from '../middleware/rateLimiter';
import { validate, chatMessageSchema } from '../middleware/validation';

const router = Router();

// Routes
router.post('/', chatLimiter, validate(chatMessageSchema), chat);
router.get('/history/:sessionId', getChatHistory);

export default router;

