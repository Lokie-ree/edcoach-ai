"use client";

import React, { useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";
import { useUser, useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import TeacherDashboardPageContent from "./components/TeacherDashboardPageContent";
import CoachDashboardPageContent from "./components/CoachDashboardPageContent";
import GridDistortion from "./components/GridDistortion";

// Main Dashboard Component
export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { organization } = useOrganization();
  const router = useRouter();
  
  // Get convex user data
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user && isLoaded ? { clerkId: user.id } : "skip"
  );

  // Debug logging
  useEffect(() => {
    console.log("Dashboard state:", {
      isLoaded,
      hasUser: !!user,
      convexUser: convexUser ? {
        role: convexUser.role,
        onboardingComplete: convexUser.onboardingComplete,
        clerkOrganizationId: convexUser.clerkOrganizationId
      } : "undefined"
    });
  }, [isLoaded, user, convexUser]);

  // Redirect to onboarding if user hasn't completed it
  useEffect(() => {
    if (isLoaded && user && convexUser && !convexUser.onboardingComplete) {
      console.log("Redirecting to onboarding - user has not completed onboarding");
      router.replace('/onboarding');
    }
  }, [isLoaded, user, convexUser, router]);

  // Determine user role and organization info
  const userRole = convexUser?.role;
  const clerkOrganizationId = organization?.id;
  
  // For teachers, get their teacher record
  const teacherRecord = useQuery(
    api.teachers.getByUserClerkId,
    userRole === "teacher" && user ? { clerkId: user.id } : "skip"
  );

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading while waiting for user data
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Show loading while waiting for Convex user data
  if (convexUser === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  // Handle case where user doesn't exist in Convex (shouldn't happen but just in case)
  if (convexUser === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-medium text-destructive mb-2">Account Setup Required</p>
          <p className="text-sm text-muted-foreground mb-4">Your account needs to be set up. Redirecting...</p>
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
        </div>
      </div>
    );
  }

  // Don't render dashboard if onboarding is not complete (redirect will handle this)
  if (!convexUser.onboardingComplete) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Completing setup...</p>
        </div>
      </div>
    );
  }

  // At this point we have a valid user with completed onboarding
  console.log("Rendering dashboard for user:", userRole);

  // Render appropriate dashboard based on role
  return (
    <div className="relative">
      <GridDistortion />

      {userRole === "teacher" ? (
        <TeacherDashboardPageContent
          user={user}
          convexUser={convexUser}
          teacherRecord={teacherRecord}
        />
      ) : (
        <CoachDashboardPageContent
          user={user}
          convexUser={convexUser}
          clerkOrganizationId={clerkOrganizationId!}
        />
      )}
    </div>
  );

}
