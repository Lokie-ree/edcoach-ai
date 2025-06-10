import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuthRedirect() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user && isLoaded ? { clerkId: user.id } : "skip"
  );

  useEffect(() => {
    if (!isLoaded) return;

    try {
      // Don't redirect during logout process
      if (!user) {
        // Not authenticated - redirect to home only if we're not already there
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          router.replace("/");
        }
        return;
      }

      if (convexUser !== undefined && (!convexUser || !convexUser.onboardingComplete)) {
        // User not set up or onboarding incomplete - redirect to onboarding
        router.replace("/onboarding");
        return;
      }
    } catch (error) {
      console.error('Error in useAuthRedirect:', error);
      // Fallback to home page on error
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        router.replace("/");
      }
    }
  }, [user, isLoaded, convexUser, router]);

  // Return loading state
  const isLoading = !isLoaded || (user && convexUser === undefined);
  const isAuthenticated = user && convexUser && convexUser.onboardingComplete;

  return { isLoading, isAuthenticated, user: convexUser };
} 