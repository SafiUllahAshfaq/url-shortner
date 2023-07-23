/* eslint-disable @typescript-eslint/no-non-null-assertion */
import dotenv from "dotenv";

const isTestEnv = process.env.NODE_ENV === "test";

// Load environment variables from .env file
const envFileName = `.env.${process.env.NODE_ENV}`;

dotenv.config({ path: envFileName });

interface AppConfig {
  NODE_ENV: string;
  SERVER_PORT: string;
  DB_HOST: string;
  DB_PORT: string;
  DB_NAME: string;
  BASE_URL: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  IS_TEST_ENV: boolean;
}

// Validate environment variables if not in test environment
if (!isTestEnv) {
  // Define the expected environment variables
  const expectedEnvVars: string[] = [
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "BASE_URL",
    "REDIS_HOST",
    "REDIS_PORT",
  ];

  // Check if all the expected environment variables are present
  for (const envVar of expectedEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Required environment variable "${envVar}" is missing.`);
    }
  }
}

const config: AppConfig = {
  NODE_ENV: process.env.NODE_ENV || "development",
  SERVER_PORT: process.env.SERVER_PORT || "3009",
  DB_HOST: process.env.DB_HOST!,
  DB_PORT: process.env.DB_PORT!,
  DB_NAME: process.env.DB_NAME!,
  BASE_URL: process.env.BASE_URL!,
  REDIS_HOST: process.env.REDIS_HOST!,
  REDIS_PORT: parseInt(process.env.REDIS_PORT!),
  IS_TEST_ENV: isTestEnv ? true : false,
};

export default config;
