import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for document uploads
 * More restrictive due to processing cost
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per window
  message: {
    error: 'Too many uploads. Please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`Rate limit exceeded for upload from ${req.ip}`);
    res.status(429).json({
      error: 'Too many upload requests',
      message: 'You have exceeded the upload limit. Please try again later.',
      retryAfter: '15 minutes',
    });
  },
});

/**
 * Rate limiter for chat requests
 * More lenient for better UX
 */
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 messages per minute
  message: {
    error: 'Too many messages. Please slow down.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`Rate limit exceeded for chat from ${req.ip}`);
    res.status(429).json({
      error: 'Too many chat requests',
      message: 'Please slow down. You can send up to 20 messages per minute.',
      retryAfter: '1 minute',
    });
  },
});

/**
 * General API rate limiter
 * Applied to all routes not covered by specific limiters
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

