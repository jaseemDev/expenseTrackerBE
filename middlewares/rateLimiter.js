import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict limiter for sensitive operations (login, password reset)
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: "Too many attempts from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Expense/Transaction limiter
export const expenseLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 expense additions per minute
  message: {
    error: "Too many expense additions, please slow down.",
    retryAfter: "1 minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Speed limiter (slows down requests instead of blocking)
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per windowMs without delay
  delayMs: () => 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
});

// User-specific rate limiter (requires authentication)
export const createUserLimiter = (maxRequests = 50) => {
  const userLimiters = new Map();

  return (req, res, next) => {
    const userId = req.user?.id || req.body?.userId;

    if (!userId) {
      return next();
    }

    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes

    if (!userLimiters.has(userId)) {
      userLimiters.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const userLimit = userLimiters.get(userId);

    if (now > userLimit.resetTime) {
      userLimit.count = 1;
      userLimit.resetTime = now + windowMs;
      return next();
    }

    if (userLimit.count >= maxRequests) {
      return res.status(429).json({
        error: "Too many requests for this user",
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000),
      });
    }

    userLimit.count++;
    next();
  };
};
