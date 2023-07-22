import express, { Application } from "express";

import { errorHandler } from "./errorHandler";
import { logging } from "./logging";
import { rateLimiter } from "./rateLimiting";

export const attachMiddlewares = (app: Application): void => {
  app.use(logging());
  app.use(rateLimiter());
  app.use(express.json());
  app.use(errorHandler());
};
