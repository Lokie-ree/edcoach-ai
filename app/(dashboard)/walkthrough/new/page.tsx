"use client";

import { WalkthroughWizard } from "@/app/(dashboard)/walkthrough/new/components/WalkthroughWizard";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function NewObservationPage() {
  const { user, isLoaded } = useUser();
  const convexUser = useQuery(api.users.current, user ? {} : "skip");

  useEffect(() => {
    if (isLoaded && user && convexUser) {
      // Only coaches can create walkthroughs
      if (convexUser.role !== "coach") {
        redirect("/dashboard");
      }
    }
  }, [isLoaded, user, convexUser]);

  // Show loading while checking permissions
  if (!isLoaded || !user || !convexUser || convexUser.role !== "coach") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const coachId = convexUser._id as Id<"users">;

  return (
    <div className="min-h-screen">
      {coachId && <WalkthroughWizard coachId={coachId} />}
    </div>
  );
}
