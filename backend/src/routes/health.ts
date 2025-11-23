import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Basic health check
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Database connection failed',
    });
  }
});

/**
 * Detailed health check (includes API keys, services status)
 */
router.get('/detailed', async (req: Request, res: Response) => {
  const checks: Record<string, { status: string; message?: string }> = {};

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'ok' };
    
    // Check pgvector extension
    const extensions: any[] = await prisma.$queryRaw`
      SELECT * FROM pg_extension WHERE extname = 'vector';
    `;
    checks.pgvector = extensions.length > 0 
      ? { status: 'ok' } 
      : { status: 'warning', message: 'pgvector extension not found' };
      
  } catch (error) {
    checks.database = { status: 'error', message: 'Connection failed' };
    checks.pgvector = { status: 'error', message: 'Cannot check' };
  }

  // Check API keys (don't expose actual keys)
  checks.anthropic_api_key = process.env.ANTHROPIC_API_KEY 
    ? { status: 'ok' } 
    : { status: 'error', message: 'Not configured' };
    
  checks.openai_api_key = process.env.OPENAI_API_KEY 
    ? { status: 'ok' } 
    : { status: 'error', message: 'Not configured' };

  // Check document count
  try {
    const docCount = await prisma.document.count();
    const chunkCount = await prisma.documentChunk.count();
    checks.documents = { 
      status: 'ok', 
      message: `${docCount} documents, ${chunkCount} chunks` 
    };
  } catch (error) {
    checks.documents = { status: 'error', message: 'Cannot count' };
  }

  // Overall status
  const hasError = Object.values(checks).some(c => c.status === 'error');
  const overallStatus = hasError ? 'degraded' : 'ok';

  const statusCode = hasError ? 503 : 200;

  res.status(statusCode).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    checks,
  });
});

/**
 * Readiness probe (for Kubernetes/containers)
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false });
  }
});

/**
 * Liveness probe (for Kubernetes/containers)
 */
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({ alive: true });
});

export default router;

