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

/**
 * =================================================================
 * ENVIRONMENT VARIABLES CONFIGURATION
 * =================================================================
 */

/**
 * Clerk Authentication Configuration
 */
export const CLERK_CONFIG = {
  secretKey: process.env.CLERK_SECRET_KEY,
} as const;

/**
 * Stripe Payment Configuration
 */
export const STRIPE_CONFIG = {
  secretKey: process.env.STRIPE_SECRET_KEY,
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
} as const;

/**
 * Database Configuration
 */
export const DATABASE_CONFIG = {
  url: process.env.DATABASE_URL,
} as const;

/**
 * Deployment Configuration
 */
export const DEPLOYMENT_CONFIG = {
  vercelDeployHookUrl: process.env.VERCEL_DEPLOY_HOOK_URL,
  nodeEnv: process.env.NODE_ENV,
} as const;
