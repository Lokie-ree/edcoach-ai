'use client';

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ReactNode } from "react";
import { hasValidClerkKeys, isBuildTime } from "@/lib/build-time";

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

export default function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  // If we're in build time without valid keys, skip Clerk entirely
  if (isBuildTime()) {
    return <>{children}</>;
  }

  // Runtime error for missing keys
  if (!hasValidClerkKeys() && typeof window !== 'undefined') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Configuration Error</h2>
          <p className="text-muted-foreground">
            Missing or invalid Clerk configuration. Please check your environment variables.
          </p>
        </div>
      </div>
    );
  }

  // Normal operation with valid keys
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={{
        cssLayerName: 'clerk',
        baseTheme: dark,
      }}
    >
      {children}
    </ClerkProvider>
  );
}
