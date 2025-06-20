"use client";

import React from "react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";
import { useUser, useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import TeacherDashboardPageContent from "./components/TeacherDashboardPageContent";
import CoachDashboardPageContent from "./components/CoachDashboardPageContent";
import GridDistortion from "./components/GridDistortion";

// Main Dashboard Component
export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { organization } = useOrganization();
  
  // Get convex user data
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user && isLoaded ? { clerkId: user.id } : "skip"
  );

  // Determine user role and organization info
  const userRole = convexUser?.role;
  const clerkOrganizationId = organization?.id;
  
  // For teachers, get their teacher record
  const teacherRecord = useQuery(
    api.teachers.getByUserClerkId,
    userRole === "teacher" && user ? { clerkId: user.id } : "skip"
  );

  // Early returns for loading states
  if (!isLoaded || (user && convexUser === undefined)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Type guard to ensure we have proper user data
  if (!user || !convexUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
