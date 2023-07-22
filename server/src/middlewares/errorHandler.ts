import { Request, Response, NextFunction } from "express";

import { logger } from "../shared/logger";

class CustomError extends Error {
  status: number;
  errors: unknown;

  constructor(message: string, status: number, errors?: unknown) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export const errorHandler = ({
  genericErrorMessage = "An error has occurred",
} = {}) => {
  return (
    error: CustomError,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): void => {
    if (process.env.NODE_ENV !== "test") {
      logger.error({
        error,
        message: error.message || genericErrorMessage,
      });
    }

    if (error.status) {
      res.status(error.status).json({
        type: error.name,
        message: error.message,
        errors: error.errors,
      });
      return;
    }
    res.status(500).json({ message: genericErrorMessage });
  };
};
