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
