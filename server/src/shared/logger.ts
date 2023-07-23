import pino from "pino";

import config from "../config/config";

export const logger = pino({
  level: config.IS_TEST_ENV ? "silent" : "info",
});
