'use client';

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ReactNode } from "react";
import { hasValidClerkKeys } from "@/lib/build-time";

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

export default function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  // Always provide ClerkProvider, using placeholder key during build if needed
  // This ensures useUser hooks have the required context during static generation
  const publishableKey = hasValidClerkKeys() 
    ? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!
    : 'pk_test_Y2xlcmsuY2xlcmsuZGV2JA'; // Base64 placeholder that won't work but satisfies format

  // Runtime error for missing keys (only show in browser, not during build)
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

  // Always render ClerkProvider to maintain context for hooks
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        cssLayerName: 'clerk',
        baseTheme: dark,
      }}
    >
      {children}
    </ClerkProvider>
  );
}
