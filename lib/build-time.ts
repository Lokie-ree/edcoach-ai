/**
 * Build-time utilities for handling environment checks
 */

export const isBuildTime = () => {
  return typeof window === 'undefined' && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
};

export const hasValidClerkKeys = () => {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return key && key.startsWith('pk_');
};

export const isCI = () => {
  return process.env.CI === 'true' || process.env.NODE_ENV === 'test';
};
