"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const currentUser = useQuery(api.users.current);
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user && currentUser) {
      // Check if user is a teacher
      if (currentUser.role !== "teacher") {
        // Redirect to appropriate page based on role
        if (currentUser.role === "coach") {
          router.push("/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    }
  }, [isLoaded, user, currentUser, router]);

  // Show loading while checking permissions
  if (!isLoaded || !user || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not a teacher, show loading while redirecting
  if (currentUser.role !== "teacher") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
