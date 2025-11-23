import { Router } from 'express';
import { RAGService } from '../services/ragService';
import { ChatService } from '../services/chatService';

const router = Router();
const ragService = new RAGService();
const chatService = new ChatService();

/**
 * Create vector search index
 */
router.post('/index/create', async (req, res, next) => {
  try {
    await ragService.createIndex();
    res.status(200).json({ 
      message: 'Vector index created successfully',
      note: 'This improves search performance'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get search statistics
 */
router.get('/stats/search', async (req, res, next) => {
  try {
    const stats = await ragService.getSearchStats();
    res.status(200).json({ stats });
  } catch (error) {
    next(error);
  }
});

/**
 * Clear RAG cache
 */
router.post('/cache/clear', async (req, res, next) => {
  try {
    ragService.clearCache();
    res.status(200).json({ message: 'Cache cleared successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * Get active chat sessions
 */
router.get('/sessions', async (req, res, next) => {
  try {
    const sessions = await chatService.getActiveSessions();
    res.status(200).json({ sessions, count: sessions.length });
  } catch (error) {
    next(error);
  }
});

/**
 * Get session stats
 */
router.get('/sessions/:sessionId/stats', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const stats = await chatService.getSessionStats(sessionId);
    res.status(200).json({ stats });
  } catch (error) {
    next(error);
  }
});

/**
 * Clear session history
 */
router.delete('/sessions/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    await chatService.clearSession(sessionId);
    res.status(200).json({ message: 'Session cleared successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

