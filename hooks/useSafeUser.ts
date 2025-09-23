/**
 * Safe wrapper around Clerk's useUser hook that handles build-time scenarios
 */
'use client';

import { useUser } from "@clerk/nextjs";
import { isBuildTime } from "@/lib/build-time";

export const useSafeUser = () => {
  // During build time, return safe defaults
  if (isBuildTime()) {
    return {
      user: null,
      isLoaded: false,
      isSignedIn: false,
    };
  }

  // Normal runtime behavior
  return useUser();
};
