import express from "express";

import { rateLimiter } from "../middlewares/rateLimiting";

import { createShortUrl, getOriginalUrl } from "./controller";
import { hasOriginalUrl, hasShortUrl, isValidUrl } from "./middleware";

export const urlShortner = express.Router();

urlShortner.get("/url/:shortUrl", hasShortUrl, getOriginalUrl);

/**
 * NOTE
 * 1. Restrict the number of requests as this is a public API and
 *      malicious users could abuse it
 * 2. "isValidUrl" middleware is a preventive measure so the users
 *      don't send invalid urls to the database
 */
urlShortner.use(rateLimiter(50, 10));
urlShortner.post("/url", hasOriginalUrl, isValidUrl, createShortUrl);
