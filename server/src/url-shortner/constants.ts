import config from "../config/config";

/**
 * Batch size for updating visits in the database
 */
export const VISITS_BATCH_SIZE = config.IS_TEST_ENV ? 5 : 200;

/**
 * Length of the short URL
 */
export const ID_LENGTH = 10;
