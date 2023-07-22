import { Request, Response, NextFunction } from "express";

import { logger } from "../shared/logger";

export const logging =
  () =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const { method, originalUrl, ip } = req;
    const timestamp = Date.now();
    logger.info(
      `${new Date(
        timestamp
      ).toISOString()} - ${method} ${originalUrl} from ${ip}`
    );
    next();
  };
