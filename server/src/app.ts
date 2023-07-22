import express from "express";

import config from "./config/config";
import { connectDB } from "./config/db";
import { attachMiddlewares } from "./middlewares";
import { logger } from "./shared/logger";
import { urlShortner } from "./url-shortner/routes";

/**
 * Start server only if the connection to DB was successful
 */
connectDB().then(() => {
  const app = express();
  const port = config.SERVER_PORT;

  attachMiddlewares(app);

  // Register routes
  app.use("/api", urlShortner);

  app.use("/ping", (_req, res) => {
    res.status(200).send("pong");
  });

  app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
});
