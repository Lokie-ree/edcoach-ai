'use client';

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ReactNode } from "react";

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

export default function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  // Check if we're in a build environment or if Clerk keys are missing
  const isBuildTime = typeof window === 'undefined' && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasValidKeys = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_');

  // If we're building or don't have valid keys, render children without Clerk
  // This allows static generation to work properly in CI environments
  if (isBuildTime || (!hasValidKeys && typeof window === 'undefined')) {
    return <>{children}</>;
  }

  // If we don't have valid keys at runtime, show an error
  if (!hasValidKeys && typeof window !== 'undefined') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Configuration Error</h2>
          <p className="text-muted-foreground">
            Missing or invalid Clerk configuration
          </p>
        </div>
      </div>
    );
  }

  // Otherwise, render with Clerk provider
  return (
    <ClerkProvider
      appearance={{
        cssLayerName: 'clerk',
        baseTheme: dark,
      }}
    >
      {children}
    </ClerkProvider>
  );
}
