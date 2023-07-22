import { NextFunction, Request, Response } from "express";
import isUrl from "is-url";
import Joi from "joi";

/**
 * REUSEABLE FUNCTION FOR VALIDATING REQUESTS
 */
const validateRequest = (
  error: Joi.ValidationError | undefined,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  next();
};

/**
 * SCHEMAS
 *
 * Define the schema for the request body
 */
const createShortUrlSchema = Joi.object({
  originalUrl: Joi.string().uri().required(),
});

const redirectShortUrlSchema = Joi.object({
  shortUrl: Joi.string().required(),
});

/**
 * MIDDLEWARES
 *
 */
export const hasOriginalUrl = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = createShortUrlSchema.validate(req.body);
  validateRequest(error, req, res, next);
};

export const hasShortUrl = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = redirectShortUrlSchema.validate(req.params);
  validateRequest(error, req, res, next);
};

export const isValidUrl = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { originalUrl } = req.body;
  if (!isUrl(originalUrl)) {
    res.status(400).json({ error: "Invalid URL" });
    return;
  }
  next();
};
