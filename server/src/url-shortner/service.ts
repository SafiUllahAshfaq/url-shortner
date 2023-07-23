import { AnyBulkWriteOperation, Document as MongoDocument } from "mongodb";
import { nanoid } from "nanoid";

import config from "../config/config";
import { logger } from "../shared/logger";
import { redisExpire, redisGet, redisIncr, redisSet } from "../shared/redis";

import { ID_LENGTH, VISITS_BATCH_SIZE } from "./constants";
import { IUrl, Url } from "./model";

/**
 * Private functions
 */
const generateShortUrl = (): string => nanoid(ID_LENGTH);

const prefixedShortUrl = (url: string): string => `${config.BASE_URL}/${url}`;

/**
 * NOTE: This is a naive implementation of batch updates to the database.
 * A better approach would be to use a queueing system like RabbitMQ.
 */
type IVisitsBatch =
  | AnyBulkWriteOperation<MongoDocument>
  | {
      updateOne: {
        filter: { shortUrl: IUrl["shortUrl"] };
        update: { $inc: { visits: number } };
      };
    };
let visistsBatch: IVisitsBatch[] = [];

const addVisit = async (shortUrl: string) => {
  logger.info(`Adding visit to ${shortUrl}`);
  visistsBatch.push({
    updateOne: {
      filter: { shortUrl },
      update: { $inc: { visits: 1 } },
    },
  });

  if (visistsBatch.length >= VISITS_BATCH_SIZE) {
    logger.info(`Updating ${visistsBatch.length} documents`);
    await Url.bulkWrite(visistsBatch);
    visistsBatch = [];
  }
};

const updateCache = async (
  shortUrl: string,
  originalUrl?: string
): Promise<void> => {
  if (originalUrl) {
    await redisSet(shortUrl, originalUrl);
  }

  addVisit(shortUrl);
  await redisIncr(`visits:${shortUrl}`);
  await redisExpire(`visits:${shortUrl}`);
};

/**
 * Public functions
 */

export const createShortUrl = async (originalUrl: string): Promise<string> => {
  const existingUrl = await Url.findOne({ originalUrl });
  if (existingUrl) return prefixedShortUrl(existingUrl.shortUrl);

  const newUrl = new Url({
    originalUrl,
    shortUrl: generateShortUrl(),
  });
  await newUrl.save();

  return prefixedShortUrl(newUrl.shortUrl);
};

export const getOriginalUrl = async (
  shortUrl: string
): Promise<{ originalUrl: string; visits: number } | null> => {
  let [cachedOriginalUrl, cachedVisits] = await Promise.all([
    redisGet(shortUrl),
    redisGet(`visits:${shortUrl}`),
  ]);

  if (!cachedOriginalUrl) {
    const url = await Url.findOne({ shortUrl });
    if (!url) return null;

    cachedOriginalUrl = url.originalUrl;

    if (!cachedVisits) cachedVisits = `${url.visits}`;
  }

  updateCache(shortUrl, cachedOriginalUrl).catch((error) =>
    logger.error("Error while updating cache: ", error)
  );

  /**
   * - "cachedVisits" if either comes from Redis or from MongoDB,
   *    have to be incremented by 1 to account for the current visit.
   * - This way we don't have to wait for the visits in cache to
   *    be updated before returning the correct updated visits.
   */
  return { originalUrl: cachedOriginalUrl, visits: Number(cachedVisits) + 1 };
};
