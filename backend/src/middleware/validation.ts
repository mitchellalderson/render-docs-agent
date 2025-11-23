import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Validation middleware factory
 */
export function validate(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      } else {
        next(error);
      }
    }
  };
}

/**
 * Chat message validation schema
 */
export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long (max 2000 characters)'),
  sessionId: z.string().optional(),
});

/**
 * Document filter validation schema
 */
export const documentFilterSchema = z.object({
  type: z.enum(['markdown', 'openapi']).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

/**
 * Session ID validation schema
 */
export const sessionIdSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format'),
});

/**
 * Admin operation validation schema
 */
export const adminOperationSchema = z.object({
  confirm: z.literal(true, {
    errorMap: () => ({ message: 'Confirmation required for this operation' }),
  }),
});

