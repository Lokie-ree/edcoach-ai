'use client';

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ReactNode } from "react";

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

export default function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  // Check if we're in a build environment or if Clerk keys are missing
  const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasValidKeys = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_');

  // If we're building or don't have valid keys, render children without Clerk
  if (isBuildTime || !hasValidKeys) {
    return <>{children}</>;
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
