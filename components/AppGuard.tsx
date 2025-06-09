"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AppGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitializing, setIsInitializing] = useState(true);
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  // Track when we have all the data we need to make routing decisions
  const hasRequiredData = isLoaded && (user ? convexUser !== undefined : true);

  useEffect(() => {
    if (!hasRequiredData) return;

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/about"];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (user) {
      // User is authenticated with Clerk
      if (convexUser) {
        // We have Convex user data
        if (convexUser.onboardingComplete === true) {
          // Onboarding complete - redirect to dashboard if on public/onboarding routes
          if (isPublicRoute || pathname === "/onboarding") {
            router.replace("/dashboard");
            return;
          }
        } else {
          // Onboarding not complete - redirect to onboarding unless already there
          if (pathname !== "/onboarding") {
            router.replace("/onboarding");
            return;
          }
        }
      } else {
        // User exists in Clerk but not in Convex - needs onboarding
        if (pathname !== "/onboarding") {
          router.replace("/onboarding");
          return;
        }
      }
    } else if (!user && !isPublicRoute && pathname !== "/onboarding") {
      // User not authenticated and trying to access protected route - redirect to home
      router.replace("/");
      return;
    }

    // If we reach here, the user is on the correct page - stop initializing
    setIsInitializing(false);
  }, [hasRequiredData, user, convexUser, pathname, router]);

  // Show loading state during initialization or while waiting for data
  if (!hasRequiredData || isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 