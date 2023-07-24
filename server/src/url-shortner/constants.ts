import config from "../config/config";

/**
 * Batch size for updating visits in the database
 */
export const VISITS_BATCH_SIZE = config.IS_TEST_ENV ? 5 : 200;

/**
 * NOTE: The ID length will totally depend on the 
 * traffic that we anticipate. We can obviously increase it over time.
 * That's why I've initially chosen small length.
 *
 * Length of the short URL
 */
export const ID_LENGTH = 6;
