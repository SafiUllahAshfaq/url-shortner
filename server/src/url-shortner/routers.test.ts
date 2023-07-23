import bodyParser from "body-parser";
import express, { Express } from "express";
import request from "supertest";

import { urlShortner } from "./routes";
import * as service from "./service";

jest.mock("./service");

describe("URL shortener routes", () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(bodyParser.json());
    app.use(urlShortner);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /url/:shortUrl", () => {
    it("should return original URL data if short URL exists", async () => {
      const mockShortUrl = "testShortUrl";
      const mockUrlData = { originalUrl: "https://example.com", visits: 0 };

      (service.getOriginalUrl as jest.Mock).mockResolvedValue(mockUrlData);

      const response = await request(app).get(`/url/${mockShortUrl}`);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockUrlData);
      expect(service.getOriginalUrl).toHaveBeenCalledWith(mockShortUrl);
    });

    it("should return 404 if short URL does not exist", async () => {
      const mockShortUrl = "testShortUrl";

      (service.getOriginalUrl as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get(`/url/${mockShortUrl}`);

      expect(response.status).toEqual(404);
      expect(response.body).toEqual({ error: "URL not found!" });
      expect(service.getOriginalUrl).toHaveBeenCalledWith(mockShortUrl);
    });
  });

  describe("POST /url", () => {
    it("should create short URL and return it", async () => {
      const mockOriginalUrl = "https://example.com";
      const mockShortUrl = "testShortUrl";

      (service.createShortUrl as jest.Mock).mockResolvedValue(mockShortUrl);

      const response = await request(app)
        .post("/url")
        .send({ originalUrl: mockOriginalUrl });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ shortUrl: mockShortUrl });
      expect(service.createShortUrl).toHaveBeenCalledWith(mockOriginalUrl);
    });

    it.each([
      {
        originalUrl: "",
        expectedStatus: 400,
        description: "should return 400 if originalUrl not provided",
      },
      {
        originalUrl: "htt://abc",
        expectedStatus: 400,
        description: "should return 400 if invalid originalUrl is provided",
      },
    ])("%s", async ({ originalUrl, expectedStatus }) => {
      const mockShortUrl = "testShortUrl";
      (service.createShortUrl as jest.Mock).mockResolvedValue(mockShortUrl);

      const response = await request(app).post("/url").send({ originalUrl });

      expect(response.status).toEqual(expectedStatus);
      expect(service.createShortUrl).not.toHaveBeenCalled();
    });
  });
});
