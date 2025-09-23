"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

// Handle missing environment variable gracefully during build/prerender
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

// Use a placeholder URL during build if missing - won't be used in production
const convex = new ConvexReactClient(
  convexUrl || "https://placeholder.convex.cloud"
);

export default function ConvexClientProvider({
children,
}: {
  children: ReactNode;
}) {
  // Runtime check for missing environment variable
  if (typeof window !== 'undefined' && !convexUrl) {
    console.error("Missing NEXT_PUBLIC_CONVEX_URL in your .env file");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Configuration Error</h2>
          <p className="text-muted-foreground">
            Missing NEXT_PUBLIC_CONVEX_URL environment variable
          </p>
        </div>
      </div>
    );
  }

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
