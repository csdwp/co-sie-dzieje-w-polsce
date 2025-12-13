/**
 * Application configuration constants
 */

/**
 * Minimum confidence score threshold for displaying acts to non-admin users
 * Acts with confidence_score below this value will be hidden from regular users
 * @default 0.5
 */
export const CONFIDENCE_THRESHOLD = 0.5;

/**
 * Feature flag to enable/disable subscriptions system
 * When false, shows daily limit modal instead of subscription modal
 * @default true
 */
export const SUBSCRIPTIONS_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS === 'true';

/**
 * Daily limit for anonymous users
 * @default 3
 */
export const ANONYMOUS_DAILY_LIMIT = 3;

/**
 * Daily limit for authenticated users
 * @default 5
 */
export const AUTHENTICATED_DAILY_LIMIT = 5;
