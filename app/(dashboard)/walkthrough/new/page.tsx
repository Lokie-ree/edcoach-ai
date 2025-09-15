"use client";

import { WalkthroughWizard } from "@/app/(dashboard)/walkthrough/new/components/WalkthroughWizard";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function NewObservationPage() {
  const { user, isLoaded } = useUser();
  const convexUser = useQuery(api.users.current, user ? {} : "skip");
  const searchParams = useSearchParams();
  const preselectedTeacherId = searchParams.get("teacherId") as Id<"teachers"> | null;
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user && convexUser) {
      // Only coaches can create walkthroughs
      if (convexUser.role !== "coach") {
        router.push("/dashboard");
      }
    }
  }, [isLoaded, user, convexUser, router]);

  // Show loading while checking permissions
  if (!isLoaded || !user || !convexUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not a coach, show loading while redirecting
  if (convexUser.role !== "coach") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <WalkthroughWizard 
        preselectedTeacherId={preselectedTeacherId || undefined} 
      />
    </div>
  );
}
