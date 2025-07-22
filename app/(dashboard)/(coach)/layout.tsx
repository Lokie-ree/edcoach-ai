"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const currentUser = useQuery(api.users.current);

  useEffect(() => {
    if (isLoaded && user && currentUser) {
      // Check if user is a coach
      if (currentUser.role !== "coach") {
        // Redirect to appropriate page based on role
        if (currentUser.role === "teacher") {
          redirect("/growth-journal");
        } else {
          redirect("/dashboard");
        }
      }
    }
  }, [isLoaded, user, currentUser]);

  // Show loading while checking permissions
  if (!isLoaded || !user || !currentUser || currentUser.role !== "coach") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
