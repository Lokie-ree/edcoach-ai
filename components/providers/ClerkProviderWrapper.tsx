'use client';

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ReactNode } from "react";
import { hasValidClerkKeys, isBuildTime } from "@/lib/build-time";

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

export default function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  // Always provide ClerkProvider with either real or placeholder key
  // Use a properly formatted test key that resembles real Clerk keys
  const publishableKey = hasValidClerkKeys() 
    ? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!
    : 'pk_test_Y2ktdGVzdC1lbnZpcm9ubWVudC5jbGVyay5hY2NvdW50cy5kZXYk'; // CI/test placeholder

  // Only show runtime error in production environments with missing keys
  const isCiOrTest = process.env.CI === 'true' || 
                     process.env.NODE_ENV === 'test' ||
                     isBuildTime();

  if (!hasValidClerkKeys() && typeof window !== 'undefined' && !isCiOrTest) {
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
