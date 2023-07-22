import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

/**
 * NOTE: Rate limiting strategy could be improved.
 * For simplicity we are
 * 1. using a "fixed window" of 15 minutes (we could use a "sliding window" instead)
 * 2. limiting each IP to 100 requests per windowMs
 */
/**
 * @description Rate limiting middleware
 * @param maxRequests {number} allowed requests. Default is 400 requests
 * @param time {number} fixed time in minutes. Default is 60 minutes
 * @example rateLimiter(400, 60) // 400 requests per 60 minutes
 */
export const rateLimiter = (
  maxRequests = 400,
  time = 60
): RateLimitRequestHandler =>
  rateLimit({
    windowMs: time * 60 * 1000,
    max: maxRequests, // Limit each IP to maxRequests requests per windowMs
  });
