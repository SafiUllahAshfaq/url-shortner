import Redis from "ioredis";

import config from "../config/config";

import { logger } from "./logger";

const redis = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
});

redis.on("connect", () => {
  logger.info("Connected to Redis");
});

redis.on("error", (err) => {
  logger.error("Error connecting to Redis:", err);
});

/**
 * Retrieves the value associated with the specified key from Redis.
 *
 * @param {string} key - The key to look up in Redis.
 * @returns {Promise<string | null>} A Promise that resolves to the value if the key is found, or `null` if the key is not found.
 */
export const redisGet = (key: string): Promise<string | null> => redis.get(key);

/**
 * Sets a key-value pair in Redis with an optional expiration time.
 *
 * @param {string} key - The key to set in Redis.
 * @param {string} value - The value to associate with the key.
 * @param {number} [expireIn=60] - Optional. The expiration time in minutes. Default is 60 minutes.
 * @returns {Promise<string | null>} A Promise that resolves to `'OK'` if the set operation is successful, or `null` if an error occurs.
 */
export const redisSet = (
  key: string,
  value: string,
  expireIn = 60
): Promise<string | null> => {
  // We set the expiration time to 1 hour (60 seconds * 60 minutes)
  const expirationTime = expireIn * 60;

  return redis.set(key, value, "EX", expirationTime);
};

/**
 * Increments the number stored at key by one.
 * If the key does not exist, it is set to 0 before performing the operation.
 */
export const redisIncr = (key: string): Promise<number> => {
  return redis.incr(key);
};

/**
 * Sets an expiration time on a key in seconds.
 * If the key does not exist, or the timeout could not be set, it does nothing.
 *
 * @param {string} key - The key to set in Redis.
 * @param {number} minutes - The expiration time in minutes. Default is 10 minutes.
 */
export const redisExpire = async (key: string, minutes = 10): Promise<void> => {
  await redis.expire(key, minutes * 60);
};
