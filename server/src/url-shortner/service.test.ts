// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Redis from "ioredis";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { nanoid } from "nanoid";

import * as service from "./service";

// Mock nanoid to return a fixed short URL for consistent testing
jest.mock("nanoid");
(nanoid as jest.Mock).mockReturnValue("testShortUrl");

// Mock Redis functions
jest.mock("ioredis");
jest.mock("../shared/redis");
const MockRedis = jest.requireMock("../shared/redis");

const BASE_URL = "tier.app/";
let mongoServer: MongoMemoryServer;

describe("Short URL service", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  describe("getShortUrl", () => {
    it("should create a new short URL when the original URL does not exist", async () => {
      const originalUrl = "https://www.example.com/original-url";
      const expectedShortUrl = BASE_URL + "testShortUrl";

      const shortUrl = await service.createShortUrl(originalUrl);

      expect(shortUrl).toBe(expectedShortUrl);
      expect(nanoid).toHaveBeenCalled();
    });

    it("should return an existing short URL when the original URL already exists", async () => {
      (nanoid as jest.Mock).mockReturnValue("existingShortUrl");

      const originalUrl = "https://www.example.com/existing-original-url";
      const existingShortUrl = BASE_URL + "existingShortUrl";

      const shortUrl = await service.createShortUrl(originalUrl);

      expect(shortUrl).toBe(existingShortUrl);
    });
  });

  describe("retrieveOriginalUrl", () => {
    it("should return the original URL and visits from the cache if available", async () => {
      const cachedUrl = "http://original.url";
      const cachedVisits = "5";
      MockRedis.redisGet.mockResolvedValueOnce(cachedUrl);
      MockRedis.redisGet.mockResolvedValueOnce(cachedVisits);

      const result = await service.getOriginalUrl("shortUrl");

      expect(result).toEqual({
        originalUrl: cachedUrl,
        visits: Number(cachedVisits) + 1,
      });
    });

    it("should return null if the short URL does not exist", async () => {
      const nonExistentShortUrl = "nonExistentShortUrl";

      const result = await service.getOriginalUrl(nonExistentShortUrl);

      expect(result).toBeNull();
      expect(MockRedis.redisGet).toHaveBeenCalled();
    });

    it("should retrieve the original URL from cache and update visits", async () => {
      const shortUrl = "testShortUrl";
      const cachedOriginalUrl = "cachedOriginalUrl";
      const cachedVisits = "2";
      MockRedis.redisGet.mockResolvedValueOnce(cachedOriginalUrl);
      MockRedis.redisGet.mockResolvedValueOnce(cachedVisits);

      const result = await service.getOriginalUrl(shortUrl);

      expect(result).toEqual({ originalUrl: cachedOriginalUrl, visits: 3 });
      expect(MockRedis.redisSet).toHaveBeenCalledWith(
        shortUrl,
        cachedOriginalUrl
      );
      expect(MockRedis.redisIncr).toHaveBeenCalledWith(`visits:${shortUrl}`);
    });
  });
});
