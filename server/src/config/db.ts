import mongoose from "mongoose";

import { logger } from "../shared/logger";

import config from "./config";

const MONGODB_URI = `mongodb://${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`;

// Connect to MongoDB using Mongoose
export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info("Connected to MongoDB successfully!");
  } catch (error) {
    logger.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the application if connection fails
  }
};
