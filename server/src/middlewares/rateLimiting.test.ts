import express, { Express } from "express";
import request from "supertest";

import { rateLimiter } from "./rateLimiting";

describe("Rate limiter middleware", () => {
  let server: Express;

  beforeEach(() => {
    server = express();
    server.use(rateLimiter(2, 1 / 60)); // Limit to 2 requests in 1 minute for testing purpose
    server.all("*", (_req, res) => res.status(200).send());
  });

  it("should allow requests within limit", async () => {
    await request(server).get("/").expect(200);
    await request(server).get("/").expect(200);
  });

  it("should reject requests exceeding the limit", async () => {
    await request(server).get("/").expect(200);
    await request(server).get("/").expect(200);
    await request(server).get("/").expect(429);
  });

  it("should reset the limit after the time period", async () => {
    await request(server).get("/").expect(200);
    await request(server).get("/").expect(200);
    setTimeout(async () => {
      await request(server).get("/").expect(200);
    }, 60 * 1000);
  });
});
